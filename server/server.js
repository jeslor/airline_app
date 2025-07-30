import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream, streamToResponse } from "ai";

const app = express();
const port = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

const asyncWrapper = require("./utils/asyncWrapper");
const flightsRoutes = require("./routes/flights.routes");

app.get(
  "/",
  asyncWrapper(async (req, res) => {
    const result = streamText({
      model: OpenAI("gpt-4o"),
      prompt: "Invent a new holiday and describe its traditions.",
    });

    console.log(result);

    result.pipeDataStreamToResponse(res);
  })
);

app.use("/api", flightsRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
