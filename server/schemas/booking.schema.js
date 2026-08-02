import { z } from "zod";

// A "flight offer" is whatever /api/flights returned, plus the
// offerId/issuedAt/signature stamped on by signOffer(). We only require the
// fields we actually depend on here and let the rest pass through so the
// full offer (city names, aircraft type, layovers, etc.) is preserved for
// the ticket/email/DB snapshot.
const offerSchema = z
  .object({
    offerId: z.string().min(1),
    issuedAt: z.number(),
    signature: z.string().min(1),
    price: z.number().positive(),
    flightNumber: z.string().min(1),
    departureAirportCode: z.string().min(1),
    arrivalAirportCode: z.string().min(1),
    departureDate: z.string().min(1),
    departureTime: z.string().min(1),
  })
  .passthrough();

// Mirrors client/src/schemas/PersonalDetailsSchema.ts.
const passengerSchema = z.object({
  title: z.string().trim().min(1).max(20),
  firstName: z.string().trim().min(2).max(60),
  lastName: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  country: z.string().trim().min(2).max(60),
  phoneNumber: z.string().trim().min(7).max(25),
});

export const createBookingSchema = z.object({
  passenger: passengerSchema,
  flights: z.array(offerSchema).min(1).max(6),
  bookingDate: z.string().min(1),
  bookingTime: z.string().min(1),
});
