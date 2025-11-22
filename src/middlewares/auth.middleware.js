import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req , res , next)=> {
  try {
     const token =  req.cookies?.accessToken || req.header("Authorization")?.repalce("Bearer ", "")
  
     if(!token){
      throw new ApiError(401, "Unauthorized request")
     }
  
     const decodedInformation = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
     console.log(decodedInformation)
  
     const admin = await User.findById(decodedInformation?._id).select("-password -refreshToken")
  
     if(!admin){
      throw new ApiError(401, "Invalid Access Token")
     }
  
     req.admin = admin
     next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
})