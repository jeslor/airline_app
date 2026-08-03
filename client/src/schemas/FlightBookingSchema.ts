import { z } from "zod";

// `legs` intentionally has no structural constraints here (no min-length,
// no required date) - it always holds 2 empty placeholder rows in the form
// even for roundTrip/oneWay (so switching to multiCity has somewhere to
// start from), and a strict per-field schema here would validate those
// placeholders unconditionally and permanently fail the form for every
// trip type. All real validation (including per-field error messages) is
// done in superRefine below, scoped to when it actually applies.
const legShape = z.object({
  origin: z.string(),
  destination: z.string(),
  date: z.date().optional(),
});

export const flightBookingSchema = z
  .object({
    tripType: z.enum(["roundTrip", "oneWay", "multiCity"], {
      error: "Trip type is required.",
    }),
    // Used for roundTrip/oneWay. multiCity uses `legs` instead.
    origin: z.string().optional(),
    destination: z.string().optional(),
    departDate: z.date().optional(),
    returnDate: z.date().optional(),
    passengers: z
      .number()
      .min(1, "At least 1 passenger is required.")
      .max(9, "Maximum 9 passengers."),
    cabinClass: z.enum(["economy", "premiumEconomy", "business", "first"], {
      error: "Cabin class is required.",
    }),
    legs: z.array(legShape).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tripType === "multiCity") {
      const legs = data.legs || [];
      if (legs.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Add at least 2 flights for a multi-city trip.",
          path: ["legs"],
        });
      }
      legs.forEach((leg, index) => {
        if (!leg.origin || leg.origin.length < 3) {
          ctx.addIssue({
            code: "custom",
            message: "Origin airport is required.",
            path: ["legs", index, "origin"],
          });
        }
        if (!leg.destination || leg.destination.length < 3) {
          ctx.addIssue({
            code: "custom",
            message: "Destination airport is required.",
            path: ["legs", index, "destination"],
          });
        }
        if (!(leg.date instanceof Date)) {
          ctx.addIssue({
            code: "custom",
            message: "Date is required.",
            path: ["legs", index, "date"],
          });
        }
      });
      return;
    }

    if (!data.origin || data.origin.length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Origin airport is required.",
        path: ["origin"],
      });
    }
    if (!data.destination || data.destination.length < 3) {
      ctx.addIssue({
        code: "custom",
        message: "Destination airport is required.",
        path: ["destination"],
      });
    }
    if (!(data.departDate instanceof Date)) {
      ctx.addIssue({
        code: "custom",
        message: "Departure date is required.",
        path: ["departDate"],
      });
    }
    if (data.tripType === "roundTrip" && !(data.returnDate instanceof Date)) {
      ctx.addIssue({
        code: "custom",
        message: "Return date is required for round trips.",
        path: ["returnDate"],
      });
    }
    if (data.departDate && data.returnDate) {
      const depart = new Date(data.departDate.getTime());
      depart.setHours(0, 0, 0, 0);
      const ret = new Date(data.returnDate.getTime());
      ret.setHours(0, 0, 0, 0);
      if (ret < depart) {
        ctx.addIssue({
          code: "custom",
          message: "Return date cannot be before departure date.",
          path: ["returnDate"],
        });
      }
    }
  });

export type FlightBookingSchema = z.infer<typeof flightBookingSchema>;
