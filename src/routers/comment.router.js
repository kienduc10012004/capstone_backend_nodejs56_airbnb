import { Router } from "express";
import { commentController as controller } from "../controllers/comment.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";
import {
  commentSchema,
  validateBody,
} from "../common/validators/input.validator.js";

const router = Router();
router.get("/", controller.list);
router.get("/lay-binh-luan-theo-phong/:MaPhong", controller.byRoom);
router.post("/", protect, validateBody(commentSchema), controller.create);
router.put("/:id", protect, validateBody(commentSchema), controller.update);
router.delete("/:id", protect, controller.remove);
export default router;
