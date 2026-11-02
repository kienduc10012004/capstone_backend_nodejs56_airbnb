import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
export const uploadDirectory = path.join(projectRoot, "uploads");
export const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must contain at least 32 characters. Configure .env first.",
  );
}
export const port = Number(process.env.PORT || 3001);
