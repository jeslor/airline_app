import express from "express";
import { handleStripeWebhook } from "../controllers/webhooks.controller.js";

const router = express.Router();

// Stripe's signature verification needs the raw request body, so this route
// must NOT go through the JSON body-parser used by the rest of the app -
// see server.js, where this router is mounted before express.json().
router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

export default router;
