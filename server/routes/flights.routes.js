import express from "express";
const router = express.Router();
import { bookFlight, getFlights } from "../controllers/flights.controller.js";

router.post("/flights", getFlights);
router.post("/book-flight", bookFlight);

export default router;
