import "dotenv/config";
import { readFile, unlink } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import path from "node:path";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/common/prisma/connect.prisma.js";
import { uploadDirectory } from "../src/common/constants/app.constant.js";

const root = new URL("../", import.meta.url);
const collection = JSON.parse(
  await readFile(
    new URL("docs/postman/Airbnb.postman_collection.json", root),
    "utf8",
  ),
);
const template = JSON.parse(
  await readFile(
    new URL("docs/postman/Airbnb.postman_environment.json", root),
    "utf8",
  ),
);
const reference = JSON.parse(
  await readFile(new URL("swagger-reference.json", root), "utf8"),
);
const items = collection.item.flatMap((folder) => folder.item);

test("Postman delivery covers exactly 36 methods/paths and contains no populated private credentials", () => {
  assert.equal(items.length, 36);
  assert.equal(collection.item.length, 6);
  const actual = items.map(
    (item) =>
      `${item.request.method} /${item.request.url.path.join("/").replace(/\{\{\w+\}\}/g, "{}")}`,
  );
  const expected = Object.entries(reference.paths).flatMap(([url, methods]) =>
    Object.keys(methods).map(
      (method) => `${method.toUpperCase()} ${url.replace(/\{\w+\}/g, "{}")}`,
    ),
  );
  assert.deepEqual(actual.sort(), expected.sort());
  for (const item of items) {
    assert.ok(item.request.description.includes("Điều kiện"));
    assert.ok(item.response.some((r) => r.code === 200));
    assert.ok(item.response.some((r) => r.code >= 400));
    for (const response of item.response)
      assert.equal(JSON.parse(response.body).statusCode, response.code);
  }
  for (const key of ["adminEmail", "adminPassword", "adminToken", "userToken"])
    assert.equal(template.values.find((v) => v.key === key).value, "");
});

test("Postman requests and scripts execute all 36 APIs against MySQL in documented workflow", async () => {
  const values = new Map(template.values.map(({ key, value }) => [key, value]));
  values.set("adminEmail", process.env.SEED_ADMIN_EMAIL);
  values.set("adminPassword", process.env.SEED_ADMIN_PASSWORD);
  values.set("runId", `verify-${Date.now()}`);
  const files = [];
  const seen = new Set();
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  );
  const environment = {
    get: (key) => values.get(key),
    set: (key, value) => values.set(key, String(value)),
  };
  async function send(number) {
    const item = items.find(
      (entry) => Number(entry.name.slice(0, 2)) === number,
    );
    const local = new Map();
    const pm = {
      environment,
      variables: {
        get: (key) => local.get(key) ?? values.get(key),
        set: (key, value) => local.set(key, String(value)),
      },
    };
    const context = vm.createContext({ pm });
    for (const event of [...collection.event, ...item.event].filter(
      (event) => event.listen === "prerequest",
    ))
      new vm.Script(event.script.exec.join("\n")).runInContext(context);
    const expand = (text) =>
      text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const value = local.get(key) ?? values.get(key);
        assert.notEqual(
          value,
          undefined,
          `Missing variable ${key} in ${item.name}`,
        );
        return value;
      });
    const url = expand(item.request.url.raw).replace(values.get("baseUrl"), "");
    let call = request(app)[item.request.method.toLowerCase()](url);
    for (const header of item.request.header)
      call = call.set(header.key, expand(header.value));
    if (item.request.body?.mode === "raw")
      call = call.send(JSON.parse(expand(item.request.body.raw)));
    if (item.request.body?.mode === "formdata")
      call = call.attach("formFile", png, {
        filename: "postman-test.png",
        contentType: "image/png",
      });
    const response = await call;
    assert.equal(
      response.status,
      200,
      `${item.name}: ${JSON.stringify(response.body)}`,
    );
    seen.add(number);
    if (item.request.body?.mode === "formdata")
      files.push(response.body.content.avatar || response.body.content.hinhAnh);
    pm.response = {
      code: response.status,
      json: () => response.body,
      to: { have: { status: (code) => assert.equal(response.status, code) } },
    };
    pm.test = (name, fn) => fn();
    pm.expect = (value) => ({
      to: {
        eql: (expected) => assert.deepEqual(value, expected),
        be: { a: (type) => assert.equal(typeof value, type) },
        have: { property: (key) => assert.ok(Object.hasOwn(value, key)) },
      },
    });
    for (const event of item.event.filter((event) => event.listen === "test"))
      new vm.Script(event.script.exec.join("\n")).runInContext(context);
  }
  try {
    await send(2);
    await send(1);
    values.set("loginAs", "USER");
    await send(2);
    for (const number of [
      4, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24,
      26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 31, 25, 17, 10,
    ])
      await send(number);
    assert.equal(seen.size, 36);
  } finally {
    const userIds = ["userId", "managedUserId"]
      .map((key) => Number(values.get(key)))
      .filter((id) => id > 0);
    await prisma.binhLuan.deleteMany({
      where: { maNguoiBinhLuan: { in: userIds } },
    });
    await prisma.datPhong.deleteMany({
      where: { maNguoiDung: { in: userIds } },
    });
    const roomId = Number(values.get("roomId"));
    if (roomId) await prisma.phong.deleteMany({ where: { id: roomId } });
    const locationId = Number(values.get("locationId"));
    if (locationId)
      await prisma.viTri.deleteMany({ where: { id: locationId } });
    await prisma.nguoiDung.deleteMany({ where: { id: { in: userIds } } });
    await Promise.all(
      files.map((file) =>
        unlink(path.join(uploadDirectory, path.basename(file))).catch(() => {}),
      ),
    );
    await prisma.$disconnect();
  }
});
