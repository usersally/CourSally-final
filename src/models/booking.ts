import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teacher",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["single", "monthly"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

//Prevent double booking
bookingSchema.index({ teacherId: 1, date: 1, startTime: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
