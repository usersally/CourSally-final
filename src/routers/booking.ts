import { Router } from "express";
import {
  createBooking,
  getBookings,
  cancelBooking,
  deleteBooking,
} from "../handlers/booking.js";
import { validateBodySchema } from "../middlewares/validations.js";
import { createBookingSchema } from "../validation/booking.js";

const bookingRouter = Router();

bookingRouter.post("/", validateBodySchema(createBookingSchema), createBooking);
bookingRouter.get("/", getBookings);
bookingRouter.patch("/:id/cancel", cancelBooking);
bookingRouter.delete("/:id", deleteBooking);

export default bookingRouter;
