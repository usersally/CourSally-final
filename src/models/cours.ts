import mongoose, { Schema, Types } from "mongoose";

const coursSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  teacher: {
    type: Types.ObjectId,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  schedule: [
    {
      day: String,
      startTime: String,
      endTime: String,
    },
  ],
});

export const Course = mongoose.model("Course", coursSchema);
