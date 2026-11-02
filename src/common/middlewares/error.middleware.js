import multer from "multer";
import { ZodError } from "zod";

export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message;
  if (error instanceof ZodError) {
    statusCode = 400;
    message = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
  } else if (error instanceof multer.MulterError) {
    statusCode = 400;
    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Ảnh tối đa 5 MB."
        : "File upload không hợp lệ.";
  } else if (error.code === "P2002") {
    statusCode = 409;
    message = "Dữ liệu đã tồn tại.";
  } else if (error.code === "P2003") {
    statusCode = 409;
    message = "Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng.";
  } else if (error.code === "P2025") {
    statusCode = 404;
    message = "Không tìm thấy dữ liệu.";
  } else if (error.code === "P2034") {
    statusCode = 409;
    message = "Dữ liệu vừa thay đổi, vui lòng thử lại.";
  } else if (error.type === "entity.parse.failed") {
    statusCode = 400;
    message = "JSON không hợp lệ.";
  }
  if (statusCode >= 500) {
    console.error(error);
    message = "Lỗi hệ thống.";
  }
  res.status(statusCode).json({ statusCode, message, content: null });
}
