import { Request, Response } from "express";
import userModel from "../models/user.js";
import teacherModel from "../models/teacher.js";
import { Course } from "../models/cours.js";
import { sendTeacherCvEmail } from "../utils/email.js";

// GET /admin/stats
export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalTeachers, totalStudents, totalCourses] =
      await Promise.all([
        userModel.countDocuments(),
        userModel.countDocuments({ role: "teacher" }),
        userModel.countDocuments({ role: "student" }),
        Course.countDocuments(),
      ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalCourses,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET /admin/users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userModel
      .find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: users,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE /admin/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    return res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET /admin/courses
export const getAllCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find()
      .populate("teacher", "firstName lastName avatar")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: courses,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// DELETE /admin/courses/:id
export const deleteCourseAdmin = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await course.deleteOne();

    return res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// PATCH /admin/teachers/:id/cv-status
export const updateTeacherCvStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status?: string };

    if (!["approved", "rejected"].includes(status ?? "")) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    const teacher = await teacherModel
      .findByIdAndUpdate(
        req.params.id,
        { $set: { cvStatus: status } },
        { new: true },
      )
      .select("-password");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    try {
      await sendTeacherCvEmail(
        teacher.email,
        teacher.firstName,
        status as "approved" | "rejected",
      );
    } catch (emailErr) {
      console.error("Failed to send CV status email:", emailErr);
    }

    return res.json({
      success: true,
      message: `Teacher CV ${status}`,
      data: teacher,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// PATCH /admin/users/:id/role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!["student", "teacher", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await userModel
      .findByIdAndUpdate(req.params.id, { role }, { new: true })
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
