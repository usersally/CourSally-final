import express from "express";

import { errorHandler } from "./middlewares/errorHandler.js";
import authRouter from "./routers/auth.js";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { StatusCodes } from "http-status-codes";
import bookingRouter from "./routers/booking.js";
import teacherRouter from "./routers/teacher.js";
import ratingRouter from "./routers/rating.js";
import scheduleRouter from "./routers/shedule.js";
import studentRouter from "./routers/student.js";
import courseRouter from "./routers/cours.js";
import paymentRouter from "./routers/payment.js";
import dashboardRouter from "./routers/dashboard.js";
import adminRouter from "./routers/admin.js";
import messageRouter from "./routers/message.js";
import reportRouter from "./routers/report.js";

const app = express();

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;

  const allowedOrigins = (process.env.FRONTEND_DOMAIN || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowedOrigins.includes(origin)) return true;

  // Vercel production + preview deployments
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;

  return false;
}

// middlewares
app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, origin ?? true);
        return;
      }

      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, false);
    },
  }),
);
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/auth", authRouter);
app.use("/booking", bookingRouter);
app.use("/teacher", teacherRouter);
app.use("/rating", ratingRouter);
app.use("/schedule", scheduleRouter);
app.use("/student", studentRouter);
app.use("/courses", courseRouter);
app.use("/payment", paymentRouter);
app.use("/dashboard", dashboardRouter);
app.use("/admin", adminRouter);
app.use("/messages", messageRouter);
app.use("/reports", reportRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Not Found
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

//  Error handling
app.use(errorHandler);

export default app;
