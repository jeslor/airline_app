import express from "express";
import rateLimit from "express-rate-limit";
import { createBooking, getBookingByReference } from "../controllers/bookings.controller.js";

const router = express.Router();

// Creating a booking triggers a Stripe PaymentIntent, so this stays tight
// to deter payment/email abuse.
const createBookingLimiter = rateLimit({ windowMs: 60_000, limit: 5 });

// The client polls this endpoint every ~1.5s (see PaymentStep.tsx) while
// waiting for the Stripe webhook to confirm a single booking, which alone
// is ~13 requests in 20s - this needs real headroom, not the same budget
// as booking creation.
const lookupBookingLimiter = rateLimit({ windowMs: 60_000, limit: 60 });

router.post("/", createBookingLimiter, createBooking);
router.get("/:reference", lookupBookingLimiter, getBookingByReference);

export default router;
