import { mkdir, copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const swaggerDist = path.dirname(
  require.resolve("swagger-ui-dist/package.json"),
);
const target = new URL("../public/swagger/", import.meta.url);
await mkdir(target, { recursive: true });
for (const name of [
  "swagger-ui.css",
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
  "favicon-16x16.png",
  "favicon-32x32.png",
]) {
  await copyFile(path.join(swaggerDist, name), new URL(name, target));
}
console.log("Đã chuẩn bị tài nguyên Swagger cho Vercel CDN.");
