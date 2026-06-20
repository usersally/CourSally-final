import { Router } from "express";
import {
  validateBodySchema,
  validateParamsSchema,
  validateQuerySchema,
} from "../middlewares/validations.js";
import { teacherQuerySchema } from "../validation/teacher.js";
import {
  addTeacherRating,
  getPopularTeachers,
  getTeacherById,
  getTeachers,
} from "../handlers/teacher.js";
import { idParamsSchema } from "../validation/utils.js";
import { CheckAuth, isApprovedTeacher } from "../middlewares/auth.js";
import { ratingSchema } from "../validation/rating.js";

import { getTeacherCourses } from "../handlers/cours.js";

const teacherRouter = Router();

teacherRouter.get("/", validateQuerySchema(teacherQuerySchema), getTeachers);
teacherRouter.get("/popular", getPopularTeachers);
teacherRouter.get("/courses", CheckAuth, isApprovedTeacher, getTeacherCourses);
teacherRouter.get("/:id", validateParamsSchema(idParamsSchema), getTeacherById);

// Protected routes
teacherRouter.post(
  "/:id/ratings",
  CheckAuth,
  validateParamsSchema(idParamsSchema),
  validateBodySchema(ratingSchema),
  addTeacherRating,
);

export default teacherRouter;
