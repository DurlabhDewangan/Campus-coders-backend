import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const registerUser = asyncHandler(async (req, res) => {
  //get user data(username,fullname,email,mobile,password,invitecode)
  //check if there is any field missing
  //if yes, then error msg
  //if no, check if user already exists
  // check invitecode is correct or not
  //if wrong , tell them invalid invite code
  //if correct, user register successfully
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res

  const { fullName, username, email, mobile, password, inviteCodeUsed } =
    req.body;

  if (fullName == "") {
    throw new ApiError(400, "FullName is required");
  }
  if (username == "") {
    throw new ApiError(400, "username is required");
  }
  if (email == "") {
    throw new ApiError(400, "email is required");
  }
  if (mobile == "") {
    throw new ApiError(400, "mobile number is required");
  }
  if (password == "") {
    throw new ApiError(400, "password is required");
  }
  if (inviteCodeUsed == "") {
    throw new ApiError(400, "inviteCode is required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }, { inviteCodeUsed }],
  });

  if (existedUser){
    throw new ApiError(409, "User is already exist")
  }


  
});
