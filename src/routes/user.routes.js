import { Router } from "express";
import { loginUser, registerUser, profileManagement, setAvatar, getMyProfile, getUserProfile, isFollowing, unfollowUser, followUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { logout } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

export const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secure routes 
router.route("/profilemanagement").post(verifyJWT,
  profileManagement)
;
router.route("/setAvatar").post(verifyJWT,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    setAvatar)

router.route("/getMyProfile").get(verifyJWT,getMyProfile)


router.route("/getUserProfile/:username").get(verifyJWT,getUserProfile)

// router.get("/getUserProfile/:username", verifyJWT, getUserProfile);
router.route("/isFollowing/:username").get(verifyJWT,isFollowing)

router.route("/follow/:username").get(verifyJWT,followUser)

router.route("/unfollow/:username").get(verifyJWT,unfollowUser)

router.route("/logout").post(logout)


