import { model, Schema, Types } from "mongoose";

const paymentSchema = new Schema({
  student: { type: Types.ObjectId, ref: "User" },
  course: { type: Types.ObjectId, ref: "Course" },
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
});

export const Payment = model("Payment", paymentSchema);
