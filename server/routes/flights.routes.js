import express from "express";
const router = express.Router();
import { bookFlight, getFlights } from "../controllers/flights.controller.js";
import chromium from "chrome-aws-lambda";

console.log("Chrome executable:", await chromium.executablePath);

router.post("/flights", getFlights);
router.post("/book", bookFlight);

export default router;
