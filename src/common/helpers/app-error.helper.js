export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function requireOwner(user, ownerId) {
  if (user.role !== "ADMIN" && user.id !== ownerId) {
    throw new AppError(403, "Bạn không có quyền thao tác dữ liệu này.");
  }
}

export async function findOrFail(model, id) {
  const record = await model.findUnique({ where: { id } });
  if (!record) throw new AppError(404, "Không tìm thấy dữ liệu.");
  return record;
}
