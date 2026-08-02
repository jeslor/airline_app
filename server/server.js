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

// AI flight generation and booking/payment creation are the two most
// expensive/abusable routes (Gemini quota, Stripe/email spam), so they get
// their own rate limits.
const flightsLimiter = rateLimit({ windowMs: 60_000, limit: 10 });
const bookingsLimiter = rateLimit({ windowMs: 60_000, limit: 5 });

app.use("/api/flights", flightsLimiter, flightsRoutes);
app.use("/api/bookings", bookingsLimiter, bookingsRoutes);

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
