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
    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch student schedules",
      error,
    });
  }
};

//update schedule

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
    );

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
      return;
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update schedule",
      error,
    });
  }
};

// delete schedule :
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Schedule.findByIdAndUpdate(id, { isActive: false }, { new: true });

    res.json({
      success: true,
      message: "schedule deactivated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete schedule",
      error,
    });
  }
};
