import { Router } from "express";
import { comment, createPost, deleteComment, deletePost, getAllComment, getAllPosts, getMyPost, getSinglePost, getUserPost, postLike, postUnlike } from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

export const postRouter = Router()

//secure routes
postRouter.route("/createPost").post(verifyJWT,
    upload.fields([{ name: "media", maxCount: 10 }]),
    createPost)

postRouter.route("/getMyPosts").get(verifyJWT,getMyPost)
postRouter.route("/getUserPost/:username").get(verifyJWT,getUserPost)
postRouter.route("/getAllPost").get(verifyJWT, getAllPosts)
postRouter.route("/postLike/:postId").get(verifyJWT, postLike)
postRouter.route("/postUnlike/:postId").get(verifyJWT, postUnlike)
postRouter.route("/comment/:postId").post(verifyJWT, comment)
postRouter.route("/getAllComments/:postId").get(verifyJWT, getAllComment)
postRouter.route("/getSinglePost/:postId").get(verifyJWT, getSinglePost)
postRouter.route("/deleteComment/:commentId").delete(verifyJWT, deleteComment)
postRouter.route("/deletePost/:postId").delete(verifyJWT, deletePost)