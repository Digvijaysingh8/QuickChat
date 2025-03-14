import { generateWebToken } from "../lib/utils.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

import cloudinary from "../lib/cloudinary.js";

import bcrypt from "bcryptjs";


export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill all details." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // ✅ Generate and store JWT in cookies
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true, // ✅ Prevent JavaScript access for security
      secure: process.env.NODE_ENV === "production", // ✅ Only set in HTTPS production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7 days
    });

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic || "", // Avoid sending `undefined`
    });

  } catch (error) {
    console.error("Error in signUp:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login =async (req,res)=>{

const {email , password} = req.body;

 try{
  const user = await User.findOne({email})

  if(!user){
    return res.status(400).json({
      message:"Invalid credentials"
    })
  }

  const isPasswordCorrect = await bcrypt.compare(password,user.password);
  if(!isPasswordCorrect){
    return res.status(400).json({
      message:"Invalid credentials"
    })
  }
  else{
    generateWebToken(user._id,res)
    return res.status(200).json({
      _id:user._id,
      fullName:user.fullName,
      email:user.email,
      profilePic:user.profilePic,
    })

  }

 }catch(error){
  console.log("Error in login code",error.message);
  res.status(500).json({
    message:"Internal server error"
  })
 }
}
export const logout = (req,res)=>{
 try{
res.cookie("jwt","",{maxAge:0})
return res.status(200).json({
  message:"Logged out successfully"
})
 }catch(error){
  console.log("Error in logout code",error.message);
  res.status(500).json({
    message:"Internal server error"
  })
 }
}

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body; // Fix typo: profiPic -> profilePic
    const userId = req.user?.id; // Ensure req.user exists

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic required." });
    }

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const checkAuth = async (req,res)=>{
  try{
    res.status(200).json(req.user)
  }catch(error){
    console.log("error in error in checkAuth controller",error);
    res.status(500).json({
      message:"Internal server error"
    })
  }
}