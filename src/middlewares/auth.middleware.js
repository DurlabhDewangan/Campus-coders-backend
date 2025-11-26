import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access token expired",
          expired: true,
        });
      }

      throw new ApiError(401, "Invalid access token");
    }

    const admin = await User.findById(decoded._id).select("-password -refreshToken");

    if (!admin) {
      throw new ApiError(401, "User not found for this token");
    }

    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Authentication failed");
  }
});
