import reference from "../../../swagger-reference.json" with { type: "json" };
import { maxImageSizeMb } from "../constants/app.constant.js";

export const swaggerDocument = structuredClone(reference);
swaggerDocument.info = {
  title: "BC95 Airbnb API",
  version: "1.0.0",
  description:
    "36 API theo Swagger chính thức. Không yêu cầu tokenCybersoft. Đăng nhập và nhập JWT vào Authorize. Ngày sinh: YYYY-MM-DD; ngày đặt/bình luận: ISO 8601 có múi giờ. Response: { statusCode, message, content }. Xem README để biết quyền truy cập và quy tắc nghiệp vụ.",
};
swaggerDocument.securityDefinitions = {
  token: {
    type: "apiKey",
    name: "token",
    in: "header",
    description: "JWT trả về từ signin",
  },
};
for (const [route, methods] of Object.entries(swaggerDocument.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    if (operation.parameters.some((parameter) => parameter.in === "body")) {
      operation.consumes = ["application/json"];
    }
    for (const parameter of operation.parameters) {
      if (parameter.type === "file")
        parameter.description = `Ảnh PNG, JPEG hoặc WebP, tối đa ${maxImageSizeMb} MB.`;
    }
    operation.parameters = operation.parameters.filter(
      (parameter) => !["tokenCybersoft", "token"].includes(parameter.name),
    );
    const protectedRoute =
      route.startsWith("/api/users") ||
      route.startsWith("/api/dat-phong") ||
      (method !== "get" && !route.startsWith("/api/auth"));
    if (protectedRoute) operation.security = [{ token: [] }];
    operation.responses = {
      200: { description: "Thành công: { statusCode: 200, message, content }" },
      400: { description: "Dữ liệu không hợp lệ" },
      401: { description: "Chưa đăng nhập hoặc token hết hạn" },
      403: { description: "Không có quyền" },
      404: { description: "Không tìm thấy" },
      409: {
        description: "Trùng dữ liệu, trùng lịch hoặc dữ liệu đang được sử dụng",
      },
    };
  }
}
