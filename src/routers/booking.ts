import { Router } from "express";
import { createBooking } from "../handlers/booking.js";
import { validateBodySchema } from "../middlewares/validations.js";
import { createBookingSchema } from "../validation/booking.js";

const bookingRouter = Router();
bookingRouter.post("/", createBooking);

bookingRouter.post("/", validateBodySchema(createBookingSchema), createBooking);

export default bookingRouter;
