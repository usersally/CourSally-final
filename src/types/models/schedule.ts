import { Types } from "mongoose";

export interface ISchedule {
  course: Types.ObjectId;
  teacher: Types.ObjectId;

  dayOfWeek: Number;

  startTime: Number;
  endTime: Number;

  startDate: Date;
  endDate: Date;

  isActive: Boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
