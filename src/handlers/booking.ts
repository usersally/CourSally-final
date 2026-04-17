import { Request, Response, NextFunction } from "express";
import { bookingService } from "../services/booking.js";

export const createBookingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await bookingService.createBooking(req.body);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
