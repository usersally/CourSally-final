import { model, Schema, Types } from "mongoose";
import { string } from "zod";

const scheduleShema = new Schema(
  {
    course: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 7,
      required: true,
    },

    startTime: {
      type: string,
      required: true,
    },
    endTime: {
      type: string,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Schedule = model("Schedule", scheduleShema);
