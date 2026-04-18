import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";
import enrollment from "../models/enrollment.js";
import rateModel from "../models/rating.js";

// create or update rating

export const createRating = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const { teacherId, rating, comment } = req.body;

    const studentId = authReq.user._id;

    //check if student is enrolled with this teacher
    const isEnrolled = await enrollment.findOne({
      student: studentId,
      teacher: teacherId,
    });

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled to rate this teacher",
      });
    }

    //check if rating already exists :
    const existingRating = await rateModel.findOne({
      student: studentId,
      teacher: teacherId,
    });
    let ratingDoc;

    if (existingRating) {
      //update existing rating
      ratingDoc = await rateModel.findByIdAndUpdate(
        existingRating._id,
        { rating, comment },
        { new: true },
      );
    } else {
      //create new rating
      ratingDoc = await rateModel.create({
        student: studentId,
        teacherId: teacherId,
        rating,
        comment,
      });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create rating",
      error,
    });
  }
};

// get all ratings for a teacher

export const getTeacherRatings = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;

    const ratings = await rateModel
      .find({ tecaher: teacherId })
      .populate("student", "userName")
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
