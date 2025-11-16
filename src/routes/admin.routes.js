import { Router } from "express";
import { loginAdmin } from "../controllers/admin.controller";
import { logoutAdmin } from "../controllers/admin.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const adminRouter = Router()

adminRouter.route("/api/v1/loginAdmin").post(loginAdmin)

//authorized routes
adminRouter.route("/api/v1/logoutAdmin").post(verifyJWT, logoutAdmin)
