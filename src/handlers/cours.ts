import { Request, Response } from "express";
import { Course } from "../models/cours.js";

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

const TEACHER_FIELDS = "firstName lastName avatarUrl";

// ─────────────────────────────────────────────
//  CREATE — POST /api/courses
//  Protected: teacher / admin only
//  isPublished defaults to TRUE so new courses
//       are immediately visible without admin approval.
// ─────────────────────────────────────────────
export const createCourse = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;

    const course = await Course.create({
      ...req.body,
      teacher: user.id,
      // Courses are auto-published on creation — no admin approval needed.
      isPublished: true,
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode ?? 500).json({
      success: false,
      message: e.message ?? "Failed to create course",
    });
  }
};

// ─────────────────────────────────────────────
//  GET ALL (PUBLIC) — GET /api/courses
//  Only returns published courses for the public catalogue.
// ─────────────────────────────────────────────
export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("teacher", TEACHER_FIELDS)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses,
    });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode ?? 500).json({
      success: false,
      message: e.message ?? "Failed to fetch courses",
    });
  }
};

// ─────────────────────────────────────────────
//  GET TEACHER'S OWN COURSES — GET /teacher/courses
//  Returns ALL courses (published + unpublished) owned by
//  the authenticated teacher.  Called by the teacher portal.
// ─────────────────────────────────────────────
export const getTeacherCourses = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;

    const courses = await Course.find({ teacher: user.id })
      .populate("teacher", TEACHER_FIELDS)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: courses,
    });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode ?? 500).json({
      success: false,
      message: e.message ?? "Failed to fetch your courses",
    });
  }
};

// ─────────────────────────────────────────────
//  GET ONE — GET /api/courses/:id
//  Public: only if published.
// ─────────────────────────────────────────────
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isPublished: true,
    }).populate("teacher", TEACHER_FIELDS);

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode ?? 500).json({
      success: false,
      message: e.message ?? "Failed to fetch course",
    });
  }
};

// ─────────────────────────────────────────────
//  UPDATE — PATCH /api/courses/:id
//  Protected: only the course owner or admin.
// ─────────────────────────────────────────────
export const updateCourse = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;

    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    // Ownership check — admin can bypass
    if (
      user.role !== "admin" &&
      course.teacher.toString() !== user.id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to update this course",
      });
      return;
    }

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    ).populate("teacher", TEACHER_FIELDS);

    res.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode ?? 500).json({
      success: false,
      message: e.message ?? "Failed to update course",
    });
  }
};

// ─────────────────────────────────────────────
//  DELETE — DELETE /api/courses/:id
//  Protected: only the course owner or admin.
// ─────────────────────────────────────────────
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;

    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404).json({ success: false, message: "Course not found" });
      return;
    }

    // Ownership check — admin can bypass
    if (
      user.role !== "admin" &&
      course.teacher.toString() !== user.id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: "You are not allowed to delete this course",
      });
      return;
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err: unknown) {
    const e = err as { statusCode?: number; message?: string };
    res.status(e.statusCode ?? 500).json({
      success: false,
      message: e.message ?? "Failed to delete course",
    });
  }
};
