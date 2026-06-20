import { Router } from "express";
import { createReport } from "../handlers/report.js";
import { CheckAuth } from "../middlewares/auth.js";
import { validateBodySchema } from "../middlewares/validations.js";
import { createReportSchema } from "../validation/report.js";

const reportRouter = Router();

reportRouter.post(
  "/",
  CheckAuth,
  validateBodySchema(createReportSchema),
  createReport,
);

export default reportRouter;
