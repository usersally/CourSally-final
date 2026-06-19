import { Router } from "express";
import { CheckAuth, isAdmin } from "../middlewares/auth.js";

import {
  getAdminStats,
  getUsers,
  deleteUser,
  getAllCourses,
  deleteCourseAdmin,
  updateUserRole,
} from "../handlers/admin.js";

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

export default adminRouter;
