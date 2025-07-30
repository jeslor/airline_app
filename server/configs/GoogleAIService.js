import dotenv from "dotenv";
dotenv.config({ path: "./server.env" });
import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error(
    "Error: API_KEY not found in environment variables. Please set it in a .env file."
  );
  throw new Error("Google Generative AI API_KEY is not configured.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export default genAI;
