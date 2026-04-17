import { Router } from "express";
import { getMyProfile } from "../handlers/student.js";
import { CheckAuth } from "../middlewares/auth.js";
import { enrollToTeacher, getMyEnrollments } from "../handlers/student.js";

const studentRouter = Router();

// Get student profile
studentRouter.get("/me", CheckAuth, getMyProfile);

// Enroll in course / teacher
studentRouter.post("/enroll/:teacherId", CheckAuth, enrollToTeacher);

// Get my enrolled teachers
studentRouter.get("/enrollments", CheckAuth, getMyEnrollments);
