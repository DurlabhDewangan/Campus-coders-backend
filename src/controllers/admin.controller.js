import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const admin = await User.findById(userId);
    const accessToken = admin.generateAccessToken();
    console.log(accessToken);
    const refreshToken = admin.generateRefreshToken();
    console.log(refreshToken);

    admin.refreshToken = refreshToken;
    const adminsave = await admin.save({ validateBeforeSave: false });
    console.log("what is there on updating on field", adminsave);

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
  //check passoword is correct
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

  console.log(admin);
  const passwordResult = await admin.isPasswordCorrect(password);

  if (!passwordResult) {
    throw new ApiError(401, "Invalid password");
  }

  console.log(passwordResult);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    admin._id,
  );

  const loggedInAdmin = await User.findById(admin._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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

export const logoutAdmin = asyncHandler(async (res, req) => {
  await User.findByIdAndUpdate(
    req.admin._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

    const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "Admin logged out successfully"))

});
