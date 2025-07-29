const express = require("express");
const router = express.Router();
const { getFlights } = require("../controllers/flights.controller");

router.post("/flights", getFlights);
