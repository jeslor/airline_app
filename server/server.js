import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import flightsRoutes from "./routes/flights.routes.js";
import asyncWrapper from "./utils/asyncWrapper.js";

dotenv.config({ path: "./server.env" });
const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

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
      const prompt = `
      You are a special travel agent, search the web for the best flights available  from Frankfurt to NewYork on 3rd July 2025  and return the best options.
      -Make sure to include the flight number, departure and arrival times, and the airline.
      -Make sure you return atleast 7 options.
      - make sure you arrange the information for example Departure , arrival and any layovers in individual properties.
            -This information is going to be used to generate a demo flight ticket so include the dates and times in a human-readable format, plus other relevant details.
      -Return the results in a JSON format.
      `;
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-001",
      });
      const result = await model.generateContent(prompt);
      const response = result.response;

      const text = response.text();

      console.log("Generated text:", text);

      res.json({ result: text });
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
