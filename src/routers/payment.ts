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

const paymentRouter = Router();


/**
 * GET all payments (with filters + pagination)
*/
paymentRouter.get("/", validateQuerySchema(paymentQuerySchema), getPaymentById);
/**
 * CREATE payment
 */
paymentRouter.post(
  "/:id",
    validateParamsSchema(paymentParamsSchema),
  validateBodySchema(createPaymentSchema),
  createPayement,
);

/**
 * GET single payment
 */
paymentRouter.get(
  "/:id",
  validateParamsSchema(paymentParamsSchema),
  getPaymentById,
);

/**
 * DELETE payment
 */
paymentRouter.delete(
  "/:id",
  validateParamsSchema(paymentParamsSchema),
  deletePayment,
);

export default paymentRouter;
