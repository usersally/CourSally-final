import { Schema } from "mongoose";
import { ITeacher } from "../types/index.js";
import userModel from "./user.js";

const teacherSchema = new Schema<ITeacher>(
  {
    subject: [
      {
        type: String,
        required: true,
      },
    ],
    cv: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    levels: [
      {
        type: String,
        required: true,
      },
    ],
    pricePerHour: {
      type: Number,
      required: true,
    },
    pricePerMonth: {
      type: Number,
      required: true,
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
  },
  { timestamps: true },
);

// ✅ Index
teacherSchema.index({
  bio: "text",
  subject: "text",
});

const teacherModel = userModel.discriminator("Teacher", teacherSchema);

export default teacherModel;
