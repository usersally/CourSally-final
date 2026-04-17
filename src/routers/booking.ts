import { Router } from "express";
import { createBookingHandler } from "../handlers/booking.js";

const bookingRouter = Router();
bookingRouter.post("/", createBookingHandler);

export default bookingRouter;
