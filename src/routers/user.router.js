import { Router } from "express";
import { userController as controller } from "../controllers/user.controller.js";
import {
  protect,
  adminOnly,
} from "../common/middlewares/protect.middleware.js";
import { uploadImage } from "../common/multer/image.multer.js";
import {
  signupSchema,
  userUpdateSchema,
  validateBody,
} from "../common/validators/input.validator.js";

const router = Router();
router.post("/upload-avatar", protect, uploadImage, controller.avatar);
router.use(protect, adminOnly);
router.get("/", controller.list);
router.post("/", validateBody(signupSchema), controller.create);
router.delete("/", controller.remove);
router.get("/phan-trang-tim-kiem", controller.page);
router.get("/search/:TenNguoiDung", controller.search);
router.get("/:id", controller.find);
router.put("/:id", validateBody(userUpdateSchema), controller.update);
export default router;
