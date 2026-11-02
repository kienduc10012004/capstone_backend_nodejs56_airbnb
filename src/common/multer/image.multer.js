import multer from "multer";
import { AppError } from "../helpers/app-error.helper.js";
import { maxImageSizeMb } from "../constants/app.constant.js";

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxImageSizeMb * 1024 * 1024, files: 1, fields: 0 },
}).single("formFile");

export function imageExtension(file) {
  if (!file)
    throw new AppError(400, "Vui lòng chọn ảnh trong trường formFile.");
  const bytes = file.buffer;
  if (
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    file.mimetype === "image/png"
  )
    return ".png";
  if (
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255 &&
    file.mimetype === "image/jpeg"
  )
    return ".jpg";
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP" &&
    file.mimetype === "image/webp"
  )
    return ".webp";
  throw new AppError(
    400,
    "Chỉ chấp nhận file PNG, JPEG hoặc WebP có nội dung phù hợp.",
  );
}
