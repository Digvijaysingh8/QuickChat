import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protectRoute = async (req,res,next)=>{
  try{
    console.log("helloff");
    const token = req.cookies.jwt;
    if(!token){
      console.log("helloff1");
      return res.status(401).json({
        message:"Unauthorised- no token provided!!"
      })
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    if(!decoded){
      console.log("helloff69");
      return res.status(401).json({
        message:"Token is invalid!!"
      })
    }

    const user = await User.findById(decoded.userId).select("-password");
    if(!user){
      return res.status(404).json({
        console.log("helloff6");
        message:" User not found!!"
      })
    }

    req.user = user;

    next();

  }catch(error){
    console.log("Error in Protectroute middleware",error.message);
    res.status(500).json({
      message:"Internal server error"
    })
    }
  }
