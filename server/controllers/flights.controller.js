import { cleanAIJsonResponse } from "../utils/helpers.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import genAI from "../configs/GoogleAIService.js";

const getFlights = asyncWrapper(async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    console.log("Received prompt:", body);

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

    console.log("Generated text:", cleanAIJsonResponse(text));

    res.status(200).json({ result: cleanAIJsonResponse(text) });
  } catch (error) {
    console.error("Error in / route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { getFlights };
