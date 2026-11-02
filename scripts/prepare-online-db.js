import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = fileURLToPath(new URL("../", import.meta.url));
const settings = dotenv.parse(
  readFileSync(new URL("../.env.deploy.local", import.meta.url)),
);
const url = new URL(settings.DATABASE_URL);
if (
  ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
  url.hostname.endsWith(".internal")
) {
  throw new Error("Cần URL MySQL public online trong .env.deploy.local.");
}
if (!settings.SEED_ADMIN_EMAIL || !settings.SEED_ADMIN_PASSWORD)
  throw new Error("Cần cấu hình tài khoản ADMIN demo.");
const env = { ...process.env, ...settings };
console.log(
  `Chuẩn bị database online tại ${url.hostname}:${url.port || 3306}. Không thay đổi .env local.`,
);
for (const args of [
  [
    fileURLToPath(
      new URL("../node_modules/prisma/build/index.js", import.meta.url),
    ),
    "migrate",
    "deploy",
  ],
  [fileURLToPath(new URL("../prisma/seed.js", import.meta.url))],
]) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
