import "dotenv/config";
import { test, after, mock } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import express from "express";
import { v2 as cloudinary } from "cloudinary";

process.env.VERCEL = "1";
process.env.IMAGE_STORAGE = "cloudinary";
const { default: app } = await import("../server.js");
const { default: detectedEntry, app: namedApp } = await import("../src/app.js");
const { prisma } = await import("../src/common/prisma/connect.prisma.js");
const { saveImage } = await import("../src/services/upload.service.js");
const { uploadImage } = await import("../src/common/multer/image.multer.js");
const { errorHandler } =
  await import("../src/common/middlewares/error.middleware.js");
after(async () => {
  await prisma.$disconnect();
});
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);

test("Vercel entry exports Express without starting a listener; Swagger redirects and init work", async () => {
  assert.equal(typeof app, "function");
  assert.equal(typeof detectedEntry, "function");
  assert.equal(detectedEntry, namedApp);
  assert.equal(detectedEntry, app);
  const root = await request(app).get("/");
  assert.equal(root.headers.location, "/swagger/");
  const redirect = await request(app).get("/swagger");
  assert.equal(redirect.headers.location, "/swagger/");
  assert.equal((await request(app).get("/swagger/")).status, 200);
  assert.equal(
    (await request(app).get("/swagger/swagger-ui-init.js")).status,
    200,
  );
  const spec = await request(app).get("/swagger.json");
  assert.ok(
    spec.body.paths["/api/users/upload-avatar"].post.parameters
      .find((p) => p.type === "file")
      .description.includes("3 MB"),
  );
});

test("Cloudinary upload persists HTTPS URL and removes only newly uploaded image if DB update fails", async () => {
  const previous = Object.fromEntries(
    [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ].map((key) => [key, process.env[key]]),
  );
  process.env.CLOUDINARY_CLOUD_NAME = "test";
  process.env.CLOUDINARY_API_KEY = "test";
  process.env.CLOUDINARY_API_SECRET = "test";
  const stored = "https://res.cloudinary.com/test/image/upload/test.png";
  const upload = mock.method(
    cloudinary.uploader,
    "upload_stream",
    (options, cb) => ({
      end(buffer) {
        assert.deepEqual(buffer, png);
        cb(null, { secure_url: stored, public_id: "bc95-airbnb/test" });
      },
    }),
  );
  const originalFind = prisma.viTri.findUnique;
  const originalUpdate = prisma.viTri.update;
  const find = mock.fn(async () => ({
    id: 123,
  }));
  const update = mock.fn(async ({ data }) => {
    assert.equal(data.hinhAnh, stored);
    return { id: 123, ...data };
  });
  prisma.viTri.findUnique = find;
  prisma.viTri.update = update;
  const remove = mock.method(cloudinary.uploader, "destroy", async () => ({}));
  try {
    assert.equal(
      (await saveImage("location", 123, { buffer: png, mimetype: "image/png" }))
        .hinhAnh,
      stored,
    );
    assert.equal(remove.mock.callCount(), 0);
    update.mock.mockImplementation(async () => {
      throw new Error("Database failed");
    });
    await assert.rejects(
      saveImage("location", 123, { buffer: png, mimetype: "image/png" }),
      /Database failed/,
    );
    assert.equal(remove.mock.callCount(), 1);
    assert.equal(remove.mock.calls[0].arguments[0], "bc95-airbnb/test");
    delete process.env.CLOUDINARY_API_KEY;
    await assert.rejects(
      saveImage("location", 123, { buffer: png, mimetype: "image/png" }),
      /Chưa cấu hình/,
    );
  } finally {
    for (const m of [upload, remove]) m.mock.restore();
    prisma.viTri.findUnique = originalFind;
    prisma.viTri.update = originalUpdate;
    for (const [key, value] of Object.entries(previous))
      value === undefined
        ? delete process.env[key]
        : (process.env[key] = value);
  }
});

test("Cloud uploads reject files above 3 MB before platform body limit", async () => {
  const testApp = express();
  testApp.post("/upload", uploadImage, (req, res) => res.sendStatus(200));
  testApp.use(errorHandler);
  const result = await request(testApp)
    .post("/upload")
    .attach("formFile", Buffer.alloc(3 * 1024 * 1024 + 1), {
      filename: "large.png",
      contentType: "image/png",
    });
  assert.equal(result.status, 400);
  assert.equal(result.body.message, "Dung lượng ảnh không được vượt quá 3 MB.");
});
