import { Request, Response } from "express";
import { Course } from "../models/cours.js";

// Create course (teacher/admin)
export const createCourse = async (req: Request, res: Response) => {
  const user = (req as any).user;

  const course = await Course.create({
    ...req.body,
    teacher: user._id,
  });

  res.status(201).json({
    success: true,
    data: course,
  });
};

// Get all courses
export const getCourses = async (res: Response) => {
  const courses = await Course.find().populate("teacher");

  res.json({
    success: true,
    data: courses,
  });
};

// Get single course
export const getCourseById = async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id).populate("teacher");

  if (!course) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: course,
  });
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true },
  );

  if (!course) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: course,
  });
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    const error = new Error("Course not found");
    (error as any).statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    message: "Course deleted",
  });
};
