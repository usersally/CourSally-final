import mongoose from "mongoose";
import { RequestWithParsedQuery } from "../types/index.js";
import {
  errorResponse,
  paginatedResponse,
  successResponse,
} from "../utils/responseFormatter.js";
import { logger } from "../utils/logger.js";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import teacherModel from "../models/teacher.js";
import rateModel from "../models/rating.js";
import { AuthenticatedRequest } from "../types/express.js";
import { IRating } from "../types/models/rating.js";
import Booking from "../models/booking.js";

interface teacherQuery {
  limit: number;
  page: number;
  sortBy: string;
  sortOrder: 1 | -1;
  search?: string;
  subject?: string;
  level?: string;
  maxPrice?: number;
  status?: string;
}

/**
 * Get all teachers with pagination, filtering and sorting
 */
export async function getTeachers(req: Request, res: Response): Promise<void> {
  try {
    const parsedReq = req as RequestWithParsedQuery<teacherQuery>;
    const {
      limit = 10,
      page = 1,
      sortBy = "createdAt",
      sortOrder = -1,
      search,
      subject,
      level,
      maxPrice,
      status,
    } = parsedReq.parsedQuery;

    // Build filter — only show approved teachers to students
    const filter: Record<string, unknown> = { cvStatus: "approved" };

    if (search) {
      filter.$text = { $search: search };
    }

    if (subject) {
      filter.subject = subject; // matches if the subject array contains this value
    }

    if (level) {
      filter.levels = level; // matches if the levels array contains this value
    }

    if (maxPrice !== undefined) {
      filter.pricePerHour = { $lte: maxPrice };
    }

    if (status) {
      filter.inSchool = status === "available";
    }

    const [teachers, total] = await Promise.all([
      teacherModel
        .find(filter)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ [sortBy]: sortOrder })
        .lean(),
      teacherModel.countDocuments(filter),
    ]);

    paginatedResponse(
      res,
      teachers,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      "Teachers fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching teachers:", { error });
    errorResponse(res, error, "Failed to fetch teachers");
  }
}

/**
 * Get single teacher by ID
 */
export async function getTeacherById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const teacher = await teacherModel.findOne({
      _id: req.params.id,
      cvStatus: "approved",
    });

    if (!teacher) {
      errorResponse(res, null, "Teacher not found", StatusCodes.NOT_FOUND);
      return;
    }

    successResponse(res, teacher, "Teacher fetched successfully");
  } catch (error) {
    logger.error("Error fetching teacher:", { error });
    errorResponse(res, error, "Failed to fetch teacher");
  }
}

/**
 * Get popular teachers
 */
export async function getPopularTeachers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const teachers = await teacherModel
      .find({ cvStatus: "approved" })
      .sort({ ratingCount: -1 })
      .limit(limit);

    successResponse(res, teachers, "Popular teachers fetched successfully");
  } catch (error) {
    logger.error("Error fetching popular teachers:", { error });
    errorResponse(res, error, "Failed to fetch popular teachers");
  }
}

/**
 * Delete teacher (Admin only)
 */
export async function deleteTeacher(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const teacher = await teacherModel.findByIdAndDelete(req.params.id);

    if (!teacher) {
      errorResponse(res, null, "Teacher not found", StatusCodes.NOT_FOUND);
      return;
    }

    successResponse(res, null, "Teacher deleted successfully");
  } catch (error) {
    logger.error("Error deleting teacher:", { error });
    errorResponse(res, error, `Failed to delete teacher ${req.params.id}`);
  }
}

/**
 * Update teacher (Admin only)
 */
export async function updateTeacher(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const teacher = await teacherModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );

    if (!teacher) {
      errorResponse(res, null, "Teacher not found", StatusCodes.NOT_FOUND);
      return;
    }

    successResponse(res, teacher, "Teacher updated successfully");
  } catch (error) {
    logger.error("Error updating teacher:", { error });
    errorResponse(res, error, `Failed to update teacher ${req.params.id}`);
  }
}

/**
 * Add rating to teacher
 */
export async function addTeacherRating(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { id } = req.params;
    const teacherId = Array.isArray(id) ? id[0] : id;
    const { rating } = req.body as { rating: number };
    const userId = authReq.user._id;

    if (!teacherId) {
      errorResponse(
        res,
        null,
        "Teacher ID is required",
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Check if user has booked this teacher
    const hasBooked = await Booking.exists({
      user: userId,
      teacher: teacherId,
      status: { $in: ["returned", "active", "overdue"] },
    });

    if (!hasBooked) {
      errorResponse(
        res,
        null,
        "You can only rate teachers that you have booked",
        StatusCodes.FORBIDDEN,
      );
      return;
    }

    // Create or update rating
    const existingRating = await rateModel.findOne({
      ratedBy: userId,
      teacherId: teacherId,
    });

    let ratingDoc;
    if (existingRating) {
      ratingDoc = await rateModel.findByIdAndUpdate(
        existingRating._id,
        { $set: { rating } },
        { new: true },
      );
    } else {
      ratingDoc = await rateModel.create({
        ratedBy: userId,
        teacherId: new mongoose.Types.ObjectId(teacherId),
        rating,
      });
    }

    // Update teacher's average rating
    const allRatings = await rateModel.find({ teacherId: teacherId });
    const avgRating =
      allRatings.reduce((sum: number, r: IRating) => sum + r.rating, 0) /
      allRatings.length;

    await teacherModel.findByIdAndUpdate(teacherId, {
      $set: {
        avgRating: Math.round(avgRating * 10) / 10,
        ratingCount: allRatings.length,
      },
    });

    successResponse(
      res,
      ratingDoc,
      existingRating ? "Rating updated" : "Rating added",
    );
  } catch (error) {
    logger.error("Error adding teacher rating:", { error });
    const err = error as Error & { code?: number };
    if (err.code === 11000) {
      errorResponse(
        res,
        err,
        "You have already rated this teacher",
        StatusCodes.CONFLICT,
      );
    } else {
      errorResponse(res, err, "Failed to add rating");
    }
  }
}
