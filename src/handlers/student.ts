import { Request, Response } from "express";
import enrollmentModel from "../models/enrollment.js";
import teacherModel from "../models/teacher.js";
import { Types } from "mongoose";
import userModel from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { AuthenticatedRequest } from "../types/express.js";

// Enroll to teacher
export const enrollToTeacher = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { teacherId } = req.params as { teacherId: string };

  const teacher = await teacherModel.findById(teacherId);
  if (!teacher) {
    const error = new Error("Teacher not found");
    (error as any).statusCode = 404;
    throw error;
  }

  const existing = await enrollmentModel.findOne({
    student: userId,
    teacher: teacherId,
  });

  if (existing) {
    const error = new Error("Already enrolled");
    (error as any).statusCode = 400;
    throw error;
  }

  const enrollment = await enrollmentModel.create({
    student: userId,
    teacher: new Types.ObjectId(teacherId),
  });

  res.status(201).json({
    success: true,
    data: enrollment,
  });
};

// Get my enrollments
export const getMyEnrollments = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  const enrollments = await enrollmentModel
    .find({ student: userId })
    .populate("teacher", "firstName lastName avatar subject pricePerHour avgRating")
    .sort({ enrolledAt: -1 });

  res.json({
    success: true,
    data: enrollments,
  });
};

//  Get my profile
export async function getMyProfile(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    const student = await userModel.findById(user._id).select("-password");

    res.status(StatusCodes.OK).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get profile",
    });
  }
}

//Update my profile
export async function updateMyProfile(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const allowed = ["firstName", "lastName", "phoneNumber", "userName", "level", "avatar"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await userModel
      .findByIdAndUpdate(authReq.user._id, { $set: updates }, { new: true })
      .select("-password");

    if (!updated) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Profile not found",
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update profile",
    });
  }
}

// Change password
export async function updateMyPassword(req: Request, res: Response) {
  try {
    const authReq = req as AuthenticatedRequest;
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Current and new password are required",
      });
      return;
    }

    const user = await userModel.findById(authReq.user._id);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update password",
    });
  }
}
