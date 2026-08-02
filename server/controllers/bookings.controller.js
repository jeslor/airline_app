import asyncWrapper from "../utils/asyncWrapper.js";
import AppError from "../utils/appError.js";
import prisma from "../utils/prismaClient.js";
import { getStripe } from "../utils/stripeClient.js";
import { createBookingSchema } from "../schemas/booking.schema.js";
import { verifyOffer } from "../utils/offerSigning.js";
import { generateBookingReference } from "../utils/ticketAndBookingGenerator.js";

const MAX_REFERENCE_ATTEMPTS = 5;

async function createBookingWithUniqueReference(data) {
  for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt++) {
    const bookingReference = generateBookingReference();
    try {
      return await prisma.booking.create({
        data: { ...data, bookingReference },
      });
    } catch (error) {
      const isLastAttempt = attempt === MAX_REFERENCE_ATTEMPTS - 1;
      if (error.code === "P2002" && !isLastAttempt) {
        continue; // bookingReference collision - regenerate and retry
      }
      throw error;
    }
  }
}

const createBooking = asyncWrapper(async (req, res) => {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(
      `Invalid booking request: ${parsed.error.issues
        .map((issue) => issue.message)
        .join(", ")}`,
      400
    );
  }

  const { passenger, outboundFlight, returnFlight, bookingDate, bookingTime } =
    parsed.data;

  // Never trust a client-submitted price - only charge for offers we signed
  // ourselves and that haven't expired.
  if (!verifyOffer(outboundFlight) || !verifyOffer(returnFlight)) {
    throw new AppError(
      "One or more selected flights could not be verified. Please search again.",
      400
    );
  }

  const currency = "usd";
  const amountTotal = Math.round(
    (outboundFlight.price + returnFlight.price) * 100
  );

  const booking = await createBookingWithUniqueReference({
    status: "PENDING_PAYMENT",
    passenger,
    outboundFlight,
    returnFlight,
    currency,
    amountTotal,
    bookingDate,
    bookingTime,
  });

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountTotal,
      currency,
      metadata: { bookingReference: booking.bookingReference },
      automatic_payment_methods: { enabled: true },
    },
    { idempotencyKey: booking.bookingReference }
  );

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  res.status(201).json({
    message: "Booking created, awaiting payment",
    data: {
      bookingReference: booking.bookingReference,
      clientSecret: paymentIntent.client_secret,
      amountTotal,
      currency,
    },
  });
});

function serializeBooking(booking) {
  return {
    bookingReference: booking.bookingReference,
    status: booking.status,
    passenger: booking.passenger,
    outboundFlight: booking.outboundFlight,
    returnFlight: booking.returnFlight,
    amountTotal: booking.amountTotal,
    currency: booking.currency,
    ticketNumber: booking.ticketNumber,
    seatNumberOutbound: booking.seatNumberOutbound,
    seatNumberReturn: booking.seatNumberReturn,
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
  };
}

const getBookingByReference = asyncWrapper(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { bookingReference: req.params.reference },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  res.status(200).json({ data: serializeBooking(booking) });
});

export { createBooking, getBookingByReference };
