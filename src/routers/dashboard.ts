import { Router } from "express";
import { getDashboard } from "../handlers/dashboard.js";
import { CheckAuth } from "../middlewares/auth.js";

const dashboardRouter = Router();

// Protected — only logged-in users (admin/teacher) should see real stats
dashboardRouter.get("/", CheckAuth, getDashboard);

export default dashboardRouter;
