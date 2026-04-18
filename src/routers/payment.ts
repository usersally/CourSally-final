import { Router } from "express";
import {
  createPayement,
  getPaymentById,
  deletePayment,
} from "../handlers/payment.js";

import { validateBodySchema } from "../middlewares/validations.js";
import { validateParamsSchema } from "../middlewares/validations.js";
import { validateQuerySchema } from "../middlewares/validations.js";

import {
  createPaymentSchema,
  paymentParamsSchema,
  paymentQuerySchema,
} from "../validation/payment.js";

const router = Router();

/**
 * CREATE payment
 */
router.post("/", validateBodySchema(createPaymentSchema), createPayement);

/**
 * GET all payments (with filters + pagination)
 */
router.get("/", validateQuerySchema(paymentQuerySchema), getPaymentById);

/**
 * GET single payment
 */
router.get("/:id", validateParamsSchema(paymentParamsSchema), getPaymentById);

/**
 * DELETE payment
 */
router.delete("/:id", validateParamsSchema(paymentParamsSchema), deletePayment);

export default router;
