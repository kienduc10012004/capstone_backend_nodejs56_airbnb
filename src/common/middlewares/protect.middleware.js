import jwt from "jsonwebtoken";
import { prisma } from "../prisma/connect.prisma.js";
import { jwtSecret } from "../constants/app.constant.js";
import { AppError } from "../helpers/app-error.helper.js";

export async function protect(req, res, next) {
  const token =
    req.get("token") || req.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new AppError(401, "Vui lòng đăng nhập.");
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw new AppError(401, "Token không hợp lệ hoặc hết hạn.");
  }
  if (!Number.isInteger(payload.id))
    throw new AppError(401, "Token không hợp lệ.");
  req.user = await prisma.nguoiDung.findUnique({
    where: { id: payload.id },
    select: { id: true, role: true },
  });
  if (!req.user) throw new AppError(401, "Tài khoản không còn tồn tại.");
  next();
}

export function adminOnly(req, res, next) {
  if (req.user.role !== "ADMIN")
    throw new AppError(403, "Chỉ quản trị viên được phép thao tác.");
  next();
}
