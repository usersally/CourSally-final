import z from "zod";
import mongoose from "mongoose";

export const mongoIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

export const sendMessageSchema = z.object({
  receiverId: mongoIdSchema,
  body: z.string().trim().min(1).max(2000),
});

export const threadParamsSchema = z.object({
  userId: mongoIdSchema,
});
