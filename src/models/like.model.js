import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Prevent a user from liking the same post more than once
likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema); 
