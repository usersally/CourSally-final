import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import userModel from "../models/user.js";
import { AuthenticatedRequest } from "../types/express.js";
import { errorResponse } from "../utils/responseFormatter.js";

export async function CheckAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token doesn't exist",
      });
      return;
    }

    // Verify token
    const verified = jwt.verify(
      token,
      process.env.AUTH_SECRET as string,
    ) as JwtPayload;

    if (!verified) {
      res.status(401).json({
        success: false,
        message: "Unverified token used",
      });
      return;
    }

    // Find user and attach to request
    const user = await userModel.findById(verified._id).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found or deleted",
      });
      return;
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;
    next();
  } catch (err) {
    errorResponse(res, err, "Error in validating token");
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;

  if (authReq.user?.role === "admin") {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: "You are not an admin, you can't access this route",
    });
  }
}

export function isApprovedTeacher(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authReq = req as AuthenticatedRequest;
  const user = authReq.user as AuthenticatedRequest["user"] & {
    cvStatus?: string;
  };

  if (authReq.user?.role !== "teacher") {
    res.status(401).json({
      success: false,
      message: "You are not a teacher, you can't access this route",
    });
    return;
  }

  if (user.cvStatus !== "approved") {
    res.status(403).json({
      success: false,
      message:
        user.cvStatus === "rejected"
          ? "Your teacher application was rejected"
          : "Your CV is pending admin approval",
      cvStatus: user.cvStatus ?? "pending",
    });
    return;
  }

  next();
}

export function isStudent(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authReq = req as AuthenticatedRequest;

  if (authReq.user?.role === "student") {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: "You are not a student, you can't access this route",
    });
  }
}
