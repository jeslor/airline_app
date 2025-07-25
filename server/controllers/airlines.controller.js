const asyncWrapper = require("../utils/asyncWrapper");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAirlines = asyncWrapper(async (req, res) => {
  try {
    const airlines = await prisma.airline.findMany({
      orderBy: {
        name: "asc",
      },
    });
    if (!airlines || airlines.length === 0) {
      return res.status(404).json({ message: "No airlines found" });
    }
    return res.status(200).json(airlines);
  } catch (error) {}
});

export default {
  getAirlines,
};
