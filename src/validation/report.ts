import z from "zod";
import mongoose from "mongoose";

const mongoIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const createReportSchema = z.object({
  reportedUserId: mongoIdSchema,
  reason: z.enum([
    "harassment",
    "inappropriate_content",
    "no_show",
    "fraud",
    "spam",
    "other",
  ]),
  details: z.string().trim().max(1000).optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(["pending", "resolved", "dismissed"]),
  adminNote: z.string().trim().max(500).optional(),
});
