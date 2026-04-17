import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import userModel from "../models/user.js";

//  Get my profile
export async function getMyProfile(req: Request, res: Response) {
  try {
    const user = (req as any).userModel;

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
    const user = (req as any).userModel;

    const updated = await userModel
      .findByIdAndUpdate(user._id, { $set: req.body }, { new: true })
      .select("-password");

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
