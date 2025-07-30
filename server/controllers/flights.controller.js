import express from "express";
import asyncWrapper from "../utils/asyncWrapper.js";

const getFlights = asyncWrapper(async (req, res) => {
  try {
    return res.status(200).json(flights);
  } catch (error) {
    console.error("Error fetching flights:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export { getFlights };
