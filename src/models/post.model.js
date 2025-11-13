import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    caption: {
      type: String,
      default: ""
    },

    // Multiple photos supported (carousel)
    media: [
      {
        type: String, // store image URLs
        required: true
      }
    ],

    likesCount: {
      type: Number,
      default: 0
    },

    commentsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true 
  }
);

export const Post = mongoose.model("Post", postSchema);
