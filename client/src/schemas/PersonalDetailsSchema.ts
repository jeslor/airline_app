import { z } from "zod";

export const personalDetailsSchema = z.object({
  title: z.string().min(2, {
    message: "Your title must be at least 2 characters.",
  }),
  firstName: z.string().min(2, {
    message: "Your first name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Your last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Your email must be a valid email address.",
  }),
  country: z.string().min(2, {
    message: "Your country must be at least 2 characters.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Your phone number must be at least 10 digits.",
  }),
});
export type PersonalDetailsSchema = z.infer<typeof personalDetailsSchema>;
