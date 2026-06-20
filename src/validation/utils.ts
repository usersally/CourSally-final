import { z } from "zod/v4";

export const mongoIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ID format");

export const isPdfFile = (value: string): boolean => {
  const trimmed = value.trim();
  if (trimmed.startsWith("data:application/pdf")) return true;
  if (trimmed.startsWith("data:application/octet-stream")) return true;
  return trimmed.toLowerCase().endsWith(".pdf");
};
// validate pdf
export const createUserSchema = z
  .object({
    role: z.enum(["admin", "student", "teacher"]),
    cv: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "teacher") {
        return data.cv && isPdfFile(data.cv);
      }
      return true;
    },
    {
      message: "CV is required and must be a PDF for teachers",
      path: ["cv"],
    },
  );

export const paginationSchema = z.object({
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
});

export const idParamsSchema = z.object({
  id: mongoIdSchema,
});
