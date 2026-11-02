import { Router } from "express";
import { roomController as controller } from "../controllers/catalog.controller.js";
import {
  protect,
  adminOnly,
} from "../common/middlewares/protect.middleware.js";
import { uploadImage } from "../common/multer/image.multer.js";
import {
  roomSchema,
  validateBody,
} from "../common/validators/input.validator.js";

const router = Router();
router.get("/", controller.list);
router.get("/lay-phong-theo-vi-tri", controller.byLocation);
router.get("/phan-trang-tim-kiem", controller.page);
router.get("/:id", controller.find);
router.post(
  "/",
  protect,
  adminOnly,
  validateBody(roomSchema),
  controller.create,
);
router.put(
  "/:id",
  protect,
  adminOnly,
  validateBody(roomSchema),
  controller.update,
);
router.delete("/:id", protect, adminOnly, controller.remove);
router.post(
  "/upload-hinh-phong",
  protect,
  adminOnly,
  uploadImage,
  controller.upload,
);
export default router;
