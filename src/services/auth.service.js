import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../common/prisma/connect.prisma.js";
import { jwtSecret } from "../common/constants/app.constant.js";
import { AppError } from "../common/helpers/app-error.helper.js";

export function publicUser({ password, ...user }) {
  return user;
}

export const authService = {
  async signup(input) {
    const password = await bcrypt.hash(input.password, 12);
    const user = await prisma.nguoiDung.create({
      data: { ...input, password, role: "USER" },
    });
    return publicUser(user);
  },
  async signin({ email, password }) {
    const user = await prisma.nguoiDung.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, "Email hoặc mật khẩu không đúng.");
    }
    const token = jwt.sign({ id: user.id }, jwtSecret, {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
    return { user: publicUser(user), token };
  },
};
