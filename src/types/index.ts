import { Document, Types } from "mongoose";
import { Request } from "express-serve-static-core";
import { UserRole } from "./common.js";

export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IStudentProfile extends BaseDocument {
  grade: string;
  institution: string;
  enrollmentDate: Date;
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  cv?: string;
  role: UserRole;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ITeacher extends IUser {
  role: "teacher";
  cv: string;
  subject: string;
  bio: string;
  levels: string;
  pricePerHour: number;
  pricePerMonth: number;
  availability?: string;
  inSchool: boolean;
  keywords: string;
  status: "pending" | "approved" | "rejected";
}

export interface IUserDocument extends IUser, BaseDocument {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AuthenticatedRequest extends Request {
  user: IUserDocument;
}

export interface RequestWithParsedQuery<T = unknown> extends Request {
  parsedQuery: T;
}

export interface ApiSuccessResponse<T = unknown> extends Request {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string | string[] | Record<string, unknown>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T = unknown> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}
