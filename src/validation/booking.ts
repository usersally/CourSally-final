import z from "zod";
import mongoose from "mongoose";
import { normalizeTime } from "../utils/time.js";

export const mongoIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

const timeSchema = z
  .string()
  .transform(normalizeTime)
  .refine((val) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), {
    message: "Time must be HH:mm",
  });

export const createBookingSchema = z.object({
  teacherId: mongoIdSchema,
  courseId: mongoIdSchema.optional(),
  studentId: mongoIdSchema.optional(),

  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),

  startTime: timeSchema,
  endTime: timeSchema,

  price: z.coerce.number().nonnegative(),

  paymentType: z.enum(["single", "monthly"]),
  paymentMethod: z.enum(["cash", "card"]),
});
