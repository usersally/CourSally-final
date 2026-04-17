import { Schema, Types, model, type Model } from "mongoose";
import type { IRating } from "../types/models/rating.js";

/**
 * Rating schema definition
 * Defines the structure of rating documents in MongoDB
 */
const rateSchema = new Schema<IRating>(
  {
    ratedBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    teacherId: {
      type: Types.ObjectId,
      ref: "teacher",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure one rating per user per teacher
rateSchema.index({ ratedBy: 1, teacherId: 1 }, { unique: true });

const rateModel: Model<IRating> = model<IRating>("rating", rateSchema);

export default rateModel;
