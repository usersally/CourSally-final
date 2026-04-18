import enrollment from "../models/enrollment.js";
import { Schedule } from "../models/shedule.js";
import { AuthenticatedRequest } from "../types/index.js";
import { Request, Response } from "express";

export const createSchedule = async (req: Request, res: Response) => {
  try {
    const authreq = req as AuthenticatedRequest;

    // create schedule :
    const schedule = await Schedule.create({
      ...req.body,
      teacher: authreq.user._id, //teacher creates his own schedule
    });

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create schedule",
      error,
    });
  }
};

// Get schedules (teachers)

export const getTeacherSchedule = async (req: Request, res: Response) => {
  try {
    const authreq = req as AuthenticatedRequest;
    const schedule = await Schedule.find({
      teacher: authreq.user._id,
      isActive: true,
    }).populate("course");

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error,
    });
  }
};

//Get schedule (student)

export const getStudentSchedule = async (req: Request, res: Response) => {
  try {
    const authreq = req as AuthenticatedRequest;

    // get enrolled courses :
    const enrollments = await enrollment.find({
      student: authreq.user._id,
    });

    const courseIds = enrollments.map((e) => e.course);

    // get schedule for those courses :
    const schedule = await Schedule.find({
      course: { $in: courseIds },
      isActive: true,
    }).populate("course teacher");
  } catch (error) {}
};
