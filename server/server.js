import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import flightsRoutes from "./routes/flights.routes.js";
import asyncWrapper from "./utils/asyncWrapper.js";

dotenv.config("./server.env");
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
      const { prompt } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({ result: text });
    } catch (error) {}
  })
);

app.use("/api", flightsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
