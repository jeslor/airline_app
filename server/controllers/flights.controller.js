import { cleanAIJsonResponse } from "../utils/helpers.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import genAI from "../configs/GoogleAIService.js";

const getFlights = asyncWrapper(async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const prompt = `
 You are a special travel agent, search the web for the best flights available  from ${body.origin} to ${body.destination} on ${body.departDate}  and ${body.returnDate}.
 - make sure the data you return is an object with the following properties:
    - make sure you find both outboundFlights and returnFlights: {outboundFlights: [], returnFlights: []}
    - make sure you include the aircraft type, flight number, departure and arrival times, and the airline.
    - Include the price for each flight option.
    - Make sure you return at least 7 options.
    - make sure you arrange the information for example Departure , arrival and any layovers in individual properties.
    -This information is going to be used to generate a demo flight ticket so include the dates and times in a human-readable format, plus other relevant details.
    - Respond with a valid JSON array of objects. No text before or after.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let flights = [];

    try {
      flights = cleanAIJsonResponse(text);
      flights = JSON.parse(flights); // 🔥 Convert string to array
    } catch (e) {
      console.error("❌ Failed to parse JSON from Gemini:", e);
      return res.status(500).json({
        message: "Failed to parse flight data. Please try again.",
        raw: text,
      });
    }

    res.status(200).json({ flights });
  } catch (error) {
    console.error("Error in / route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { getFlights };
