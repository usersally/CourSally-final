import { Router } from "express";
import { createBooking } from "../handlers/booking.js";

const bookingRouter = Router();
bookingRouter.post("/", createBooking);

export default bookingRouter;
