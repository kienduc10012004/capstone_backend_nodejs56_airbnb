import { commentService } from "../services/comment.service.js";
import { idSchema } from "../common/validators/input.validator.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const commentController = {
  async list(req, res) {
    responseSuccess(res, await commentService.list());
  },
  async byRoom(req, res) {
    responseSuccess(
      res,
      await commentService.list(idSchema.parse(req.params.MaPhong)),
    );
  },
  async create(req, res) {
    responseSuccess(res, await commentService.save(req.input, req.user));
  },
  async update(req, res) {
    responseSuccess(
      res,
      await commentService.save(
        req.input,
        req.user,
        idSchema.parse(req.params.id),
      ),
    );
  },
  async remove(req, res) {
    responseSuccess(
      res,
      await commentService.remove(idSchema.parse(req.params.id), req.user),
    );
  },
};
