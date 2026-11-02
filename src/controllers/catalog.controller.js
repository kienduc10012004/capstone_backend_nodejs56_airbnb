import {
  locationService,
  roomService,
  paginate,
} from "../services/catalog.service.js";
import { saveImage } from "../services/upload.service.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import {
  idSchema,
  paginationSchema,
} from "../common/validators/input.validator.js";
import { responseSuccess } from "../common/helpers/response.helper.js";

function catalogController(service, model, searchField, imageKind, queryId) {
  return {
    async list(req, res) {
      responseSuccess(res, await service.list());
    },
    async find(req, res) {
      responseSuccess(res, await service.find(idSchema.parse(req.params.id)));
    },
    async create(req, res) {
      responseSuccess(res, await service.create(req.input));
    },
    async update(req, res) {
      responseSuccess(
        res,
        await service.update(idSchema.parse(req.params.id), req.input),
      );
    },
    async remove(req, res) {
      responseSuccess(res, await service.remove(idSchema.parse(req.params.id)));
    },
    async page(req, res) {
      responseSuccess(
        res,
        await paginate(model, searchField, paginationSchema.parse(req.query)),
      );
    },
    async upload(req, res) {
      responseSuccess(
        res,
        await saveImage(
          imageKind,
          idSchema.parse(req.query[queryId]),
          req.file,
        ),
      );
    },
  };
}
export const locationController = catalogController(
  locationService,
  prisma.viTri,
  "tenViTri",
  "location",
  "maViTri",
);
export const roomController = {
  ...catalogController(
    roomService,
    prisma.phong,
    "tenPhong",
    "room",
    "maPhong",
  ),
  async byLocation(req, res) {
    const id = idSchema.parse(req.query.maViTri);
    await locationService.find(id);
    responseSuccess(res, await roomService.list(id));
  },
};
