import asyncWrapper from "../utils/asyncWrapper";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getAirlines = asyncWrapper(async (req, res) => {
  const airlines = await prisma.airline.findMany({
    orderBy: {
      name: "asc",
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      airlines,
    },
  });
});
