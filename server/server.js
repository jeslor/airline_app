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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // your domain or specific origins
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
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
