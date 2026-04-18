import mongoose, { Schema, Types } from "mongoose";
import { IEnrollment } from "../types/index.js";

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
