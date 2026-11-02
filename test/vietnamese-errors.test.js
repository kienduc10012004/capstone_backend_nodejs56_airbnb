import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { z } from "zod";
import { app } from "../src/app.js";
import { validationMessage } from "../src/common/helpers/validation-message.helper.js";
import { errorHandler } from "../src/common/middlewares/error.middleware.js";
import {
  commentSchema,
  signupSchema,
  roomSchema,
  bookingSchema,
  paginationSchema,
  idSchema,
} from "../src/common/validators/input.validator.js";

function messages(schema, body) {
  const result = schema.safeParse(body);
  assert.equal(result.success, false);
  return result.error.issues
    .map((issue) => validationMessage(issue, { body }))
    .join("; ");
}

test("Vietnamese messages explain comment bounds, empty content and wrong data types", () => {
  const comment = {
    maPhong: 1,
    maNguoiBinhLuan: 1,
    ngayBinhLuan: "2030-12-01T00:00:00Z",
    noiDung: "",
    saoBinhLuan: 6,
  };
  const message = messages(commentSchema, comment);
  assert.ok(message.includes("Nội dung bình luận không được để trống."));
  assert.ok(message.includes("Số sao bình luận phải nhỏ hơn hoặc bằng 5."));
  assert.ok(
    messages(commentSchema, { ...comment, saoBinhLuan: 0 }).includes(
      "Số sao bình luận phải lớn hơn hoặc bằng 1.",
    ),
  );
  assert.ok(
    messages(commentSchema, { ...comment, saoBinhLuan: 1.5 }).includes(
      "Số sao bình luận phải là số nguyên.",
    ),
  );
  assert.ok(
    messages(commentSchema, { ...comment, maPhong: "1" }).includes(
      "Mã phòng phải là số.",
    ),
  );
  assert.ok(
    messages(commentSchema, { ...comment, ngayBinhLuan: "bad" }).includes(
      "Ngày bình luận phải là ngày giờ hợp lệ có múi giờ",
    ),
  );
});

test("All schema fields use Vietnamese errors for missing values and limits", () => {
  for (const schema of [
    commentSchema,
    signupSchema,
    roomSchema,
    bookingSchema,
  ]) {
    const message = messages(schema, {});
    assert.ok(message.includes("là thông tin bắt buộc."));
    assert.doesNotMatch(message, /expected|received|Invalid|Too small|Too big/);
  }
  const profile = {
    name: "Test",
    email: "bad",
    password: "short",
    phone: "123",
    birthday: "invalid",
    gender: "true",
    role: "OWNER",
  };
  const message = messages(signupSchema, profile);
  for (const expected of [
    "Địa chỉ email không đúng định dạng.",
    "Mật khẩu phải có ít nhất 8 ký tự.",
    "Ngày sinh phải là ngày hợp lệ",
    "Giới tính phải là giá trị true hoặc false.",
    "Vai trò chỉ được nhận giá trị USER hoặc ADMIN.",
  ])
    assert.ok(message.includes(expected), message);
  assert.ok(
    messages(paginationSchema, { pageSize: 101 }).includes(
      "Số bản ghi mỗi trang phải nhỏ hơn hoặc bằng 100.",
    ),
  );
  assert.ok(messages(idSchema, "invalid").includes("Mã định danh phải là số."));
  assert.ok(
    messages(z.object({ noiDung: z.string().max(2) }), {
      noiDung: "abc",
    }).includes("Nội dung bình luận không được vượt quá 2 ký tự."),
  );
});

test("HTTP responses for absent body, malformed JSON and oversized body are in Vietnamese", async () => {
  const missing = await request(app).post("/api/auth/signup");
  assert.equal(missing.status, 400);
  assert.equal(
    missing.body.message,
    "Nội dung yêu cầu phải là một đối tượng JSON hợp lệ.",
  );
  const malformed = await request(app)
    .post("/api/auth/signup")
    .set("Content-Type", "application/json")
    .send("{bad");
  assert.equal(malformed.body.message, "JSON không hợp lệ.");
  const oversized = await request(app)
    .post("/api/auth/signup")
    .send({ name: "x".repeat(1024 * 1024) });
  assert.equal(oversized.status, 413);
  assert.equal(
    oversized.body.message,
    "Nội dung yêu cầu không được vượt quá 1 MB.",
  );
});

test("Framework client errors do not expose English messages", () => {
  let response;
  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      response = body;
    },
  };
  errorHandler(
    Object.assign(new Error("Unsupported request"), { status: 400 }),
    {},
    res,
    () => {},
  );
  assert.equal(response.message, "Yêu cầu không hợp lệ.");
});
