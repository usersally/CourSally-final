import z from "zod";
import { mongoIdSchema } from "./utils.js";

const scheduleShema = z.object({
  course: mongoIdSchema,
  teacher: mongoIdSchema,

  dayOfWeek: z.number().min(0).max(7),

  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),

  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),

  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),

  isActive: z.boolean().optional(),
});

export default scheduleShema;
