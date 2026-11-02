import { authService } from "../services/auth.service.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const authController = {
  async signup(req, res) {
    responseSuccess(res, await authService.signup(req.input));
  },
  async signin(req, res) {
    responseSuccess(res, await authService.signin(req.input));
  },
};
