import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacher: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
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

enrollmentSchema.index({ student: 1, teacher: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
