import z from "zod";
import mongoose from "mongoose";

//  ObjectId validator
export const mongoIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

//  create booking validation
export const createBookingSchema = z.object({
  teacherId: mongoIdSchema,
  studentId: mongoIdSchema.optional(),

  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),

  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "startTime must be HH:mm",
  }),

  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "endTime must be HH:mm",
  }),

  price: z.number().positive(),

  paymentType: z.enum(["single", "monthly"]),
  paymentMethod: z.enum(["cash", "card"]),
});
