import { Router } from "express";
import {
  createRating,
  updateRating,
  getTeacherRatings,
  deleteRating,
} from "../handlers/rating.js";

import { ratingSchema } from "../validation/rating.js";
import { validateBodySchema } from "../middlewares/validations.js";
import { CheckAuth } from "../middlewares/auth.js";

const ratingRouter = Router();

//CREATE rating (student gives rating to teacher)

ratingRouter.post(
  "/",
  CheckAuth,
  validateBodySchema(ratingSchema),
  createRating,
);

//GET ratings for a teacher

ratingRouter.get("/teacher/:teacherId", getTeacherRatings);

//UPDATE rating (same student modifies rating)

ratingRouter.put(
  "/:id",
  CheckAuth,
  validateBodySchema(ratingSchema.partial()),
  updateRating,
);

// DELETE rating

ratingRouter.delete("/:id", CheckAuth, deleteRating);

export default ratingRouter;
