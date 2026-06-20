import type { Request, Response } from "express";
import Report from "../models/report.js";
import userModel from "../models/user.js";
import { AuthenticatedRequest } from "../types/express.js";

function getUserId(req: Request): string {
  const authReq = req as AuthenticatedRequest;
  return authReq.user!._id.toString();
}

export const createReport = async (req: Request, res: Response) => {
  try {
    const reporterId = getUserId(req);
    const authReq = req as AuthenticatedRequest;
    const { reportedUserId, reason, details } = req.body;

    if (reporterId === reportedUserId) {
      res.status(400).json({
        success: false,
        message: "You cannot report yourself",
      });
      return;
    }

    const reported = await userModel.findById(reportedUserId).select("role");
    if (!reported) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (reported.role === "admin") {
      res.status(400).json({
        success: false,
        message: "You cannot report an admin",
      });
      return;
    }

    const reporterRole = authReq.user?.role;
    if (reporterRole === "student" && reported.role !== "teacher") {
      res.status(400).json({
        success: false,
        message: "Students can only report teachers",
      });
      return;
    }
    if (reporterRole === "teacher" && reported.role !== "student") {
      res.status(400).json({
        success: false,
        message: "Teachers can only report students",
      });
      return;
    }

    const existing = await Report.findOne({
      reporterId,
      reportedUserId,
      status: "pending",
    });
    if (existing) {
      res.status(400).json({
        success: false,
        message: "You already have a pending report for this user",
      });
      return;
    }

    const report = await Report.create({
      reporterId,
      reportedUserId,
      reason,
      details: details?.trim() ?? "",
    });

    res.status(201).json({ success: true, data: report });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to submit report";
    res.status(500).json({ success: false, message });
  }
};

export const getReports = async (_req: Request, res: Response) => {
  try {
    const reports = await Report.find()
      .populate("reporterId", "firstName lastName email role")
      .populate("reportedUserId", "firstName lastName email role")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: reports });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load reports";
    res.status(500).json({ success: false, message });
  }
};

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status,
        adminNote: adminNote?.trim() ?? "",
        resolvedAt: status === "pending" ? null : new Date(),
      },
      { new: true },
    )
      .populate("reporterId", "firstName lastName email role")
      .populate("reportedUserId", "firstName lastName email role");

    if (!report) {
      res.status(404).json({ success: false, message: "Report not found" });
      return;
    }

    res.json({ success: true, data: report });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update report";
    res.status(500).json({ success: false, message });
  }
};
