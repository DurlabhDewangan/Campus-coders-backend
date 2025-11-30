import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


export const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();

  if (!query || query.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { users: [], count: 0 }, "Empty query")
    );
  }

  const currentUserId = req.admin?._id;

  const users = await User.find({
    username: { $regex: query, $options: "i" }, // <-- partial search
    _id: { $ne: currentUserId }
  })
    .select("-password -refreshToken")
    .limit(20);

  return res.status(200).json(
    new ApiResponse(200, { users, count: users.length }, "Users found successfully")
  );
});
