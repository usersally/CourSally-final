import { model, Schema } from "mongoose";
import { IUserDocument } from "../types/index.js";
import bcrypt from "bcrypt";

const options = {
  discriminatorKey: "role",
  timestamps: true,
};

const userSchema = new Schema<IUserDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    avatar: String,
    role: {
      type: String,
      enum: ["student", "teacher"],
      default: "student",
    },
  },
  options,
);

userSchema.pre("save", async function (this: IUserDocument) {
  if (this.isNew || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  requestedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(requestedPassword, this.password);
};

const userModel = model<IUserDocument>("User", userSchema);

export default userModel;
