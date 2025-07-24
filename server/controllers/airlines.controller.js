import asyncWrapper from "../utils/asyncWrapper";

const getAirlines = asyncWrapper(async (req, res) => {
  const airlines = await Airline.find({});
  res.status(200).json({
    status: "success",
    data: {
      airlines,
    },
  });
});
