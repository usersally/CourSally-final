import { Schema } from "mongoose";
import userModel from "./user.js";

const studentSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  level: {
    type: String,
    required: true,
  },
  enrollementDate: {
    type: String,
    required: true,
  },
});

const studentModel = userModel.discriminator("student", studentSchema);
export default studentModel;
