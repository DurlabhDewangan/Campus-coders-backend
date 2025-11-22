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

export const generateInviteCode = function generateInviteCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";

  for (let i = 0; i < 10; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return code;
};  


export const InviteCode = mongoose.model("InviteCode", inviteCodeSchema);
