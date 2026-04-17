import { Types } from "mongoose";

export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "admin" | "student" | "teacher";

export type TeacherStatus = "open" | "closed";

export type acceptationStatus = "pending" | "rejected" | "approved";
