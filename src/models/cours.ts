import mongoose, { Document, Schema } from "mongoose";

// ── Valid values ───────────────────────────────────────────────────────────
export const LEVEL_VALUES = ["Primary", "Secondary", "High School"] as const;
export type CourseLevel = (typeof LEVEL_VALUES)[number];

export const GRADE_VALUES: Record<CourseLevel, string[]> = {
  Primary: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
  Secondary: ["Year 1", "Year 2", "Year 3", "BE"],
  "High School": ["Year 1", "Year 2", "BAC"],
};

// Flat list used for the Mongoose enum validator
const ALL_GRADES = Object.values(GRADE_VALUES).flat();

// ── Sub-document: schedule slot ────────────────────────────────────────────
interface IScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
}

const scheduleSlotSchema = new Schema<IScheduleSlot>(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

// ── Main document ──────────────────────────────────────────────────────────
export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  level: CourseLevel;
  grade: string;
  subject?: string;
  image?: string | null;
  isPublished: boolean;
  teacher: mongoose.Types.ObjectId;
  schedule: IScheduleSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },

    // Education level — restricted to the three supported stages
    level: {
      type: String,
      enum: LEVEL_VALUES,
      required: true,
    },

    grade: {
      type: String,
      enum: ALL_GRADES,
      required: true,
    },

    subject: { type: String, trim: true },
    image: { type: String, default: null },

    // ── Auto-published: no admin approval step ──
    isPublished: { type: Boolean, default: true },

    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    schedule: { type: [scheduleSlotSchema], default: [] },
  },
  { timestamps: true },
);

export const Course =
  mongoose.models.Course ?? mongoose.model<ICourse>("Course", courseSchema);
