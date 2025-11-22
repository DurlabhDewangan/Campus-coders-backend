import { Router } from "express";
import { loginAdmin, logout, inviteCodeGenerate} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const adminRouter = Router()

adminRouter.route("/login").post(loginAdmin)

//authorized routes
adminRouter.route("/logout").post(verifyJWT, logout)
adminRouter.route("/generateCode").post(verifyJWT, inviteCodeGenerate)
