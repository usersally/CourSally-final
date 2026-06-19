import { Router } from "express";
import { CheckAuth } from "../middlewares/auth.js";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getTeacherCourses,
} from "../handlers/cours.js";

const courseRouter = Router();

// ── Public routes ──────────────────────────────
courseRouter.get("/", getCourses);
courseRouter.get("/my", CheckAuth, getTeacherCourses);
courseRouter.get("/:id", getCourseById);

// ── Protected CUD routes ───────────────────────
courseRouter.post("/", CheckAuth, createCourse);
courseRouter.patch("/:id", CheckAuth, updateCourse);
courseRouter.delete("/:id", CheckAuth, deleteCourse);

export default courseRouter;
