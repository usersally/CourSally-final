import type { Request, Response } from "express";
import Booking from "../models/booking.js";

// Create booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      teacherId,
      date,
      startTime,
      paymentType,
      paymentMethod,
      endTime,
      price,
      studentId,
    } = req.body;

    // check if slot already booked
    const existing = await Booking.findOne({
      teacherId,
      date,
      startTime,
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: "This slot is already booked",
      });
      return;
    }

    const booking = await Booking.create({
      teacherId,
      studentId,
      date,
      startTime,
      endTime,
      price,
      paymentType,
      paymentMethod,
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

// Get bookings (with pagination + filters)
export const getBookings = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, teacherId, studentId } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const filter: any = {};
    if (teacherId) filter.teacherId = teacherId;
    if (studentId) filter.studentId = studentId;

    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ date: 1, startTime: 1 })
      .lean();

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
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

// Delete booking
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
