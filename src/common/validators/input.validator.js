import { z } from "zod";

const text = (max = 255) => z.string().trim().min(1).max(max);
const integer = (min = 0) => z.number().int().min(min).max(2147483647);
const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "Mật khẩu tối đa 72 byte UTF-8",
  );
export const idSchema = z.coerce.number().int().min(1).max(2147483647);
const date = z.iso
  .datetime({ offset: true })
  .transform((value) => new Date(value));
const image = z.string().max(500).default("");
const profile = {
  name: text(),
  email: z
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  phone: text(30),
  birthday: z.iso.date("Ngày sinh phải có dạng YYYY-MM-DD hợp lệ"),
  gender: z.boolean(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
};
export const signupSchema = z.object({
  ...profile,
  password: passwordSchema,
});
export const userUpdateSchema = z.object(profile);
export const signinSchema = z.object({
  email: profile.email,
  password: z.string().min(1).max(72),
});
export const locationSchema = z.object({
  tenViTri: text(),
  tinhThanh: text(),
  quocGia: text(),
  hinhAnh: image,
});
export const roomSchema = z.object({
  tenPhong: text(),
  khach: integer(1),
  phongNgu: integer(),
  giuong: integer(),
  phongTam: integer(),
  moTa: text(10000),
  giaTien: integer(),
  mayGiat: z.boolean(),
  banLa: z.boolean(),
  tivi: z.boolean(),
  dieuHoa: z.boolean(),
  wifi: z.boolean(),
  bep: z.boolean(),
  doXe: z.boolean(),
  hoBoi: z.boolean(),
  banUi: z.boolean(),
  maViTri: integer(1),
  hinhAnh: image,
});
export const bookingSchema = z
  .object({
    maPhong: integer(1),
    ngayDen: date,
    ngayDi: date,
    soLuongKhach: integer(1),
    maNguoiDung: integer(1),
  })
  .refine((value) => value.ngayDi > value.ngayDen, "Ngày đi phải sau ngày đến");
export const commentSchema = z.object({
  maPhong: integer(1),
  maNguoiBinhLuan: integer(1),
  ngayBinhLuan: date,
  noiDung: text(10000),
  saoBinhLuan: integer(1).max(5),
});
export const paginationSchema = z.object({
  pageIndex: z.coerce.number().int().min(1).max(1000000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  keyword: z.string().trim().max(255).default(""),
});

export function validateBody(schema) {
  return (req, res, next) => {
    req.input = schema.parse(req.body);
    next();
  };
}
