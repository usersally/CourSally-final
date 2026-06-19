import { Request, Response } from "express";
import { Course } from "../models/cours.js";
import Booking from "../models/booking.js";
import teacherModel from "../models/teacher.js";
import userModel from "../models/user.js";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const [
      totalCourses,
      totalTeachers,
      totalStudents,
      totalBookings,
      cancelledBookings,
      topTeachers,
      bookingsByMonth,
    ] = await Promise.all([
      // Total published courses
      Course.countDocuments({ isPublished: true }),

      // Total teachers
      teacherModel.countDocuments(),

      // Total students (role = "student")
      userModel.countDocuments({ role: "student" }),

      // Total bookings
      Booking.countDocuments(),

      // Cancelled bookings
      Booking.countDocuments({ status: "cancelled" }),

      // Top 10 teachers by rating count (names are on the User discriminator doc)
      teacherModel
        .find()
        .select("firstName lastName ratingCount avgRating")
        .sort({ ratingCount: -1 })
        .limit(10)
        .lean(),

      // Bookings per month for the last 7 months (expense vs profit chart)
      Booking.aggregate([
        {
          $match: {
            date: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$date" },
            totalRevenue: { $sum: "$price" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // ── Map month numbers to names ──
    const MONTH_NAMES = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const expenseProfit = bookingsByMonth.map((m) => ({
      month: MONTH_NAMES[m._id - 1],
      // profit = revenue collected, expense = rough platform cost (20% of revenue)
      // Replace with your real expense model if you have one
      profit: m.totalRevenue,
      expense: Math.round(m.totalRevenue * 0.2),
    }));

    // ── Format top teachers ──
    const formattedTeachers = topTeachers.map((t: any) => {
      const name =
        `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || "Unknown";
      return {
        name,
        sessions: t.ratingCount ?? 0,
        avgRating: t.avgRating ?? 0,
      };
    });

    // ── Pie: completed vs upcoming bookings ──
    const [completedBookings, upcomingBookings] = await Promise.all([
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: { $in: ["pending", "confirmed"] } }),
    ]);

    const pieTotal = completedBookings + upcomingBookings || 1; // avoid divide by zero
    const pieData = [
      {
        name: "Completed",
        value: Math.round((completedBookings / pieTotal) * 100),
      },
      {
        name: "Upcoming",
        value: Math.round((upcomingBookings / pieTotal) * 100),
      },
    ];

    res.json({
      success: true,
      data: {
        overview: [
          {
            label: "Total Courses",
            value: totalCourses,
            icon: "mdi:book-open-variant",
          },
          {
            label: "Total Bookings",
            value: totalBookings,
            icon: "mdi:calendar-check",
          },
          {
            label: "Total Teachers",
            value: totalTeachers,
            icon: "mdi:account-tie",
          },
          {
            label: "Cancelled",
            value: cancelledBookings,
            icon: "mdi:close-circle-outline",
            accent: "#FDE8E0",
          },
        ],
        totalStudents,
        pieData,
        expenseProfit,
        topTeachers: formattedTeachers,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message ?? "Failed to load dashboard",
    });
  }
};
