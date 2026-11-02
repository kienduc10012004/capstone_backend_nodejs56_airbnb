import "dotenv/config";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/common/prisma/connect.prisma.js";
import { swaggerDocument } from "../src/common/swagger/init.swagger.js";
import { uploadDirectory } from "../src/common/constants/app.constant.js";

const api = request(app);
const marker = randomUUID().slice(0, 8);
const userIds = [];
const roomIds = [];
const locationIds = [];
const files = [];
const covered = new Set();
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);

function profile(suffix) {
  return {
    name: `Test ${marker} ${suffix}`,
    email: `test-${marker}-${suffix}@example.com`,
    password: "TestPassword123!",
    phone: "0901234567",
    birthday: "2000-01-01",
    gender: true,
    role: "USER",
  };
}
function room(maViTri) {
  return {
    tenPhong: `Test room ${marker}`,
    khach: 4,
    phongNgu: 2,
    giuong: 2,
    phongTam: 1,
    moTa: "Phòng kiểm thử",
    giaTien: 500000,
    mayGiat: true,
    banLa: false,
    tivi: true,
    dieuHoa: true,
    wifi: true,
    bep: true,
    doXe: false,
    hoBoi: false,
    banUi: false,
    maViTri,
    hinhAnh: "",
  };
}
async function ok(method, url, token, body, template = url) {
  let call = api[method](url);
  if (token) call = call.set("token", token);
  if (body) call = call.send(body);
  const response = await call;
  assert.equal(response.status, 200, JSON.stringify(response.body));
  covered.add(`${method.toUpperCase()} ${template}`);
  return response.body.content;
}

after(async () => {
  try {
    await prisma.binhLuan.deleteMany({
      where: { maNguoiBinhLuan: { in: userIds } },
    });
    await prisma.datPhong.deleteMany({
      where: { maNguoiDung: { in: userIds } },
    });
    await prisma.phong.deleteMany({ where: { id: { in: roomIds } } });
    await prisma.viTri.deleteMany({ where: { id: { in: locationIds } } });
    await prisma.nguoiDung.deleteMany({ where: { id: { in: userIds } } });
    await Promise.all(
      files.map((filename) =>
        unlink(path.join(uploadDirectory, path.basename(filename))).catch(
          () => {},
        ),
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
});

test("36 API: complete workflow, authorization, validation and concurrent bookings against MySQL", async (t) => {
  let adminToken,
    userToken,
    otherToken,
    user,
    other,
    location,
    targetRoom,
    booking,
    comment;
  const bookingInput = () => ({
    maPhong: targetRoom.id,
    ngayDen: "2035-01-01T14:00:00Z",
    ngayDi: "2035-01-03T10:00:00Z",
    soLuongKhach: 2,
    maNguoiDung: user.id,
  });
  const commentInput = () => ({
    maPhong: targetRoom.id,
    maNguoiBinhLuan: user.id,
    ngayBinhLuan: "2035-01-03T12:00:00Z",
    noiDung: "Rất tốt",
    saoBinhLuan: 5,
  });

  await t.test(
    "auth: signup cannot grant ADMIN, duplicate and wrong-password checks",
    async () => {
      const admin = await ok("post", "/api/auth/signin", null, {
        email: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
      });
      adminToken = admin.token;
      user = await ok("post", "/api/auth/signup", null, {
        ...profile("user"),
        role: "ADMIN",
      });
      userIds.push(user.id);
      assert.equal(user.role, "USER");
      assert.equal(user.password, undefined);
      assert.equal(user.pass_word, undefined);
      assert.equal(
        (await api.post("/api/auth/signup").send(profile("user"))).status,
        409,
      );
      assert.equal(
        (
          await api
            .post("/api/auth/signin")
            .send({ email: user.email, password: "wrong" })
        ).status,
        401,
      );
      userToken = (
        await ok("post", "/api/auth/signin", null, {
          email: user.email,
          password: profile("user").password,
        })
      ).token;
      other = await ok("post", "/api/users", adminToken, profile("other"));
      userIds.push(other.id);
      otherToken = (
        await ok("post", "/api/auth/signin", null, {
          email: other.email,
          password: profile("other").password,
        })
      ).token;
      assert.equal(
        (
          await api
            .post("/api/auth/signup")
            .send({ ...profile("invalid"), birthday: "2000-99-99" })
        ).status,
        400,
      );
      assert.equal(
        (
          await api
            .post("/api/auth/signin")
            .set("Content-Type", "application/json")
            .send("{bad")
        ).status,
        400,
      );
    },
  );

  await t.test(
    "users: all 8 operations, pagination and access control",
    async () => {
      assert.equal((await api.get("/api/users")).status, 401);
      assert.equal(
        (await api.get("/api/users").set("token", "invalid")).status,
        401,
      );
      assert.equal(
        (await api.get("/api/users").set("token", userToken)).status,
        403,
      );
      const list = await ok("get", "/api/users", adminToken);
      assert.ok(list.every((item) => item.password === undefined));
      await ok(
        "get",
        `/api/users/${user.id}`,
        adminToken,
        null,
        "/api/users/{id}",
      );
      const page = await ok(
        "get",
        `/api/users/phan-trang-tim-kiem?pageIndex=1&pageSize=1&keyword=${marker}`,
        adminToken,
        null,
        "/api/users/phan-trang-tim-kiem",
      );
      assert.equal(page.data.length, 1);
      assert.ok(page.totalRow >= 2);
      assert.equal(page.data[0].password, undefined);
      await ok(
        "get",
        `/api/users/search/${marker}`,
        adminToken,
        null,
        "/api/users/search/{TenNguoiDung}",
      );
      const { password, ...updated } = profile("other");
      await ok(
        "put",
        `/api/users/${other.id}`,
        adminToken,
        { ...updated, name: `Updated ${marker}` },
        "/api/users/{id}",
      );
      assert.equal(
        (
          await api
            .get("/api/users/phan-trang-tim-kiem?pageSize=0")
            .set("token", adminToken)
        ).status,
        400,
      );
      const response = await api
        .post("/api/users/upload-avatar")
        .set("token", userToken)
        .attach("formFile", png, {
          filename: "test.png",
          contentType: "image/png",
        });
      assert.equal(response.status, 200, JSON.stringify(response.body));
      files.push(response.body.content.avatar);
      covered.add("POST /api/users/upload-avatar");
      assert.equal(response.body.content.password, undefined);
      assert.equal((await api.get(response.body.content.avatar)).status, 200);
      const invalid = await api
        .post("/api/users/upload-avatar")
        .set("token", userToken)
        .attach("formFile", Buffer.from("<script>bad</script>"), {
          filename: "fake.png",
          contentType: "image/png",
        });
      assert.equal(invalid.status, 400);
      assert.equal(
        (await api.post("/api/users/upload-avatar").set("token", userToken))
          .status,
        400,
      );
      const oversized = await api
        .post("/api/users/upload-avatar")
        .set("token", userToken)
        .attach("formFile", Buffer.alloc(5 * 1024 * 1024 + 1), {
          filename: "big.png",
          contentType: "image/png",
        });
      assert.equal(oversized.status, 400);
    },
  );

  await t.test(
    "locations: all 7 operations and ADMIN write access",
    async () => {
      const input = {
        tenViTri: `Test ${marker}`,
        tinhThanh: "Hồ Chí Minh",
        quocGia: "Việt Nam",
        hinhAnh: "",
      };
      assert.equal(
        (await api.post("/api/vi-tri").set("token", userToken).send(input))
          .status,
        403,
      );
      location = await ok("post", "/api/vi-tri", adminToken, input);
      locationIds.push(location.id);
      await ok("get", "/api/vi-tri");
      const detail = await ok(
        "get",
        `/api/vi-tri/${location.id}`,
        null,
        null,
        "/api/vi-tri/{id}",
      );
      assert.equal(detail.quocGia, "Việt Nam");
      const page = await ok(
        "get",
        `/api/vi-tri/phan-trang-tim-kiem?keyword=${marker}`,
        null,
        null,
        "/api/vi-tri/phan-trang-tim-kiem",
      );
      assert.equal(page.totalRow, 1);
      await ok(
        "put",
        `/api/vi-tri/${location.id}`,
        adminToken,
        { ...input, tinhThanh: "Hà Nội" },
        "/api/vi-tri/{id}",
      );
      const upload = await api
        .post(`/api/vi-tri/upload-hinh-vitri?maViTri=${location.id}`)
        .set("token", adminToken)
        .attach("formFile", png, "image.png");
      assert.equal(upload.status, 200, JSON.stringify(upload.body));
      files.push(upload.body.content.hinhAnh);
      covered.add("POST /api/vi-tri/upload-hinh-vitri");
      assert.equal((await api.get("/api/vi-tri/nope")).status, 400);
      assert.equal((await api.get("/api/vi-tri/2147483647")).status, 404);
    },
  );

  await t.test(
    "rooms: all 8 operations, filters, image and foreign-key protection",
    async () => {
      targetRoom = await ok(
        "post",
        "/api/phong-thue",
        adminToken,
        room(location.id),
      );
      roomIds.push(targetRoom.id);
      await ok("get", "/api/phong-thue");
      await ok(
        "get",
        `/api/phong-thue/${targetRoom.id}`,
        null,
        null,
        "/api/phong-thue/{id}",
      );
      const matches = await ok(
        "get",
        `/api/phong-thue/lay-phong-theo-vi-tri?maViTri=${location.id}`,
        null,
        null,
        "/api/phong-thue/lay-phong-theo-vi-tri",
      );
      assert.equal(matches.length, 1);
      const page = await ok(
        "get",
        `/api/phong-thue/phan-trang-tim-kiem?keyword=${marker}`,
        null,
        null,
        "/api/phong-thue/phan-trang-tim-kiem",
      );
      assert.equal(page.totalRow, 1);
      await ok(
        "put",
        `/api/phong-thue/${targetRoom.id}`,
        adminToken,
        { ...room(location.id), giaTien: 600000 },
        "/api/phong-thue/{id}",
      );
      const upload = await api
        .post(`/api/phong-thue/upload-hinh-phong?maPhong=${targetRoom.id}`)
        .set("token", adminToken)
        .attach("formFile", png, "image.png");
      assert.equal(upload.status, 200, JSON.stringify(upload.body));
      files.push(upload.body.content.hinhAnh);
      covered.add("POST /api/phong-thue/upload-hinh-phong");
      assert.equal(
        (
          await api
            .delete(`/api/vi-tri/${location.id}`)
            .set("token", adminToken)
        ).status,
        409,
      );
      assert.equal(
        (
          await api
            .post("/api/phong-thue")
            .set("token", adminToken)
            .send(room(2147483647))
        ).status,
        404,
      );
    },
  );

  await t.test(
    "bookings: 6 operations, ownership, dates, capacity and concurrent collision",
    async () => {
      assert.equal(
        (
          await api
            .post("/api/dat-phong")
            .set("token", otherToken)
            .send(bookingInput())
        ).status,
        403,
      );
      assert.equal(
        (
          await api
            .post("/api/dat-phong")
            .set("token", userToken)
            .send({ ...bookingInput(), soLuongKhach: 5 })
        ).status,
        400,
      );
      assert.equal(
        (
          await api
            .post("/api/dat-phong")
            .set("token", userToken)
            .send({ ...bookingInput(), ngayDi: "2034-01-01T00:00:00Z" })
        ).status,
        400,
      );
      const results = await Promise.all(
        [1, 2].map(() =>
          api
            .post("/api/dat-phong")
            .set("token", userToken)
            .send(bookingInput()),
        ),
      );
      assert.deepEqual(
        results.map((response) => response.status).sort(),
        [200, 409],
        JSON.stringify(results.map((r) => r.body)),
      );
      booking = results.find((response) => response.status === 200).body
        .content;
      covered.add("POST /api/dat-phong");
      await ok("get", "/api/dat-phong", userToken);
      await ok(
        "get",
        `/api/dat-phong/${booking.id}`,
        userToken,
        null,
        "/api/dat-phong/{id}",
      );
      assert.equal(
        (await api.get(`/api/dat-phong/${booking.id}`).set("token", otherToken))
          .status,
        403,
      );
      assert.equal(
        (
          await api
            .put(`/api/dat-phong/${booking.id}`)
            .set("token", otherToken)
            .send({ ...bookingInput(), maNguoiDung: other.id })
        ).status,
        403,
      );
      assert.equal(
        (
          await api
            .delete(`/api/dat-phong/${booking.id}`)
            .set("token", otherToken)
        ).status,
        403,
      );
      assert.equal(
        (
          await api
            .get(`/api/dat-phong/lay-theo-nguoi-dung/${user.id}`)
            .set("token", otherToken)
        ).status,
        403,
      );
      const invisible = await ok("get", "/api/dat-phong", otherToken);
      assert.ok(invisible.every((record) => record.maNguoiDung === other.id));
      await ok(
        "get",
        `/api/dat-phong/lay-theo-nguoi-dung/${user.id}`,
        userToken,
        null,
        "/api/dat-phong/lay-theo-nguoi-dung/{MaNguoiDung}",
      );
      await ok(
        "put",
        `/api/dat-phong/${booking.id}`,
        userToken,
        { ...bookingInput(), soLuongKhach: 3 },
        "/api/dat-phong/{id}",
      );
      assert.equal(
        (
          await api
            .put(`/api/phong-thue/${targetRoom.id}`)
            .set("token", adminToken)
            .send({ ...room(location.id), khach: 2 })
        ).status,
        409,
      );
      assert.equal(
        (
          await api
            .delete(`/api/phong-thue/${targetRoom.id}`)
            .set("token", adminToken)
        ).status,
        409,
      );
      assert.equal(
        (await api.delete(`/api/users?id=${user.id}`).set("token", adminToken))
          .status,
        409,
      );
      const adjacent = await ok("post", "/api/dat-phong", userToken, {
        ...bookingInput(),
        ngayDen: "2035-01-03T10:00:00Z",
        ngayDi: "2035-01-04T10:00:00Z",
      });
      await ok(
        "delete",
        `/api/dat-phong/${adjacent.id}`,
        userToken,
        null,
        "/api/dat-phong/{id}",
      );
    },
  );

  await t.test("comments: 5 operations and ownership protection", async () => {
    assert.equal(
      (
        await api
          .post("/api/binh-luan")
          .set("token", otherToken)
          .send(commentInput())
      ).status,
      403,
    );
    assert.equal(
      (
        await api
          .post("/api/binh-luan")
          .set("token", userToken)
          .send({ ...commentInput(), saoBinhLuan: 6 })
      ).status,
      400,
    );
    comment = await ok("post", "/api/binh-luan", userToken, commentInput());
    await ok("get", "/api/binh-luan");
    const comments = await ok(
      "get",
      `/api/binh-luan/lay-binh-luan-theo-phong/${targetRoom.id}`,
      null,
      null,
      "/api/binh-luan/lay-binh-luan-theo-phong/{MaPhong}",
    );
    assert.equal(comments.length, 1);
    assert.equal(comments[0].tenNguoiBinhLuan, user.name);
    assert.equal(
      (
        await api
          .put(`/api/binh-luan/${comment.id}`)
          .set("token", otherToken)
          .send({ ...commentInput(), maNguoiBinhLuan: other.id })
      ).status,
      403,
    );
    assert.equal(
      (
        await api
          .delete(`/api/binh-luan/${comment.id}`)
          .set("token", otherToken)
      ).status,
      403,
    );
    await ok(
      "put",
      `/api/binh-luan/${comment.id}`,
      userToken,
      { ...commentInput(), noiDung: "Đã cập nhật" },
      "/api/binh-luan/{id}",
    );
    await ok(
      "delete",
      `/api/binh-luan/${comment.id}`,
      userToken,
      null,
      "/api/binh-luan/{id}",
    );
    assert.equal(
      (await api.delete(`/api/binh-luan/${comment.id}`).set("token", userToken))
        .status,
      404,
    );
  });

  await t.test(
    "cleanup through API, documentation and complete contract coverage",
    async () => {
      await ok(
        "delete",
        `/api/dat-phong/${booking.id}`,
        userToken,
        null,
        "/api/dat-phong/{id}",
      );
      await ok(
        "delete",
        `/api/phong-thue/${targetRoom.id}`,
        adminToken,
        null,
        "/api/phong-thue/{id}",
      );
      await ok(
        "delete",
        `/api/vi-tri/${location.id}`,
        adminToken,
        null,
        "/api/vi-tri/{id}",
      );
      await ok(
        "delete",
        `/api/users?id=${other.id}`,
        adminToken,
        null,
        "/api/users",
      );
      assert.equal(
        (
          await api
            .post("/api/users/upload-avatar")
            .set("token", otherToken)
            .attach("formFile", png, "image.png")
        ).status,
        401,
      );
      assert.equal((await api.get("/swagger/")).status, 200);
      assert.equal((await api.get("/swagger.json")).status, 200);
      assert.equal((await api.get("/api/nonexistent")).status, 404);
      const expected = Object.entries(swaggerDocument.paths).flatMap(
        ([url, methods]) =>
          Object.keys(methods).map(
            (method) => `${method.toUpperCase()} ${url}`,
          ),
      );
      assert.equal(expected.length, 36);
      assert.deepEqual(
        expected.filter((entry) => !covered.has(entry)),
        [],
      );
      for (const methods of Object.values(swaggerDocument.paths)) {
        for (const operation of Object.values(methods))
          assert.ok(
            operation.parameters.every(
              (parameter) => parameter.name !== "tokenCybersoft",
            ),
          );
      }
    },
  );
});
