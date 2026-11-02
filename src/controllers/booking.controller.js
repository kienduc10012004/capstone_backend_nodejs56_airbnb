import { bookingService } from "../services/booking.service.js";
import { idSchema } from "../common/validators/input.validator.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const bookingController = {
  async list(req, res) {
    responseSuccess(res, await bookingService.list(req.user));
  },
  async find(req, res) {
    responseSuccess(
      res,
      await bookingService.find(idSchema.parse(req.params.id), req.user),
    );
  },
  async byUser(req, res) {
    responseSuccess(
      res,
      await bookingService.byUser(
        idSchema.parse(req.params.MaNguoiDung),
        req.user,
      ),
    );
  },
  async create(req, res) {
    responseSuccess(res, await bookingService.save(req.input, req.user));
  },
  async update(req, res) {
    responseSuccess(
      res,
      await bookingService.save(
        req.input,
        req.user,
        idSchema.parse(req.params.id),
      ),
    );
  },
  async remove(req, res) {
    responseSuccess(
      res,
      await bookingService.remove(idSchema.parse(req.params.id), req.user),
    );
  },
};
