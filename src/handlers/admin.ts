import { Request, Response } from "express";
import userModel from "../models/user.js";
import { Course } from "../models/cours.js";

// GET /admin/stats
export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const [users, teachers, students, courses] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ role: "Teacher" }),
      userModel.countDocuments({ role: "Student" }),
      Course.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        teachers,
        students,
        courses,
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
    const user = await userModel.findById(req.params._id);

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
    const course = await Course.findById(req.params._id);

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

// PATCH /admin/users/:id/role
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!["Student", "Teacher", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await userModel
      .findByIdAndUpdate(req.params._id, { role }, { new: true })
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
