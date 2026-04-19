import { z } from "zod";
import { mongoIdSchema } from "./utils.js";

/**
 * Params (/:id)
 */
export const paymentParamsSchema = z.object({
  id: mongoIdSchema,
});

/**
 * Create Payment (POST)
 */
export const createPaymentSchema = z.object({
  userId: mongoIdSchema,
  amount: z.number().positive(),
  currency: z.string().length(3).optional().default("USD"),

  method: z.enum(["card", "cash"]),

  status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),

  description: z.string().max(500).optional(),
});

/**
 * Update Payment (PUT)
 * (all fields optional)
 */
export const updatePaymentSchema = createPaymentSchema.partial();

/**
 * Query (GET /payments)
 */
export const paymentQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),

  userId: mongoIdSchema.optional(),

  status: z.enum(["pending", "completed", "failed", "refunded"]).optional(),

  method: z.enum(["card", "cash"]).optional(),
});
