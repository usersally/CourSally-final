import { z } from "zod/v4";
import { mongoIdSchema } from "./utils.js";

/**
 * Base teacher schema
 */
const teacherBaseSchema = z.object({
  firstName: z.string().min(1, "Name is required"),

  subjects: z
    .array(z.string().min(1))
    .min(1, "At least one subject is required"),

  bio: z.string().min(10, "Description must be at least 10 characters long"),

  levels: z.array(z.string().min(1)).min(1, "At least one level is required"),

  pricePerHour: z.number().min(0, "Price per hour must be positive"),

  pricePerMonth: z
    .number()
    .min(0, "Price per month must be positive")
    .optional(),

  availability: z
    .array(
      z.object({
        day: z.string().min(1, "Day is required"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
      }),
    )
    .optional(),

  keywords: z.array(z.string()).optional(),
});

/**
 * Create teacher schema
 */
export const teacherSchema = teacherBaseSchema.refine(
  (data) => {
    if (!data.availability) return true;

    return data.availability.every((slot) => slot.startTime < slot.endTime);
  },
  {
    message: "Start time must be before end time",
    path: ["availability"],
  },
);

/**
 * Update teacher schema
 */
export const teacherUpdateSchema = teacherBaseSchema.partial();

/**
 * Teacher query schema for GET /api/teachers
 */
export const teacherQuerySchema = z.object({
  page: z
    .string()
    .default("1")
    .transform(Number)
    .pipe(z.number().int().min(1, "Page must be a positive integer")),

  limit: z
    .string()
    .default("10")
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(1, "Limit must be a positive integer")
        .max(100, "Limit cannot exceed 100"),
    ),

  sortBy: z
    .enum(["createdAt", "firstName", "pricePerHour"])
    .optional()
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc")
    .transform((val) => (val === "asc" ? 1 : -1) as 1 | -1),

  search: z.string().optional(),
  subject: z.string().optional(),

  pricePerHour: z.string().transform(Number).pipe(z.number().min(0)).optional(),

  pricePerMonth: z
    .string()
    .transform(Number)
    .pipe(z.number().min(0))
    .optional(),

  inSchool: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

/**
 * Params schema for teacher rating routes
 */
export const teacherRatingParamsSchema = z.object({
  id: mongoIdSchema,
  ratingId: mongoIdSchema,
});
