import { writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "../common/prisma/connect.prisma.js";
import {
  uploadDirectory,
  imageStorage,
} from "../common/constants/app.constant.js";
import { storeCloudImage } from "../common/cloudinary/image-storage.js";
import { findOrFail } from "../common/helpers/app-error.helper.js";
import { imageExtension } from "../common/multer/image.multer.js";
import { publicUser } from "./auth.service.js";

export async function saveImage(kind, id, file) {
  const { model, field } = {
    avatar: { model: prisma.nguoiDung, field: "avatar" },
    room: { model: prisma.phong, field: "hinhAnh" },
    location: { model: prisma.viTri, field: "hinhAnh" },
  }[kind];
  const extension = imageExtension(file);
  await findOrFail(model, id);
  if (imageStorage === "cloudinary") {
    const image = await storeCloudImage(file);
    try {
      const result = await model.update({
        where: { id },
        data: { [field]: image.url },
      });
      return kind === "avatar" ? publicUser(result) : result;
    } catch (error) {
      await image.remove().catch(() => {});
      throw error;
    }
  }
  const filename = `${randomUUID()}${extension}`;
  const target = path.join(uploadDirectory, filename);
  await writeFile(target, file.buffer, { flag: "wx" });
  try {
    const result = await model.update({
      where: { id },
      data: { [field]: `/uploads/${filename}` },
    });
    return kind === "avatar" ? publicUser(result) : result;
  } catch (error) {
    await unlink(target).catch(() => {});
    throw error;
  }
}
