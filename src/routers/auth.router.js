import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authController } from "../controllers/auth.controller.js";
import {
  signupSchema,
  signinSchema,
  validateBody,
} from "../common/validators/input.validator.js";

const router = Router();
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) =>
      res
        .status(429)
        .json({
          statusCode: 429,
          message: "Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau.",
          content: null,
        }),
  }),
);
router.post("/signup", validateBody(signupSchema), authController.signup);
router.post("/signin", validateBody(signinSchema), authController.signin);
export default router;
