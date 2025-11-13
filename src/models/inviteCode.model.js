import mongoose, {Schema} from "mongoose";

const inviteCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },

    isUsed: {
      type: Boolean,
      default: false
    },

    usedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // admin user
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("InviteCode", inviteCodeSchema);
