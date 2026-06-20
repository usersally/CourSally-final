import { Router } from "express";
import {
  createBooking,
  getBookings,
  cancelBooking,
  deleteBooking,
} from "../handlers/booking.js";
import { validateBodySchema } from "../middlewares/validations.js";
import { createBookingSchema } from "../validation/booking.js";
import { CheckAuth, isStudent } from "../middlewares/auth.js";

const bookingRouter = Router();

bookingRouter.post(
  "/",
  CheckAuth,
  isStudent,
  validateBodySchema(createBookingSchema),
  createBooking,
);
bookingRouter.get("/", CheckAuth, getBookings);
bookingRouter.patch("/:id/cancel", CheckAuth, cancelBooking);
bookingRouter.delete("/:id", CheckAuth, deleteBooking);

export default bookingRouter;
