import { Router } from "express";
import { bookingController as controller } from "../controllers/booking.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";
import {
  bookingSchema,
  validateBody,
} from "../common/validators/input.validator.js";

const router = Router();
router.use(protect);
router.get("/", controller.list);
router.get("/lay-theo-nguoi-dung/:MaNguoiDung", controller.byUser);
router.get("/:id", controller.find);
router.post("/", validateBody(bookingSchema), controller.create);
router.put("/:id", validateBody(bookingSchema), controller.update);
router.delete("/:id", controller.remove);
export default router;
