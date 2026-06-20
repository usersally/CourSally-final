import { Schema } from "mongoose";
import { ITeacher } from "../types/index.js";
import userModel from "./user.js";

const teacherSchema = new Schema<ITeacher>(
  {
    subject: [String],
    cv: {
      type: String,
      default: "pending",
    },
    bio: {
      type: String,
      default: "Profile pending",
    },
    levels: [String],
    pricePerHour: {
      type: Number,
      default: 0,
    },
    pricePerMonth: {
      type: Number,
      default: 0,
    },
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    inSchool: {
      type: Boolean,
      default: true,
    },
    cvStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// ✅ Index
teacherSchema.index({
  bio: "text",
  subject: "text",
});

const teacherModel = userModel.discriminator("teacher", teacherSchema);

export default teacherModel;
