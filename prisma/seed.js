import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/common/prisma/connect.prisma.js";

try {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (
    !email ||
    !password ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  )
    throw new Error(
      "Configure SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (8+ characters).",
    );
  await prisma.nguoiDung.upsert({
    where: { email },
    update: {},
    create: {
      name: "Quản trị viên",
      email,
      password: await bcrypt.hash(password, 12),
      phone: "0900000000",
      birthday: "2000-01-01",
      gender: true,
      role: "ADMIN",
    },
  });
  const location = await prisma.viTri.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tenViTri: "Quận 1",
      tinhThanh: "Hồ Chí Minh",
      quocGia: "Việt Nam",
    },
  });
  await prisma.phong.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tenPhong: "Căn hộ trung tâm",
      khach: 4,
      phongNgu: 2,
      giuong: 2,
      phongTam: 1,
      moTa: "Căn hộ mẫu để kiểm tra API.",
      giaTien: 800000,
      mayGiat: true,
      banLa: true,
      tivi: true,
      dieuHoa: true,
      wifi: true,
      bep: true,
      doXe: true,
      hoBoi: false,
      banUi: true,
      maViTri: location.id,
    },
  });
  console.log("Seed completed. Admin email:", email);
} finally {
  await prisma.$disconnect();
}
