import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

export const createPost = asyncHandler(async (req, res) => {
  const myId = req.admin._id;

  const user = await User.findById(myId).select("-password -refreshToken");
  if (!user) throw new ApiError(400, "Unauthorized request");

  const { caption } = req.body;
  if (!caption?.trim()) throw new ApiError(400, "Caption is required");

  const mediaFiles = req.files?.media || [];
  if (mediaFiles.length === 0) throw new ApiError(400, "At least one media file required");

  const uploadedMedia = [];

  for (const file of mediaFiles) {
    const result = await uploadOnCloudinary(file.path);
    if (!result?.url) throw new ApiError(500, "Cloudinary upload failed");

    uploadedMedia.push({
      mediaURL: result.url,
      public_id: result.public_id
    });
  }

  const newPost = await Post.create({
    userId: myId,
    caption,
    media: uploadedMedia
  });

  res.status(201).json(new ApiResponse(201, newPost, "New post created"));
});


export const getMyPost = asyncHandler(async (req, res) => {
  const myId = req.admin._id;

  const UserPosts = await Post.find({ userId: myId }).sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, UserPosts, "UserPost fetched successfully"));
});

export const getUserPost = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const UserPosts = await Post.find({ userId: user._id }).sort({
    createdAt: -1,
  });

  res
    .status(200)
    .json(new ApiResponse(200, UserPosts, "UserPost fetched successfully"));
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const myId = req.admin._id;

  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .populate("userId", "username avatar fullName");

  const finalPosts = await Promise.all(
    posts.map(async (post) => {
      const isLiked = await Like.exists({ postId: post._id, userId: myId });

      return {
        _id: post._id,
        user: post.userId,
        caption: post.caption,
        media: post.media,
        isLiked: Boolean(isLiked),
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        createdAt: post.createdAt,
      };
    })
  );

  res.status(200).json(
    new ApiResponse(200, finalPosts, "All posts fetched successfully")
  );
});


export const deletePost = asyncHandler(async( req, res)=> {
  const { postId }  = req.params;
  const post = await Post.findById(postId)
  if(!post){
    throw new ApiError(404, "post not found")
  }


const isPostOwner = post.userId.toString() === req.admin._id.toString();
const isAdmin = req.admin.role === "admin";

if (!isPostOwner && !isAdmin) {
  throw new ApiError(403, "You cannot delete this post");
}

  // 1️Delete images from Cloudinary
  for (const media of post.media) {
    if (media.public_id) {
      await deleteFromCloudinary(media.public_id);
    }
  }

  await Comment.deleteMany({ postId });

  await Like.deleteMany({ postId });

  await Post.findByIdAndDelete(postId)

  res.status(200).json(
    new ApiResponse(200, {}, "User Post deleted successfully")
  )
  
})

export const postLike = asyncHandler(async (req, res) => {
  const myId = req.admin._id;
  const { postId } = req.params;

  if (!myId) {
    throw new ApiError(400, "unauthorized request");
  }

  const post = await Post.findById(postId).populate("userId");

  if (!post) {
    throw new ApiError(404, "post not found");
  }

  const alreadyLiked = await Like.findOne({ postId, userId: myId });

  if (alreadyLiked) {
    throw new ApiError(400, "You already liked this post");
  }

  await Like.create({
    userId: myId,
    postId: postId,
  });

  post.likesCount += 1;
  await post.save();



  res.status(200).json(
    new ApiResponse(
      200,
      { likesCount: post.likesCount },
      "post liked successfully",
    ),
  );
});

export const postUnlike = asyncHandler(async (req, res) => {
  const myId = req.admin._id;

  if (!myId) {
    throw new ApiError(400, "unauthorized request");
  }

  const { postId } = req.params;
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "post not found");
  }

  const alreadyLiked = await Like.findOne({ postId, userId: myId });

  if (!alreadyLiked) {
    throw new ApiError(400, "you didn't liked it yet");
  }

  await Like.deleteOne({ postId, userId: myId });

  if (post.likesCount > 0) {
    post.likesCount -= 1;
  }
  await post.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likesCount: post.likesCount },
        "post unliked successfully",
      ),
    );
});

export const comment = asyncHandler(async (req, res) => {
  const myId = req.admin._id;
  const { postId } = req.params;

  if (!myId) {
    throw new ApiError(400, "Unauthorized request");
  }

  const post = await Post.findById(postId).populate("userId");

  if (!post) {
    throw new ApiError(404, "post not found");
  }

  const { text } = req.body;

  if (!text || text.trim() === "") {
    throw new ApiError(400, "you must write something in your comment");
  }

  const newComment = await Comment.create({
    postId: postId,
    userId: myId,
    text: text.trim(),
  });

  post.commentsCount += 1;
  await post.save();



  res.status(201).json(
    new ApiResponse(
      201,
      {
        comment: newComment,
        commentsCount: post.commentsCount,
      },
      "comment added",
    ),
  );
});

export const getAllComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "post not found");
  }

  const comments = await Comment.find({ postId })
    .sort({ createdAt: -1 })
    .populate("userId", "username avatar");

  res
    .status(200)
    .json(new ApiResponse(200, comments, " comments get fetched successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  //auth if user logged In
  //only the post creator can delete the comment
  //only the comment creator can delete the comment
  //delete the comment document
  // -1 in commentCount
  //res

  const myId = req.admin._id;
  const myRole = req.admin.role;

  const { commentId } = req.params;

  const comment = await Comment.findOne({_id:commentId});

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  const post = await Post.findById(comment.postId);

  if (!post) {
    throw new ApiError(404, "post not found");
  }

  const postOwner = post.userId.toString() === myId.toString();
  const CommentOwner = comment.userId.toString() === myId.toString();
  const isAdmin = myRole === "admin";

  if (!postOwner && !CommentOwner && !isAdmin) {
    throw new ApiError(403, "Unauthorized request");
  }

  await Comment.deleteOne({ _id: commentId });

  if (post.commentsCount > 0) {
    post.commentsCount -= 1;
  }
  await post.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { commentsCount: post.commentsCount },
        "comment deleted successfully",
      ),
    );
});

export const getSinglePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const myId = req.admin._id;

  const post = await Post.findById(postId).populate(
    "userId",
    "username fullName avatar"
  );

  if (!post) {
    throw new ApiError(404, "post not found");
  }

  const isLiked = await Like.exists({ postId, userId: myId });

  const finalPost = {
    _id: post._id,
    user: post.userId,
    caption: post.caption,
    media: post.media,
    isLiked: Boolean(isLiked),
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
  };

  res.status(200).json(
    new ApiResponse(200, finalPost, "Post detail fetched successfully")
  );
});


export const getFeed = asyncHandler(async (req, res) => {
  const userId = req.admin._id;
  const limit = 10; // how many posts per request

  const { cursor } = req.query;
  let query = {};

  if (cursor) {
    query = { _id: { $lt: cursor } }; // only return posts older than last one
  }

  const posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "username avatar fullName");

  const formatted = await Promise.all(
    posts.map(async (post) => {
      const liked = await Like.exists({ userId, postId: post._id });

      return {
        _id: post._id,
        user: post.userId,
        caption: post.caption,
        media: post.media,
        isLiked: Boolean(liked),
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        createdAt: post.createdAt,
      };
    })
  );

  // Find next cursor
 const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id : null;

  res.status(200).json(
    new ApiResponse(200, {
      posts: formatted,
      nextCursor
    },
    "Feed fetched")
  );
});


