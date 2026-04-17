import { Schema } from "mongoose";
import { ITeacher } from "../types/index.js";
import { Model } from "mongoose";
import userModel from "./user.js";

const teacherSchema = new Schema<ITeacher>({
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
});

// indexes
// Text search index for title, bio, keywords
teacherSchema.index(
  { title: "text", bio: "text", keywords: "text" },
  { name: "search_index" },
);

// Indexes for efficient queries
teacherSchema.index({ subject: 1, pricePerHour: 1 });
teacherSchema.index({ levels: 1 });
teacherSchema.index({ PricePerMonth: 1 });
teacherSchema.index({ createdAt: -1 });

//for search bar
teacherSchema.index({
  name: "text",
  bio: "text",
  keywords: "text",
});

teacherSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() as {
    $set?: { inSchool?: boolean; status?: string };
  };
  if (update.$set && update.$set.inSchool !== undefined) {
    update.$set.status =
      update.$set.inSchool === false ? "not in School" : "in School";
  }
});

const teacherModel: Model<ITeacher> = userModel.discriminator(
  "Teacher",
  teacherSchema,
);

export default teacherModel;
