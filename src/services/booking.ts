import Booking from "../models/booking.js";
import { IBooking } from "../types/models/booking.js";

export const bookingService = {
  //create booking
  createBooking: async (data: IBooking) => {
    const { teacherId, date, startTime } = data;

    const existing = await Booking.findOne({
      teacherId,
      date,
      startTime,
    });

    if (existing) {
      throw new Error("This slot is already booked");
    }

    const booking = await Booking.create(data);

    return booking;
  },

  getBookings: async (query: any) => {
    const { page = 1, limit = 10, teacherId, studentId } = query;

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

    return {
      data: bookings,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    };
  },

  deleteBooking: async (id: string) => {
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  },
};
