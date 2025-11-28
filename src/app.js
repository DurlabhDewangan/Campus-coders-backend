import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";


console.log("runnig, running ")

const app = express()

console.log("still running")
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import { router } from "./routes/user.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { postRouter } from "./routes/post.routes.js";

//routes declaration
app.use("/api/v1/users", router)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/post", postRouter)

export { app }
