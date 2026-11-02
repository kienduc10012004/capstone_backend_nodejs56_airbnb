import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";
import { swaggerDocument } from "../src/common/swagger/init.swagger.js";

test("Swagger JSON operations advertise application/json; file uploads stay multipart", () => {
  for (const methods of Object.values(swaggerDocument.paths)) {
    for (const operation of Object.values(methods)) {
      if (operation.parameters.some((parameter) => parameter.in === "body")) {
        assert.deepEqual(operation.consumes, ["application/json"]);
      }
      if (operation.parameters.some((parameter) => parameter.type === "file")) {
        assert.ok(operation.consumes.includes("multipart/form-data"));
      }
    }
  }
});

test("JSON variants from reference Swagger are parsed before signup validation", async () => {
  for (const contentType of [
    "application/json",
    "application/json-patch+json",
    "text/json",
  ]) {
    const response = await request(app)
      .post("/api/auth/signup")
      .set("Content-Type", contentType)
      .send(JSON.stringify({ name: "Content type regression" }));
    assert.equal(response.status, 400);
    assert.ok(response.body.message.includes("email:"), response.body.message);
    assert.ok(
      !response.body.message.includes("expected object"),
      response.body.message,
    );
  }
});
