import dotenv from "dotenv";
dotenv.config({ path: "./server.env" });

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import flightsRoutes from "./routes/flights.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import webhooksRoutes from "./routes/webhooks.routes.js";
import asyncWrapper from "./utils/asyncWrapper.js";
import { closeBrowser } from "./utils/pdfHelper.js";

const app = express();
const port = process.env.PORT || 3000;

// Render (and most PaaS hosts) sit in front of the app as a reverse proxy
// and set X-Forwarded-For to the real client IP. Trusting exactly one hop
// tells Express/express-rate-limit to use that header for req.ip instead of
// the proxy's own IP - without this, every request looks like it comes from
// the same address, and express-rate-limit refuses to guess and throws.
app.set("trust proxy", 1);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : false,
  })
);
app.use(helmet());

// Stripe webhook signature verification needs the exact raw request bytes,
// so this route is mounted (with its own express.raw() middleware, see
// webhooks.routes.js) before the JSON body-parser below applies to
// everything else.
app.use("/api/webhooks", webhooksRoutes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

app.get(
  "/",
  asyncWrapper(async (req, res) => {
    res.json({ message: "Welcome to the Airline App API" });
  })
);

// AI flight generation is the most expensive/abusable route (Gemini quota),
// so it gets its own rate limit here. Booking creation vs. booking lookup
// need very different limits from each other, so those are rate-limited
// per-route inside bookings.routes.js instead of with one blanket limiter.
const flightsLimiter = rateLimit({ windowMs: 60_000, limit: 10 });

app.use("/api/flights", flightsLimiter, flightsRoutes);
app.use("/api/bookings", bookingsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Centralized error handler - controllers throw AppError (or let unexpected
// errors bubble up via asyncWrapper) instead of each repeating its own
// try/catch/500 boilerplate.
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (!err.isOperational) {
    console.error(err);
  }
  res.status(statusCode).json({
    message: err.isOperational ? err.message : "Internal server error",
  });
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function shutdown() {
  await closeBrowser();
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
