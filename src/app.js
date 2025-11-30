import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";




const app = express()


app.use(cors({
  origin: process.env.CORS_ORIGIN, 
  credentials: true,
   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
