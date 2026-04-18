import { Request, Response } from "express";
import Rating from "../models/rating.js";
import Enrollment from "../models/enrollment.js";
import { AuthenticatedRequest } from "../types/index.js";

/**
 * CREATE or UPDATE rating
 * A student can rate a teacher only if enrolled
 */
export const createRating = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const { teacherId, rating, comment } = req.body;

    const studentId = authReq.user._id;

    // 🔒 Check if student is enrolled with this teacher (optional but recommended)
    const isEnrolled = await Enrollment.findOne({
      student: studentId,
      teacher: teacherId,
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled to rate this teacher",
      });
    }

    // 🔄 Check if rating already exists
    const existingRating = await Rating.findOne({
      student: studentId,
      teacher: teacherId,
    });

    let ratingDoc;

    if (existingRating) {
      // update existing rating
      ratingDoc = await Rating.findByIdAndUpdate(
        existingRating._id,
        { rating, comment },
        { new: true },
      );
    } else {
      // create new rating
      ratingDoc = await Rating.create({
        student: studentId,
        teacher: teacherId,
        rating,
        comment,
      });
    }

    res.status(200).json({
      success: true,
      data: ratingDoc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create rating",
      error,
    });
  }
};

/**
 * GET all ratings for a teacher
 */
export const getTeacherRatings = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;

    const ratings = await Rating.find({ teacher: teacherId })
      .populate("student", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ratings",
      error,
    });
  }
};

/**
 * UPDATE rating (only owner can update)
 */
export const updateRating = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const { id } = req.params;

    const rating = await Rating.findOne({
      _id: id,
      student: authReq.user._id,
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    const updated = await Rating.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update rating",
      error,
    });
  }
};

/**
 * DELETE rating (only owner can delete)
 */
export const deleteRating = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const { id } = req.params;

    const rating = await Rating.findOne({
      _id: id,
      student: authReq.user._id,
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    await Rating.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Rating deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete rating",
      error,
    });
  }
};
