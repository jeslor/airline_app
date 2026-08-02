import { cleanAIJsonResponse } from "../utils/helpers.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import genAI from "../configs/GoogleAIService.js";
import { signOffer } from "../utils/offerSigning.js";
import { flightSearchSchema } from "../schemas/flightSearch.schema.js";
import AppError from "../utils/appError.js";

function buildLegPrompt(leg) {
  return `
You are a flight data generator. Generate realistic flight data from ${leg.origin} to ${leg.destination} on ${leg.date}.

Return ONLY valid JSON with NO text before or after. Use this EXACT structure:
{
  "flights": [
    {
      "airline": "Quencer Airlines",
      "flightNumber": "QF1234",
      "departureCity": "New York",
      "arrivalCity": "Los Angeles",
      "departureAirportCode": "JFK",
      "arrivalAirportCode": "LAX",
      "departureDate": "January 15, 2025",
      "arrivalDate": "January 15, 2025",
      "departureTime": "08:00 AM",
      "arrivalTime": "11:30 AM",
      "flightDuration": "5h 30m",
      "aircraftType": "Boeing 737-800",
      "price": 450,
      "layovers": [
        {
          "city": "Chicago",
          "airportCode": "ORD",
          "flightNumber": "QF5678",
          "arrivalTime": "09:45 AM",
          "departureTime": "11:15 AM",
          "duration": "1h 30m"
        }
      ]
    }
  ]
}

IMPORTANT RULES:
- Generate at least 5 flight options
- All airlines must be "Quencer Airlines"
- Flight numbers format: QF#### (4 digits)
- Dates in human-readable format: "Month Day, Year" (e.g., "January 15, 2025")
- Times in 12-hour format with AM/PM
- price must be a NUMBER (not string), between 200-2000
- layovers is an array (empty [] if non-stop, or contains layover objects)
- For each layover: "arrivalTime" is when that leg lands at the layover airport, "departureTime" is when the connecting flight departs from it - both in the same 12-hour AM/PM format, and departureTime must be later than arrivalTime by roughly the stated "duration"
- The first leg's flight number is the flight's own "flightNumber"; each layover's "flightNumber" is the connecting flight operating the next leg
- Include variety: some non-stop, some with 1-2 layovers
- Use realistic aircraft types: Boeing 737, Boeing 777, Airbus A320, Airbus A350, etc.
`;
}

async function generateLegFlights(model, leg) {
  const result = await model.generateContent(buildLegPrompt(leg));
  const text = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(cleanAIJsonResponse(text));
  } catch (e) {
    console.error("❌ Failed to parse JSON from Gemini for leg:", leg, e);
    throw new AppError(
      "Failed to generate flight data for one of the requested legs. Please try again.",
      502
    );
  }

  const flights = (parsed.flights || []).map(signOffer);
  return { origin: leg.origin, destination: leg.destination, date: leg.date, flights };
}

const getFlights = asyncWrapper(async (req, res) => {
  const parsed = flightSearchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      `Invalid search request: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      400
    );
  }
  const { legs } = parsed.data;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  // One independent Gemini call per leg (rather than one large prompt
  // asking for every leg at once) - simpler to validate/parse per leg,
  // and runs concurrently instead of serially.
  const legResults = await Promise.all(
    legs.map((leg) => generateLegFlights(model, leg))
  );

  res.status(200).json({ legs: legResults });
});

export { getFlights };
