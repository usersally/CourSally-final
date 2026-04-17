import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/user.js"; 
import { AuthenticatedRequest } from "../types/express.js";


//register
export const register = async (req: Request, res: Response) => {
  try {
    const user = await userModel.create(req.body);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.AUTH_SECRET as string,
      { expiresIn: "7d" }
    );

    const userObject = user.toObject()
    const {password:_pwd, ...safeUser }= userObject

    const response = {
      success: true,
      message: "User registered successfully",
      data: {
        safeUser, token
      },
    }

  // Send response
    return res.status(201).json(response);
  } catch (error: any) {
    // duplicate email error 
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
  
};

//login :

export const login = async (req: Request, res: Response) => {
  try {
    //  Extract email & password
    const { email, password } = req.body;

    //  Find user by email
    const user = await userModel.findOne({ email });

    //  Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //  Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

 

    //  Create JWT
    const token = jwt.sign(
  { _id: user._id.toString(), createdAt: user.createdAt },
  process.env.AUTH_SECRET as string,
  { expiresIn: "7d" }
);

   // send safe data (all exept pwd)
    const userObject = user.toObject()
    const {password:_pwd, ...safeUser }= userObject

    // 7. Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//checkUser :

export const checkUser = async (req: Request, res: Response): Promise<void> =>{
  const authReq = req as AuthenticatedRequest
  const user = authReq.user

  if (!user) {
     res.status(400).json({
      success: false,
      message: "user does not exist "
    })
    return;
  }
  res.json ({
    success: true,
    message: "user is authenticated",
    data : user
  })
}



