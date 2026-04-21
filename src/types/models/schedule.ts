import { Types } from "mongoose";

export interface ISchedule {
  course: Types.ObjectId;
  teacher: Types.ObjectId;

  dayOfWeek: Number;

  startTime: String;
  endTime: Number;

  startDate: String;
  endDate: Date;

  isActive: Boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
