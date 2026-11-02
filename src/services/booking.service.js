import { prisma } from "../common/prisma/connect.prisma.js";
import {
  AppError,
  findOrFail,
  requireOwner,
} from "../common/helpers/app-error.helper.js";

export const bookingService = {
  list(user) {
    return prisma.datPhong.findMany({
      where: user.role === "ADMIN" ? {} : { maNguoiDung: user.id },
      orderBy: { id: "asc" },
    });
  },
  async find(id, user) {
    const booking = await findOrFail(prisma.datPhong, id);
    requireOwner(user, booking.maNguoiDung);
    return booking;
  },
  async byUser(id, user) {
    requireOwner(user, id);
    await findOrFail(prisma.nguoiDung, id);
    return prisma.datPhong.findMany({
      where: { maNguoiDung: id },
      orderBy: { id: "asc" },
    });
  },
  async save(input, user, id) {
    requireOwner(user, input.maNguoiDung);
    return prisma.$transaction(
      async (tx) => {
        if (id) {
          await tx.$queryRaw`SELECT id FROM DatPhong WHERE id = ${id} FOR UPDATE`;
        }
        // A room lock serializes overlap checks, including two concurrent first bookings.
        await tx.$queryRaw`SELECT id FROM Phong WHERE id = ${input.maPhong} FOR UPDATE`;
        const room = await findOrFail(tx.phong, input.maPhong);
        if (id) {
          const previous = await findOrFail(tx.datPhong, id);
          requireOwner(user, previous.maNguoiDung);
        }
        await findOrFail(tx.nguoiDung, input.maNguoiDung);
        if (input.soLuongKhach > room.khach)
          throw new AppError(400, "Số khách vượt sức chứa của phòng.");
        const overlap = await tx.datPhong.findFirst({
          where: {
            maPhong: input.maPhong,
            ...(id ? { id: { not: id } } : {}),
            ngayDen: { lt: input.ngayDi },
            ngayDi: { gt: input.ngayDen },
          },
        });
        if (overlap)
          throw new AppError(
            409,
            "Phòng đã được đặt trong khoảng thời gian này.",
          );
        return id
          ? tx.datPhong.update({ where: { id }, data: input })
          : tx.datPhong.create({ data: input });
      },
      { isolationLevel: "ReadCommitted" },
    );
  },
  async remove(id, user) {
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM DatPhong WHERE id = ${id} FOR UPDATE`;
      const booking = await findOrFail(tx.datPhong, id);
      requireOwner(user, booking.maNguoiDung);
      return tx.datPhong.delete({ where: { id } });
    });
  },
};
