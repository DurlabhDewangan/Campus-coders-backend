import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    mobile: {
      type: Number,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    avatar: {
      type: String,
      default: ""   
    },

    bio: {
      type: String,
      default: ""
    },

    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"  
      }
    ],

    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    inviteCodeUsed: {
      type: String,
      required: true,
      trim: true
},

    refreshToken: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true 
  }
);

userSchema.pre("save", async function (next) {
  // Only hash password if it was modified or is new
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
 return await  bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  jwt.sign({
    _id:this._id,
    email:this.email,   
     username:this.username,
  },
process.env.ACCESS_TOKEN_SECRET
,
 { expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
)
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
    _id:this._id,
  },
process.env.REFRESH_TOKEN_SECRET
,
 { expiresIn : process.env.REFRESH_TOKEN_EXPIRY}
)
}



export const User = mongoose.model("User", userSchema);
