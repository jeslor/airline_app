import { z } from "zod";

// Mirrors client/src/schemas/FlightBookingSchema.ts. Duplicated rather than
// shared because client and server are separate packages/deployments, not a
// monorepo with a shared package.
//
// The client normalizes round trip / one way / multi city into this same
// `legs` shape before submitting (1 leg = one-way, 2 = round trip, 3+ =
// multi-city), so the server never needs to know about tripType at all.
const legSchema = z.object({
  origin: z.string().trim().min(2).max(100),
  destination: z.string().trim().min(2).max(100),
  date: z.coerce.date(),
});

export const flightSearchSchema = z.object({
  legs: z.array(legSchema).min(1).max(6),
  passengers: z.coerce.number().int().min(1).max(9).optional().default(1),
  cabinClass: z
    .enum(["economy", "premiumEconomy", "business", "first"])
    .optional()
    .default("economy"),
});
