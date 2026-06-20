import { Router } from "express";
import { CheckAuth, isAdmin } from "../middlewares/auth.js";

import {
  getAdminStats,
  getUsers,
  deleteUser,
  getAllCourses,
  deleteCourseAdmin,
  updateUserRole,
  updateTeacherCvStatus,
} from "../handlers/admin.js";
import {
  getReports,
  updateReportStatus,
} from "../handlers/report.js";
import { validateBodySchema } from "../middlewares/validations.js";
import {
  updateReportSchema,
} from "../validation/report.js";

const adminRouter = Router();

adminRouter.use(CheckAuth);
adminRouter.use(isAdmin);

// Dashboard
adminRouter.get("/dashboard", getAdminStats);

// Users
adminRouter.get("/users", getUsers);
adminRouter.delete("/users/:id", deleteUser);
adminRouter.patch("/users/:id/role", updateUserRole);

// Courses
adminRouter.get("/courses", getAllCourses);
adminRouter.delete("/courses/:id", deleteCourseAdmin);

// Teacher CV approval
adminRouter.patch("/teachers/:id/cv-status", updateTeacherCvStatus);

// Reports (admin)
adminRouter.get("/reports", getReports);
adminRouter.patch(
  "/reports/:id",
  validateBodySchema(updateReportSchema),
  updateReportStatus,
);

export default adminRouter;
