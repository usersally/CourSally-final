import type { Request, Response } from "express";
import Booking from "../models/booking.js";
import { AuthenticatedRequest } from "../types/express.js";
import teacherModel from "../models/teacher.js";

function mapBooking(doc: Record<string, unknown>) {
  const teacher = doc.teacherId as Record<string, unknown> | null;
  return {
    ...doc,
    teacher: teacher
      ? {
          ...teacher,
          avatar: teacher.avatar ?? teacher.avatarUrl,
        }
      : null,
  };
}

// Create booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const {
      teacherId,
      courseId,
      date,
      startTime,
      endTime,
      price,
      paymentType,
      paymentMethod,
      studentId: bodyStudentId,
    } = req.body;

    const studentId = bodyStudentId ?? authReq.user?._id?.toString();

    if (!studentId) {
      res.status(401).json({
        success: false,
        message: "Student authentication required",
      });
      return;
    }

    const teacher = await teacherModel.findOne({
      _id: teacherId,
      cvStatus: "approved",
    });

    if (!teacher) {
      res.status(404).json({
        success: false,
        message: "Teacher not found or not available",
      });
      return;
    }

    const existing = await Booking.findOne({ teacherId, date, startTime });

    if (existing) {
      res.status(400).json({
        success: false,
        message: "This slot is already booked",
      });
      return;
    }

    const booking = await Booking.create({
      teacherId,
      courseId: courseId ?? null,
      studentId,
      date,
      startTime,
      endTime,
      price,
      paymentType,
      paymentMethod,
      status: "upcoming",
    });

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

// Get bookings for a student (with populate for teacher + course)
export const getBookings = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { page = 1, limit = 10, teacherId, studentId, status } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const filter: Record<string, unknown> = {};
    if (teacherId) filter.teacherId = teacherId;
    if (status) filter.status = status;

    // Auto-scope to logged-in student when no explicit studentId
    if (studentId) {
      filter.studentId = studentId;
    } else if (authReq.user?.role === "student") {
      filter.studentId = authReq.user._id.toString();
    }

    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(filter)
      .populate("teacherId", "firstName lastName avatar subject")
      .populate("courseId", "title subject")
      .skip(skip)
      .limit(limitNum)
      .sort({ date: 1, startTime: 1 })
      .lean();

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings.map((b) => mapBooking(b as Record<string, unknown>)),
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// Cancel booking (PATCH /bookings/:id/cancel)
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true },
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

// Delete booking (hard delete)
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Booking deleted successfully",
      data: booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};
