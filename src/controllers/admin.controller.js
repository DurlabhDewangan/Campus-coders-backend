import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateInviteCode } from "../models/inviteCode.model.js";
import { InviteCode } from "../models/inviteCode.model.js";

export const generateAccessAndRefreshToken = async (userId) => {
  try {
    const admin = await User.findById(userId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    const adminsave = await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generateAccessAndRefreshToken ",
    );
  }
};

export const loginAdmin = asyncHandler(async (req, res) => {
  //get data from body
  //check if all field are filled - validation
  // check if username or email existed or not
  //check password is correct
  //generate tokens
  //send cookies
  //redirect to dashboard

  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    throw new ApiError(400, "username or email and passowrd required");
  }

  const admin = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  if (admin.role !== "admin") {
    throw new ApiError(400, "access denied, you are not an admin");
  }

  const passwordResult = await admin.isPasswordCorrect(password);
 
  if (!passwordResult) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    admin._id,
  );

  const loggedInAdmin = await User.findById(admin._id).select(
    "-password -refreshToken",
  );

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,  
  sameSite: isProduction ? "none" : "lax",
};


  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInAdmin,
          accessToken,
          refreshToken,
        },
        "Admin logged in successfully",
      ),
    );
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.admin,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,  
  sameSite: isProduction ? "none" : "lax",
};


  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, " logged out successfully"));
});

export const inviteCodeGenerate = asyncHandler(async (req, res) => {
  const admin = req.admin;
  if (admin.role !== "admin") {
    throw new ApiError(400, "unauthorized request");
  }
  console.log("we are going to start generating code");
  const invitecode = generateInviteCode();


  const databaseInviteCode = await InviteCode.create({
    code: invitecode,
    createdBy: admin._id,
  });

  console.log(databaseInviteCode);

  if (!databaseInviteCode) {
    throw new ApiError(
      500,
      "something went wrong while storing the invite code in database",
    );
  }

  const createdCode = await InviteCode.findById(databaseInviteCode.id).populate(
    "createdBy", "fullName username",
  );


  res
    .status(200)
    .json(
      new ApiResponse(200, createdCode, "invite code generated successfully"),
    );
});
