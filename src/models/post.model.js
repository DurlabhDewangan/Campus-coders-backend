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

    // store both URL and public_id for each image
    media: [
      {
        mediaURL: { type: String, required: true },
        public_id: { type: String, required: true }
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
  { timestamps: true }
);


export const Post = mongoose.model("Post", postSchema);
