import mongoose from "mongoose";
import { IUserDocument } from "./index.js";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  /** Authenticated user attached by auth middleware */
  user: IUserDocument;
}

export interface RequestWithParsedQuery<T = unknown> extends Request {
  /** Parsed and validated query parameters */
  parsedQuery: T;
}

export interface FilterQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 1 | -1;
  search?: string;
  category?: string;
}

export interface TeacherIdParams {
  teacherId: mongoose.Types.ObjectId;
}

export interface SearchQuery {
  search?: string;
  category?: string;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: 1 | -1;
}
