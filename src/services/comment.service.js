import { prisma } from "../common/prisma/connect.prisma.js";
import {
  findOrFail,
  requireOwner,
} from "../common/helpers/app-error.helper.js";

const include = { user: { select: { name: true, avatar: true } } };
function present({ user, ...comment }) {
  return { ...comment, tenNguoiBinhLuan: user.name, avatar: user.avatar };
}
export const commentService = {
  async list(maPhong) {
    if (maPhong) await findOrFail(prisma.phong, maPhong);
    const comments = await prisma.binhLuan.findMany({
      where: maPhong ? { maPhong } : {},
      include,
      orderBy: { id: "asc" },
    });
    return comments.map(present);
  },
  async save(input, user, id) {
    requireOwner(user, input.maNguoiBinhLuan);
    return prisma.$transaction(async (tx) => {
      if (id)
        await tx.$queryRaw`SELECT id FROM BinhLuan WHERE id = ${id} FOR UPDATE`;
      if (id)
        requireOwner(user, (await findOrFail(tx.binhLuan, id)).maNguoiBinhLuan);
      await findOrFail(tx.phong, input.maPhong);
      await findOrFail(tx.nguoiDung, input.maNguoiBinhLuan);
      const comment = id
        ? await tx.binhLuan.update({ where: { id }, data: input, include })
        : await tx.binhLuan.create({ data: input, include });
      return present(comment);
    });
  },
  async remove(id, user) {
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM BinhLuan WHERE id = ${id} FOR UPDATE`;
      requireOwner(user, (await findOrFail(tx.binhLuan, id)).maNguoiBinhLuan);
      return tx.binhLuan.delete({ where: { id } });
    });
  },
};
