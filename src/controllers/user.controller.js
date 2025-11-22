import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { InviteCode } from "../models/inviteCode.model.js";
import { generateAccessAndRefreshToken } from "./admin.controller.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Both admin and user use the same logout controller

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

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User is already exist");
  }

  const databaseInviteCode = await InviteCode.findOne({ code: inviteCodeUsed });

  if (!databaseInviteCode) {
    throw new ApiError(400, "Invalid invite code");
  }

  if (databaseInviteCode.code !== inviteCodeUsed) {
    throw new ApiError(400, "invalid invite code");
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    password,
    email,
    mobile,
    inviteCodeUsed,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

    await InviteCode.findOneAndUpdate(
    { code: inviteCodeUsed }, // find the invite code
    {
      isUsed: true,
      usedBy: user._id, // the user who just registered
    },
    { new: true },
  );

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
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

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const passwordResult = await user.isPasswordCorrect(password);

  if (!passwordResult) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
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
          user: loggedInUser,
        },
        "User logged in successfully",
      ),
    );
});

export const setAvatar = asyncHandler(async(req, res)=> {
  const user = req.admin;
   const confirmedUser = await User.findById(user._id);

  if (!confirmedUser) {
    throw new ApiError(400, "user not found");
  }

   // check if a file was uploaded
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  console.log("this is the req.files", req.files)
  console.log("this is the req.files.avatar", req.files.avatar)

  let uploadedAvatarUrl =
    "https://image.winudf.com/v2/image1/Y29tLm1pbmlhcmthbm8uZGVmYXVsdHBmcF9zY3JlZW5fM18xNjgzNzc5MDE1XzAxMQ/screen-3.jpg?fakeurl=1&type=.jpg"; // default avatar

  // If avatar is uploaded → upload to Cloudinary
  if (avatarLocalPath) {
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    uploadedAvatarUrl = uploadedAvatar?.url || uploadedAvatarUrl;
  }

   const updatedUser = await User.findByIdAndUpdate(
    confirmedUser._id,
    {
      $set: {
        avatar: uploadedAvatarUrl,
      },
    },
    { new: true },
  ).select("-password -refreshToken")

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "ProfilePic setup completed"));
});


export const profileManagement = asyncHandler(async (req, res) => {
                                                                                                       //check if user is logged in or not
                                                                                                       //check users profile completed or not
                                                                                                       //allow him/her to setup the profile
                                                                                                       //setup profile pic
                                                                                                       //setup bio
                                                                                                       //setup course and year
                                                                                                       //setup gender
                                                                                                       //complete setup tick true to profile completed
  const user = req.admin;
  if (!user) {
    throw new ApiError(400, "unauthorized request");
  }
  const confirmedUser = await User.findById(user._id);

  if (!confirmedUser) {
    throw new ApiError(400, "user not found");
  }

  const { gender, course, year, bio } = req.body;

  if (!gender) {
    throw new ApiError(400, "gender is required");
  }
  if (!course) {
    throw new ApiError(400, "course is required");
  }
  if (!year) {
    throw new ApiError(400, "year is required");
  }

 
  const updatedUser = await User.findByIdAndUpdate(
    confirmedUser._id,
    {
      $set: {
        gender:gender,
        course:course,
        year:year,
        bio:bio,
        profileCompleted: true,
      },
    },
    { new: true },
  ).select("-password -refreshToken")

  res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Profile setup completed"));
});

export const getMyProfile = asyncHandler(async(req, res) => {
 const user = req.admin;
 const myProfile = await User.findById(user._id).select("-password -refreshToken")
 if(!myProfile){
  throw new ApiError(400, "user not found")
 }
 res.status(200).json(
  new ApiResponse(200, myProfile, "profile fetched succesfully"
 ))
})

export const getUserProfile = asyncHandler(async(req, res) => {

 const { username } = req.params; // get username from URL
 if(!username){
  throw new ApiError(400, "the username in params in empty or wrong")
 }
  const userProfile = await User.findOne({ username : username}).select("-password -refreshToken")

   if (!userProfile) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, userProfile, "user profile fetched successfully")
  )
  
})


 export const isFollowing = asyncHandler(async (req, res) => {
  const myId = req.admin._id; 
  const { username } = req.params; 

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // check if my ID is inside the user's followers array
  const isFollowing = user.followers.some((objectId) => {
    return objectId.toString() === myId.toString()});

  res.status(200).json(
    new ApiResponse(
      200,
      { isFollowing },
      "Follow status fetched successfully"
    )
  );
});


export const followUser = asyncHandler(async(req, res) => {
  //user profile-username
  //req.admin-follower(my account)
  //hit the apiendpoint 
  // add follower to the user's follower array 
  // add the user's username to the followering array
  //res 
  const myId = req.admin._id
  const { username } = req.params;
  
  const user = await User.findOne({username:username})
  if(!user){
    throw new ApiError(404, "user not found")
  }

    // prevent user from following themselves
  if (user._id.toString() === myId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }


  await User.findByIdAndUpdate(user._id, {
    $addToSet:{
       followers:myId
    }
  })

  await User.findByIdAndUpdate(myId,
  {  $addToSet:{
      following:user._id
    }}
  )

  res.status(200).json(
    new ApiResponse(200, {}, "User followed successfully")
  )


})
export const unfollowUser = asyncHandler(async(req, res) => {
  //user profile-username
  //req.admin-follower(my account)
  //hit the apiendpoint 
  // remove follower to the user's follower array 
  // remove the user's username to the followering array
  //res 
   const myId = req.admin._id
  const { username } = req.params;
  
  const user = await User.findOne({username:username})
  if(!user){
    throw new ApiError(404, "user not found")
  }

    // prevent user from following themselves
  if (user._id.toString() === myId.toString()) {
    throw new ApiError(400, "You cannot unfollow yourself");
  }


  await User.findByIdAndUpdate(user._id, {
    $pull:{
       followers:myId
    }
  })

  await User.findByIdAndUpdate(myId,
  {  $pull:{
      following:user._id
    }}
  )

  res.status(200).json(
    new ApiResponse(200, {}, "User unfollowed successfully")
  )


})
  



