import { cleanAIJsonResponse } from "../utils/helpers.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import genAI from "../configs/GoogleAIService.js";
import { signOffer } from "../utils/offerSigning.js";
import { flightSearchSchema } from "../schemas/flightSearch.schema.js";
import AppError from "../utils/appError.js";

const getFlights = asyncWrapper(async (req, res) => {
  const parsed = flightSearchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      `Invalid search request: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      400
    );
  }
  const body = parsed.data;

  const prompt = `
You are a flight data generator. Generate realistic flight data from ${body.origin} to ${body.destination} on ${body.departDate} and return on ${body.returnDate}.

Return ONLY valid JSON with NO text before or after. Use this EXACT structure:
{
  "outboundFlights": [
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
  ],
  "returnFlights": [
    {
      "airline": "Quencer Airlines",
      "flightNumber": "QF4321",
      "departureCity": "Los Angeles",
      "arrivalCity": "New York",
      "departureAirportCode": "LAX",
      "arrivalAirportCode": "JFK",
      "departureDate": "January 20, 2025",
      "arrivalDate": "January 20, 2025",
      "departureTime": "02:00 PM",
      "arrivalTime": "10:30 PM",
      "flightDuration": "5h 30m",
      "aircraftType": "Airbus A320",
      "price": 480,
      "layovers": []
    }
  ]
}

IMPORTANT RULES:
- Generate at least 5 flight options for BOTH outboundFlights AND returnFlights
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

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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

  // Sign every offer so /api/bookings can later verify the passenger's
  // chosen flights (and prices) actually came from this response.
  flights.outboundFlights = (flights.outboundFlights || []).map(signOffer);
  flights.returnFlights = (flights.returnFlights || []).map(signOffer);

  res.status(200).json({ flights });
});

export { getFlights };
