import { z } from "zod";

// Mirrors client/src/schemas/FlightBookingSchema.ts. Duplicated rather than
// shared because client and server are separate packages/deployments, not a
// monorepo with a shared package.
export const flightSearchSchema = z.object({
  tripType: z
    .enum(["roundTrip", "oneWay", "multiCity"])
    .optional()
    .default("roundTrip"),
  origin: z.string().trim().min(2).max(100),
  destination: z.string().trim().min(2).max(100),
  departDate: z.coerce.date(),
  returnDate: z.coerce.date().optional(),
  passengers: z.coerce.number().int().min(1).max(9).optional().default(1),
  cabinClass: z
    .enum(["economy", "premiumEconomy", "business", "first"])
    .optional()
    .default("economy"),
});
