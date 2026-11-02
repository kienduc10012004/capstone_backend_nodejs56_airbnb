import { userService } from "../services/user.service.js";
import { paginate } from "../services/catalog.service.js";
import { saveImage } from "../services/upload.service.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import {
  idSchema,
  paginationSchema,
} from "../common/validators/input.validator.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

export const userController = {
  async list(req, res) {
    responseSuccess(res, await userService.list());
  },
  async search(req, res) {
    responseSuccess(res, await userService.list(req.params.TenNguoiDung));
  },
  async page(req, res) {
    responseSuccess(
      res,
      await paginate(
        prisma.nguoiDung,
        "name",
        paginationSchema.parse(req.query),
        { password: true },
      ),
    );
  },
  async find(req, res) {
    responseSuccess(res, await userService.find(idSchema.parse(req.params.id)));
  },
  async create(req, res) {
    responseSuccess(res, await userService.create(req.input));
  },
  async update(req, res) {
    responseSuccess(
      res,
      await userService.update(idSchema.parse(req.params.id), req.input),
    );
  },
  async remove(req, res) {
    responseSuccess(
      res,
      await userService.remove(idSchema.parse(req.query.id)),
    );
  },
  async avatar(req, res) {
    responseSuccess(res, await saveImage("avatar", req.user.id, req.file));
  },
};
