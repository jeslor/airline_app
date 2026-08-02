import express from "express";
const router = express.Router();
import { getFlights } from "../controllers/flights.controller.js";

router.post("/", getFlights);

export default router;
