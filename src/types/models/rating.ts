import { Types } from "mongoose";
import { BaseDocument } from "../common.js";

export interface IRating extends BaseDocument {
  student: Types.ObjectId;
  ratedBy: Types.ObjectId;
  teacherId: Types.ObjectId;
  rating: number;
}
