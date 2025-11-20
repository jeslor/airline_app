import dotenv from "dotenv";
dotenv.config({ path: "./server.env" });

import express from "express";
import bodyParser from "body-parser";

import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import flightsRoutes from "./routes/flights.routes.js";
import asyncWrapper from "./utils/asyncWrapper.js";

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS explicitly so preflight (OPTIONS) responses include the
// necessary Access-Control-* headers. Use ALLOWED_ORIGINS env var (comma-separated)
// to specify allowed origins in production (e.g., your Vercel frontend).
function parseOrigins(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((u) => {
      try {
        return new URL(u).origin;
      } catch (_) {
        return u;
      }
    });
}

const envAllowed = parseOrigins(
  process.env.ALLOWED_ORIGINS || process.env.VITE_API_URL || ""
);
const defaultLocal = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = Array.from(new Set([...envAllowed, ...defaultLocal]));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like server-to-server or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Ensure preflight requests are handled for all routes
app.options("*", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

app.get(
  "/",
  asyncWrapper(async (req, res) => {
    try {
      res.json({ message: "Welcome to the Airline App API" });
    } catch (error) {
      console.error("Error in / route:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

app.use("/api", flightsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
