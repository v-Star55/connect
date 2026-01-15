import { Router } from "express";
import authRoutes from "./auth/authRoutes.js";
import userRoute from "./user/userRoute.js";
import authMiddleware from "../middleware/authMiddleware.js";
import chatRoute from "./chats/chatRoute.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/user", authMiddleware, userRoute);
router.use("/chat", authMiddleware, chatRoute);


export default router;