import { Router } from "express";
import { locationController as controller } from "../controllers/catalog.controller.js";
import {
  protect,
  adminOnly,
} from "../common/middlewares/protect.middleware.js";
import { uploadImage } from "../common/multer/image.multer.js";
import {
  locationSchema,
  validateBody,
} from "../common/validators/input.validator.js";

const router = Router();
router.get("/", controller.list);
router.get("/phan-trang-tim-kiem", controller.page);
router.get("/:id", controller.find);
router.post(
  "/",
  protect,
  adminOnly,
  validateBody(locationSchema),
  controller.create,
);
router.put(
  "/:id",
  protect,
  adminOnly,
  validateBody(locationSchema),
  controller.update,
);
router.delete("/:id", protect, adminOnly, controller.remove);
router.post(
  "/upload-hinh-vitri",
  protect,
  adminOnly,
  uploadImage,
  controller.upload,
);
export default router;
