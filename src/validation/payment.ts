import z from "zod";
import { mongoIdSchema } from "./utils.js";

export const paymentParamsSchema = z.object({
  id: mongoIdSchema,
});
