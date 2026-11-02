import bcrypt from "bcrypt";
import { prisma } from "../common/prisma/connect.prisma.js";
import { findOrFail } from "../common/helpers/app-error.helper.js";
import { publicUser } from "./auth.service.js";

export const userService = {
  async list(keyword = "") {
    const users = await prisma.nguoiDung.findMany({
      where: { name: { contains: keyword } },
      orderBy: { id: "asc" },
    });
    return users.map(publicUser);
  },
  async find(id) {
    return publicUser(await findOrFail(prisma.nguoiDung, id));
  },
  async create(input) {
    const password = await bcrypt.hash(input.password, 12);
    return publicUser(
      await prisma.nguoiDung.create({ data: { ...input, password } }),
    );
  },
  async update(id, input) {
    return publicUser(
      await prisma.nguoiDung.update({ where: { id }, data: input }),
    );
  },
  async remove(id) {
    return publicUser(await prisma.nguoiDung.delete({ where: { id } }));
  },
};
