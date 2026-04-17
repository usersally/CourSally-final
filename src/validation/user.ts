import { z } from "zod/v4";

const basicPasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

// Base login schema
export const loginSchema = z.object({
  email: z.string().email("Email must be valid").trim().toLowerCase(),
  password: basicPasswordSchema,
});

// Base user schema (common fields)

const baseUserSchema = z.object({
  firstName: z.string().min(3).max(70),
  lastName: z.string().min(3).max(70),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  password: basicPasswordSchema,
});
// Student registration schema
export const registerStudentSchema = z.object({
  ...baseUserSchema,
  email: z.string().email("Email must be valid").trim().toLowerCase(),
  password: basicPasswordSchema,
  role: z.literal("student"),
  studentProfile: z.object({
    grade: z.string().min(1, "Grade is required"),
    institution: z.string().min(1, "Institution name is required"),
  }),
});

// Teacher registration schema
export const registerTeacherSchema = z.object({
  ...baseUserSchema,
  email: z.string().email("Email must be valid").trim().toLowerCase(),
  password: basicPasswordSchema,
  role: z.literal("teacher"),
  teacherProfile: z.object({}),
});

// Full user schema (for admin creation)
export const fullUserSchema = z.object({
  ...baseUserSchema,
  email: z.string().email("Email must be valid").trim().toLowerCase(),
  password: basicPasswordSchema,
  role: z.enum(["admin", "student", "teacher"]),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(3, "First name must have at least 3 letters")
    .max(70, "First name must have at most 70 letters")
    .optional(),
  lastName: z
    .string()
    .min(3, "Last name must have at least 3 letters")
    .max(70, "Last name must have at most 70 letters")
    .optional(),
  phone: z.string().optional().or(z.literal("")),
  avatar: z
    .string()
    .url("Avatar must be a valid URL")
    .optional()
    .or(z.literal("")),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: basicPasswordSchema,
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterTeacherInput = z.infer<typeof registerTeacherSchema>;
export type FullUserInput = z.infer<typeof fullUserSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// For backward compatibility
const userSchema = loginSchema.extend(baseUserSchema.shape);
export default userSchema;
