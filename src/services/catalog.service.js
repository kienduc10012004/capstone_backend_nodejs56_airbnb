import { prisma } from "../common/prisma/connect.prisma.js";
import { AppError, findOrFail } from "../common/helpers/app-error.helper.js";

export async function paginate(
  model,
  field,
  { pageIndex, pageSize, keyword },
  omit,
) {
  const where = { [field]: { contains: keyword } };
  const [totalRow, data] = await prisma.$transaction([
    model.count({ where }),
    model.findMany({
      where,
      skip: (pageIndex - 1) * pageSize,
      take: pageSize,
      orderBy: { id: "asc" },
      omit,
    }),
  ]);
  return {
    pageIndex,
    pageSize,
    totalRow,
    totalPages: Math.ceil(totalRow / pageSize),
    data,
  };
}

export const locationService = {
  list: () => prisma.viTri.findMany({ orderBy: { id: "asc" } }),
  find: (id) => findOrFail(prisma.viTri, id),
  create: (input) => prisma.viTri.create({ data: input }),
  update: (id, input) => prisma.viTri.update({ where: { id }, data: input }),
  remove: (id) => prisma.viTri.delete({ where: { id } }),
};

export const roomService = {
  list: (maViTri) =>
    prisma.phong.findMany({
      where: maViTri ? { maViTri } : {},
      orderBy: { id: "asc" },
    }),
  find: (id) => findOrFail(prisma.phong, id),
  async create(input) {
    await findOrFail(prisma.viTri, input.maViTri);
    return prisma.phong.create({ data: input });
  },
  async update(id, input) {
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM Phong WHERE id = ${id} FOR UPDATE`;
      await findOrFail(tx.phong, id);
      await findOrFail(tx.viTri, input.maViTri);
      const oversized = await tx.datPhong.findFirst({
        where: { maPhong: id, soLuongKhach: { gt: input.khach } },
      });
      if (oversized)
        throw new AppError(
          409,
          "Sức chứa mới nhỏ hơn số khách của đặt phòng hiện có.",
        );
      return tx.phong.update({ where: { id }, data: input });
    });
  },
  remove: (id) => prisma.phong.delete({ where: { id } }),
};
