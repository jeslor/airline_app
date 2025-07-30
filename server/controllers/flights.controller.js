const asyncWrapper = require("../utils/asyncWrapper");
const { openai } = require("@ai-sdk/openai");
const { streamText } = require("ai");

const getFlights = asyncWrapper(async (req, res) => {
  try {
    const result = await streamText({
      model: openai("gpt-4o"),
      prompt: "Invent a new holiday and describe its traditions.",
    });

    result.pipeDataStreamToResponse(res);

    if (!flights || flights.length === 0) {
      return res.status(404).json({ message: "No flights found" });
    }
    return res.status(200).json(flights);
  } catch (error) {
    console.error("Error fetching flights:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = {
  getFlights,
};
