import { z } from "zod";

export const flightBookingSchema = z
  .object({
    tripType: z.enum(["roundTrip", "oneWay", "multiCity"], {
      error: "Trip type is required.",
    }),
    origin: z.string().min(3, "Origin airport is required."),
    destination: z.string().min(3, "Destination airport is required."),
    departDate: z.date(),
    returnDate: z.date().optional(), // Initially optional
    passengers: z
      .number()
      .min(1, "At least 1 passenger is required.")
      .max(9, "Maximum 9 passengers."),
    cabinClass: z.enum(["economy", "premiumEconomy", "business", "first"], {
      error: "Cabin class is required.",
    }),
  })
  .refine(
    (data) => {
      if (data.tripType === "roundTrip") {
        return data.returnDate instanceof Date;
      }
      return true;
    },
    {
      message: "Return date is required for round trips.",
      path: ["returnDate"],
    }
  )
  .refine(
    (data) => {
      if (data.departDate && data.returnDate) {
        // Normalize dates to start of day for accurate comparison
        const depart = new Date(data.departDate.setHours(0, 0, 0, 0));
        const ret = new Date(data.returnDate.setHours(0, 0, 0, 0));
        return ret >= depart;
      }
      return true;
    },
    {
      message: "Return date cannot be before departure date.",
      path: ["returnDate"],
    }
  );
