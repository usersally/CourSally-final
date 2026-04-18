import z from "zod";
import { Types } from "mongoose";

const mongoIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

//enrollment validation schema (create)

export const enrollmentSchema = z.object({
  student: mongoIdSchema,
  course: mongoIdSchema,

  status: z.enum(["active", "completed", "cancelled"]).optional(),

  progress: z.number().min(0).max(100).optional(),
});

//enrollment validation schema
export const updateEnrollmentSchema = enrollmentSchema.partial();
