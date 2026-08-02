import prisma from "../utils/prismaClient.js";
import { getStripe } from "../utils/stripeClient.js";
import { deliverTicket } from "../utils/ticketDelivery.js";
import {
  generateSeatNumbers,
  generateTicketNumber,
} from "../utils/ticketAndBookingGenerator.js";

// The webhook - not the client's confirmPayment() call - is the source of
// truth for whether a booking is actually paid. It must be idempotent:
// Stripe may deliver the same event more than once.
async function handlePaymentSucceeded(paymentIntent) {
  const bookingReference = paymentIntent.metadata?.bookingReference;
  if (!bookingReference) return;

  const ticketNumber = generateTicketNumber();
  const seatNumberOutbound = generateSeatNumbers();
  const seatNumberReturn = generateSeatNumbers();

  // Atomic guard: only the delivery of this event that actually flips the
  // status away from CONFIRMED gets to send the ticket. MongoDB applies the
  // filter per-document atomically, so concurrent/duplicate deliveries can't
  // both pass this check.
  const result = await prisma.booking.updateMany({
    where: { bookingReference, status: { not: "CONFIRMED" } },
    data: { status: "CONFIRMED", ticketNumber, seatNumberOutbound, seatNumberReturn },
  });

  if (result.count === 0) {
    return; // already confirmed by an earlier delivery of this event
  }

  const booking = await prisma.booking.findUnique({ where: { bookingReference } });
  if (!booking) return;

  try {
    await deliverTicket(booking);
  } catch (error) {
    // PDF/email delivery failed after we'd already marked this CONFIRMED.
    // Revert so the idempotency guard above doesn't treat this as "already
    // done" - a Stripe retry (triggered by the 500 this throw causes) needs
    // to actually re-attempt delivery, not silently no-op forever.
    await prisma.booking.update({
      where: { bookingReference },
      data: { status: "PENDING_PAYMENT" },
    });
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent) {
  const bookingReference = paymentIntent.metadata?.bookingReference;
  if (!bookingReference) return;

  await prisma.booking.updateMany({
    where: { bookingReference, status: "PENDING_PAYMENT" },
    data: { status: "FAILED" },
  });
}

const handleStripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    // req.body is the raw Buffer here (see express.raw() on this route in
    // webhooks.routes.js) - Stripe's signature check requires the exact
    // bytes it sent, not a re-serialized JSON object.
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("⚠️ Stripe webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;
      default:
        break;
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Error handling Stripe webhook event:", error);
    // 500 tells Stripe to retry delivery - our handlers are idempotent.
    res.status(500).json({ message: "Webhook handler failed" });
  }
};

export { handleStripeWebhook };
