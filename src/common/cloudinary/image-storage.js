import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../helpers/app-error.helper.js";

export async function storeCloudImage(file) {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new AppError(503, "Chưa cấu hình đầy đủ dịch vụ lưu ảnh.");
  }
  cloudinary.config(config);
  let result;
  try {
    result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "bc95-airbnb", resource_type: "image" },
          (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
        )
        .end(file.buffer);
    });
  } catch {
    throw new AppError(
      502,
      "Không thể tải ảnh lên dịch vụ lưu trữ. Vui lòng thử lại.",
    );
  }
  if (!result?.secure_url || !result.public_id)
    throw new AppError(502, "Dịch vụ lưu ảnh trả về kết quả không hợp lệ.");
  return {
    url: result.secure_url,
    remove: () => cloudinary.uploader.destroy(result.public_id),
  };
}
