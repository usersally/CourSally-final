import { Types } from "mongoose";

export interface IBooking {
  _id: Types.ObjectId;
  studentId: string;
  teacherId: Types.ObjectId;

  date: string;
  startTime: string;
  endTime: string;

  price: number;
  payementType: "single" | "monthly";

  createdAt?: Date;
}
