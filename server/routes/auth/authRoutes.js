import { Router } from "express";
import login from "./login.js";
import register from "./register.js";
import googleLogin from "./google.js";
import me from "./me.js";
import refreshToken from "./refreshToken.js";
import logout from "./logout.js";
import forgotPassword from "./forgotPassword.js";
import verifyOtp from "./verifyOtp.js";
import resetPassword from "./resetPassword.js";
import verifyEmail from "./verifyEmail.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/google", googleLogin);
router.get("/me", authMiddleware, me);
router.post("/logout",logout);
router.post("/refresh",refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);


export default router;