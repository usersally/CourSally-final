import { Types } from "mongoose";
import { Course } from "../models/cours.js";
import enrollment from "../models/enrollment.js";
import { Payment } from "../models/payment.js";
import { AuthenticatedRequest } from "../types/index.js";
import { Request, Response } from "express";

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

//verifye payment

export async function verifyPayment(req: AuthenticatedRequest, res: Response) {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    //  Simulate success (replace it when Chargily)
    payment.status = "paid";
    await payment.save();

    //  auto-enroll student after payment
    await enrollment.create({
      student: payment.student as Types.ObjectId,
      course: payment.course as Types.ObjectId,
    });

    return res.json({
      success: true,
      message: "Payment verified",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error,
    });
  }
}

// get my payments :
export async function getMyPayments(req: AuthenticatedRequest, res: Response) {
  try {
    const user = req.user;

    const payments = await Payment.find({
      student: user._id,
    })
      .populate("course")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error,
    });
  }
}

// get course payments : (admin, teacher)
export async function getCoursePayments(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { courseId } = req.params;

    const payments = await Payment.find({
      course: courseId,
      status: "paid",
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course payments",
      error,
    });
  }
}

// get payment by id

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get payment",
      error,
    });
  }
};

// delete payment

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error,
    });
  }
};
