import { Router } from "express";
import { CheckAuth } from "../middlewares/auth.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../handlers/cours.js";

const courseRouter = Router();

// Public routes
courseRouter.get("/", getCourses);
courseRouter.get("/:id", getCourseById);

// Protected routes (teacher/admin only)
courseRouter.post("/", CheckAuth, createCourse);
courseRouter.patch("/:id", CheckAuth, updateCourse);
courseRouter.delete("/:id", CheckAuth, deleteCourse);

export default courseRouter;
