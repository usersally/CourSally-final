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

const scheduleRouter = Router();

// CREATE schedule (teacher/admin)

scheduleRouter.post(
  "/",
  CheckAuth,
  validateBodySchema(scheduleSchema),
  createSchedule,
);

// GET teacher schedules (calendar view)

scheduleRouter.get("/teacher", CheckAuth, getTeacherSchedule);

// GET student schedules (based on enrollments)

scheduleRouter.get("/student", CheckAuth, getStudentSchedule);

// UPDATE schedule

scheduleRouter.put(
  "/:id",
  CheckAuth,
  validateBodySchema(scheduleSchema.partial()),
  updateSchedule,
);

// DELETE  schedule

scheduleRouter.delete("/:id", CheckAuth, deleteSchedule);

export default scheduleRouter;
