import { Course } from "../models/cours.js";
import { Payment } from "../models/payment.js";
import { AuthenticatedRequest } from "../types/index.js";
import { Response } from "express";

// create payment
export async function createPayement(req: AuthenticatedRequest, res: Response) {
  const courseId = req.params.id as string;
  const user = req.user;

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  //already paid :
  const existing = await Payment.findOne({
    student: user._id,
    course: courseId,
    status: "paid",
  });

  if (existing) {
    return res.status(400).json({ message: "Already purchased" });
  }

  const payment = await Payment.create({
    student: user._id,
    course: courseId,
    amount: course.price,
    status: "pending",
  });
  return res.status(201).json({
    success: true,
    data: payment,
  });
}
