const asyncWrapper = require("../utils/asyncWrapper");
const { PrismaClient } = require("@prisma/client");

const getFlights = asyncWrapper(async (req, res) => {
  try {
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
