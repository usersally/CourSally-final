import { Router } from "express";
import {
  createSchedule,
  getTeacherSchedule,
  getStudentSchedule,
  updateSchedule,
  deleteSchedule,
} from "../handlers/schedule.js";

import scheduleSchema from "../validation/schedule.js";
import { validateBodySchema } from "../middlewares/validations.js"; // your Zod middleware
import { CheckAuth } from "../middlewares/auth.js"; // auth middleware

const router = Router();

// CREATE schedule (teacher/admin)

router.post("/", CheckAuth, validateBodySchema(scheduleSchema), createSchedule);

// GET teacher schedules (calendar view)

router.get("/teacher", CheckAuth, getTeacherSchedule);

// GET student schedules (based on enrollments)

router.get("/student", CheckAuth, getStudentSchedule);

// UPDATE schedule

router.put(
  "/:id",
  CheckAuth,
  validateBodySchema(scheduleSchema.partial()),
  updateSchedule,
);

// DELETE  schedule

router.delete("/:id", CheckAuth, deleteSchedule);

export default router;
