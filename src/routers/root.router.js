import { Router } from "express";
import authRouter from "./auth.router.js";
import userRouter from "./user.router.js";
import locationRouter from "./location.router.js";
import roomRouter from "./room.router.js";
import bookingRouter from "./booking.router.js";
import commentRouter from "./comment.router.js";

const router = Router();
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/vi-tri", locationRouter);
router.use("/phong-thue", roomRouter);
router.use("/dat-phong", bookingRouter);
router.use("/binh-luan", commentRouter);
export default router;
