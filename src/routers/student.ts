import { Router } from "express";
import {
  getMyProfile,
  updateMyProfile,
  updateMyPassword,
  enrollToTeacher,
  getMyEnrollments,
} from "../handlers/student.js";
import { CheckAuth } from "../middlewares/auth.js";

const studentRouter = Router();

// Get student profile
studentRouter.get("/me", CheckAuth, getMyProfile);

// Update student profile
studentRouter.patch("/me", CheckAuth, updateMyProfile);

// Change password
studentRouter.patch("/me/password", CheckAuth, updateMyPassword);

// Enroll in course / teacher
studentRouter.post("/enroll/:teacherId", CheckAuth, enrollToTeacher);

// Get my enrolled teachers
studentRouter.get("/enrollments", CheckAuth, getMyEnrollments);

export default studentRouter;
