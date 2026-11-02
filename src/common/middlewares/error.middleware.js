import multer from "multer";
import { ZodError } from "zod";
import { validationMessage } from "../helpers/validation-message.helper.js";
import { AppError } from "../helpers/app-error.helper.js";

export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || error.status || 500;
  let message =
    error instanceof AppError ? error.message : "Yêu cầu không hợp lệ.";
  if (error instanceof ZodError) {
    statusCode = 400;
    message = error.issues
      .map((issue) => validationMessage(issue, req))
      .join("; ");
  } else if (error instanceof multer.MulterError) {
    statusCode = 400;
    const uploadMessages = {
      LIMIT_FILE_SIZE: "Dung lượng ảnh không được vượt quá 5 MB.",
      LIMIT_FILE_COUNT: "Chỉ được tải lên một ảnh cho mỗi yêu cầu.",
      LIMIT_UNEXPECTED_FILE: "Chỉ được tải lên một ảnh trong trường formFile.",
      LIMIT_FIELD_COUNT:
        "Yêu cầu tải ảnh không được chứa trường văn bản bổ sung.",
      LIMIT_FIELD_KEY: "Tên trường tải lên quá dài.",
      LIMIT_FIELD_VALUE: "Nội dung trường tải lên quá dài.",
      LIMIT_PART_COUNT: "Yêu cầu tải lên chứa quá nhiều thành phần.",
    };
    message = uploadMessages[error.code] || "Tệp tải lên không hợp lệ.";
  } else if (error.code === "P2002") {
    statusCode = 409;
    message = /email/i.test(JSON.stringify(error.meta || {}))
      ? "Địa chỉ email đã được sử dụng. Vui lòng chọn email khác."
      : "Dữ liệu đã tồn tại.";
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
  } else if (error.type === "entity.too.large") {
    statusCode = 413;
    message = "Nội dung yêu cầu không được vượt quá 1 MB.";
  } else if (
    error.type === "encoding.unsupported" ||
    error.type === "charset.unsupported"
  ) {
    statusCode = 415;
    message =
      "Kiểu mã hóa nội dung yêu cầu không được hỗ trợ. Vui lòng sử dụng UTF-8.";
  }
  if (statusCode >= 500) {
    console.error(error);
    message = "Lỗi hệ thống.";
  }
  res.status(statusCode).json({ statusCode, message, content: null });
}
