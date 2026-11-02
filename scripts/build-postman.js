import { readFile, writeFile, mkdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const source = JSON.parse(
  await readFile(new URL("swagger-reference.json", root), "utf8"),
);
const out = new URL("docs/postman/", root);
await mkdir(out, { recursive: true });
const profile = {
  name: "Người dùng Postman",
  email: "{{userEmail}}",
  password: "{{userPassword}}",
  phone: "0901234567",
  birthday: "2000-01-15",
  gender: true,
  role: "USER",
};
const managed = {
  ...profile,
  name: "Tài khoản quản lý Postman",
  email: "managed-{{runId}}@example.com",
};
const location = {
  tenViTri: "Vị trí Postman",
  tinhThanh: "Hồ Chí Minh",
  quocGia: "Việt Nam",
  hinhAnh: "",
};
const room = {
  tenPhong: "Phòng Postman",
  khach: 4,
  phongNgu: 2,
  giuong: 2,
  phongTam: 1,
  moTa: "Phòng kiểm thử Postman",
  giaTien: 800000,
  mayGiat: true,
  banLa: false,
  tivi: true,
  dieuHoa: true,
  wifi: true,
  bep: true,
  doXe: true,
  hoBoi: false,
  banUi: false,
  maViTri: "{{locationId}}",
  hinhAnh: "",
};
const booking = {
  maPhong: "{{roomId}}",
  ngayDen: "2030-12-01T14:00:00+07:00",
  ngayDi: "2030-12-03T12:00:00+07:00",
  soLuongKhach: 2,
  maNguoiDung: "{{userId}}",
};
const comment = {
  maPhong: "{{roomId}}",
  maNguoiBinhLuan: "{{userId}}",
  ngayBinhLuan: "2030-12-03T15:00:00+07:00",
  noiDung: "Phòng sạch sẽ, đầy đủ tiện nghi",
  saoBinhLuan: 5,
};
const managedUpdate = { ...managed };
delete managedUpdate.password;
const entries = [];
function add(group, name, method, route, options = {}) {
  entries.push({ group, name, method, route, ...options });
}
add("01. Auth", "Đăng ký", "POST", "/api/auth/signup", {
  body: profile,
  sample: "user",
  save: "userId",
  errors: [
    [400, "Địa chỉ email không đúng định dạng."],
    [409, "Địa chỉ email đã được sử dụng. Vui lòng chọn email khác."],
  ],
  notes:
    "Luôn tạo USER dù gửi role ADMIN. Tự lưu userId để đặt phòng và bình luận.",
});
add("01. Auth", "Đăng nhập ADMIN hoặc USER", "POST", "/api/auth/signin", {
  body: { email: "{{loginEmail}}", password: "{{loginPassword}}" },
  sample: "login",
  signin: true,
  errors: [
    [400, "Địa chỉ email là thông tin bắt buộc."],
    [401, "Email hoặc mật khẩu không đúng."],
    [429, "Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau."],
  ],
  notes:
    "loginAs=ADMIN: dùng adminEmail/adminPassword. loginAs=USER: dùng userEmail/userPassword. Tự lưu adminToken hoặc userToken theo vai trò trả về. Đăng nhập không tự tạo tài khoản.",
});
add("02. Người dùng", "Danh sách người dùng", "GET", "/api/users", {
  auth: "admin",
  sample: "userList",
});
add("02. Người dùng", "Tạo người dùng", "POST", "/api/users", {
  auth: "admin",
  body: managed,
  sample: "managedUser",
  save: "managedUserId",
  notes:
    "ADMIN có thể chọn USER hoặc ADMIN. Tài khoản test riêng được lưu trong managedUserId để tránh xóa nhầm tài khoản đang dùng.",
});
add(
  "02. Người dùng",
  "Phân trang và tìm người dùng",
  "GET",
  "/api/users/phan-trang-tim-kiem",
  {
    auth: "admin",
    query: { pageIndex: "1", pageSize: "10", keyword: "Postman" },
    sample: "userPage",
  },
);
add("02. Người dùng", "Chi tiết người dùng", "GET", "/api/users/{id}", {
  auth: "admin",
  ids: { id: "managedUserId" },
  sample: "managedUser",
});
add("02. Người dùng", "Cập nhật người dùng", "PUT", "/api/users/{id}", {
  auth: "admin",
  ids: { id: "managedUserId" },
  body: { ...managedUpdate, name: "Tài khoản Postman đã sửa" },
  sample: "managedUser",
  notes:
    "Gửi đủ name, email, phone, birthday, gender, role. Không cập nhật mật khẩu qua API này.",
});
add(
  "02. Người dùng",
  "Tìm người dùng theo tên",
  "GET",
  "/api/users/search/{TenNguoiDung}",
  { auth: "admin", ids: { TenNguoiDung: "searchName" }, sample: "userList" },
);
add("02. Người dùng", "Tải ảnh đại diện", "POST", "/api/users/upload-avatar", {
  auth: "user",
  upload: true,
  sample: "avatar",
  notes: "Cập nhật avatar của tài khoản trong token; không nhận mã người dùng.",
});
add("02. Người dùng", "Xóa người dùng test quản trị", "DELETE", "/api/users", {
  auth: "admin",
  query: { id: "{{managedUserId}}" },
  sample: "managedUser",
  notes:
    "id truyền trong query. Chỉ xóa tài khoản test do request Tạo người dùng tạo ra. Không dùng ID ADMIN.",
});
add("03. Vị trí", "Tạo vị trí", "POST", "/api/vi-tri", {
  auth: "admin",
  body: location,
  sample: "location",
  save: "locationId",
});
add("03. Vị trí", "Danh sách vị trí", "GET", "/api/vi-tri", {
  sample: "locationList",
});
add(
  "03. Vị trí",
  "Phân trang và tìm vị trí",
  "GET",
  "/api/vi-tri/phan-trang-tim-kiem",
  {
    query: { pageIndex: "1", pageSize: "10", keyword: "Postman" },
    sample: "locationPage",
  },
);
add("03. Vị trí", "Chi tiết vị trí", "GET", "/api/vi-tri/{id}", {
  ids: { id: "locationId" },
  sample: "location",
});
add("03. Vị trí", "Cập nhật vị trí", "PUT", "/api/vi-tri/{id}", {
  auth: "admin",
  ids: { id: "locationId" },
  body: { ...location, tinhThanh: "Hà Nội" },
  sample: "location",
});
add("03. Vị trí", "Tải hình vị trí", "POST", "/api/vi-tri/upload-hinh-vitri", {
  auth: "admin",
  query: { maViTri: "{{locationId}}" },
  upload: true,
  sample: "locationImage",
});
add("03. Vị trí", "Xóa vị trí", "DELETE", "/api/vi-tri/{id}", {
  auth: "admin",
  ids: { id: "locationId" },
  sample: "location",
  notes:
    "Thực hiện cuối cùng sau khi đã xóa các phòng thuộc vị trí; nếu còn phòng trả 409.",
});
add("04. Phòng thuê", "Tạo phòng", "POST", "/api/phong-thue", {
  auth: "admin",
  body: room,
  sample: "room",
  save: "roomId",
  notes:
    "Phải tạo vị trí trước. maViTri là số nguyên, tự lấy từ locationId; không phải ID phòng.",
});
add("04. Phòng thuê", "Danh sách phòng", "GET", "/api/phong-thue", {
  sample: "roomList",
});
add(
  "04. Phòng thuê",
  "Lấy phòng theo vị trí",
  "GET",
  "/api/phong-thue/lay-phong-theo-vi-tri",
  { query: { maViTri: "{{locationId}}" }, sample: "roomList" },
);
add(
  "04. Phòng thuê",
  "Phân trang và tìm phòng",
  "GET",
  "/api/phong-thue/phan-trang-tim-kiem",
  {
    query: { pageIndex: "1", pageSize: "10", keyword: "Postman" },
    sample: "roomPage",
  },
);
add("04. Phòng thuê", "Chi tiết phòng", "GET", "/api/phong-thue/{id}", {
  ids: { id: "roomId" },
  sample: "room",
});
add("04. Phòng thuê", "Cập nhật phòng", "PUT", "/api/phong-thue/{id}", {
  auth: "admin",
  ids: { id: "roomId" },
  body: { ...room, giaTien: 900000 },
  sample: "room",
  errors: [[409, "Sức chứa mới nhỏ hơn số khách của đặt phòng hiện có."]],
  notes:
    "Gửi đầy đủ trường. Không được giảm khach xuống thấp hơn soLuongKhach của đặt phòng đang lưu.",
});
add(
  "04. Phòng thuê",
  "Tải hình phòng",
  "POST",
  "/api/phong-thue/upload-hinh-phong",
  {
    auth: "admin",
    query: { maPhong: "{{roomId}}" },
    upload: true,
    sample: "roomImage",
  },
);
add("04. Phòng thuê", "Xóa phòng", "DELETE", "/api/phong-thue/{id}", {
  auth: "admin",
  ids: { id: "roomId" },
  sample: "room",
  notes:
    "Xóa bình luận và đặt phòng liên quan trước. Nếu còn dữ liệu phụ thuộc trả 409.",
});
add("05. Đặt phòng", "Tạo đặt phòng", "POST", "/api/dat-phong", {
  auth: "user",
  body: booking,
  sample: "booking",
  save: "bookingId",
  errors: [
    [400, "Số khách vượt sức chứa của phòng."],
    [409, "Phòng đã được đặt trong khoảng thời gian này."],
  ],
  notes:
    "USER chỉ được gửi maNguoiDung trùng ID của chính mình. ADMIN được đặt thay. Ngày đi phải sau ngày đến, lịch không trùng, số khách không vượt sức chứa.",
});
add("05. Đặt phòng", "Danh sách đặt phòng", "GET", "/api/dat-phong", {
  auth: "user",
  sample: "bookingList",
  notes:
    "USER chỉ thấy đặt phòng của mình. Đổi token sang adminToken nếu muốn xem toàn bộ.",
});
add("05. Đặt phòng", "Chi tiết đặt phòng", "GET", "/api/dat-phong/{id}", {
  auth: "user",
  ids: { id: "bookingId" },
  sample: "booking",
});
add("05. Đặt phòng", "Cập nhật đặt phòng", "PUT", "/api/dat-phong/{id}", {
  auth: "user",
  ids: { id: "bookingId" },
  body: { ...booking, soLuongKhach: 3 },
  sample: "booking",
  notes:
    "Chủ đặt phòng hoặc ADMIN. Không được mạo danh người đặt khác. Kiểm tra lại lịch và sức chứa khi cập nhật.",
});
add(
  "05. Đặt phòng",
  "Lấy đặt phòng theo người dùng",
  "GET",
  "/api/dat-phong/lay-theo-nguoi-dung/{MaNguoiDung}",
  {
    auth: "user",
    ids: { MaNguoiDung: "userId" },
    sample: "bookingList",
    notes:
      "USER chỉ xem được mã người dùng của mình; ADMIN được xem người khác.",
  },
);
add("05. Đặt phòng", "Xóa đặt phòng", "DELETE", "/api/dat-phong/{id}", {
  auth: "user",
  ids: { id: "bookingId" },
  sample: "booking",
  notes:
    "Chủ đặt phòng hoặc ADMIN. Xóa xong không thể xem/cập nhật ID này, trừ khi tạo bản ghi mới với ID mới.",
});
add("06. Bình luận", "Tạo bình luận", "POST", "/api/binh-luan", {
  auth: "user",
  body: comment,
  sample: "comment",
  save: "commentId",
  errors: [
    [400, "Số sao bình luận phải nhỏ hơn hoặc bằng 5."],
    [400, "Nội dung bình luận không được để trống."],
  ],
  notes:
    "maNguoiBinhLuan phải là ID của USER trong token; ADMIN có thể thao tác thay. Số sao nguyên từ 1 đến 5.",
});
add("06. Bình luận", "Danh sách bình luận", "GET", "/api/binh-luan", {
  sample: "commentList",
});
add(
  "06. Bình luận",
  "Bình luận theo phòng",
  "GET",
  "/api/binh-luan/lay-binh-luan-theo-phong/{MaPhong}",
  { ids: { MaPhong: "roomId" }, sample: "commentList" },
);
add("06. Bình luận", "Cập nhật bình luận", "PUT", "/api/binh-luan/{id}", {
  auth: "user",
  ids: { id: "commentId" },
  body: { ...comment, noiDung: "Đánh giá đã cập nhật", saoBinhLuan: 4 },
  sample: "comment",
  notes: "Chủ bình luận hoặc ADMIN. Gửi đầy đủ các trường của bình luận.",
});
add("06. Bình luận", "Xóa bình luận", "DELETE", "/api/binh-luan/{id}", {
  auth: "user",
  ids: { id: "commentId" },
  sample: "commentDeleted",
  notes:
    "Chủ bình luận hoặc ADMIN. Response xóa là bản ghi bình luận, không kèm tên và avatar người bình luận.",
});

const numericVars = [
  "userId",
  "managedUserId",
  "locationId",
  "roomId",
  "bookingId",
  "commentId",
];
function rawBody(body) {
  let raw = JSON.stringify(body, null, 2);
  for (const key of numericVars)
    raw = raw.replaceAll(`"{{${key}}}"`, `{{${key}}}`);
  return raw;
}
const userSample = {
  id: 101,
  name: profile.name,
  email: "user-postman@example.com",
  phone: profile.phone,
  birthday: profile.birthday,
  gender: true,
  role: "USER",
  avatar: "",
};
const locationSample = { id: 201, ...location };
const roomSample = { id: 301, ...room, maViTri: 201 };
const bookingSample = {
  id: 401,
  ...booking,
  maPhong: 301,
  maNguoiDung: 101,
  ngayDen: "2030-12-01T07:00:00.000Z",
  ngayDi: "2030-12-03T05:00:00.000Z",
};
const commentSample = {
  id: 501,
  ...comment,
  maPhong: 301,
  maNguoiBinhLuan: 101,
  ngayBinhLuan: "2030-12-03T08:00:00.000Z",
};
const samples = {
  user: userSample,
  managedUser: {
    ...userSample,
    id: 102,
    name: managed.name,
    email: "managed-postman@example.com",
  },
  location: locationSample,
  room: roomSample,
  booking: bookingSample,
  commentDeleted: commentSample,
  comment: { ...commentSample, tenNguoiBinhLuan: userSample.name, avatar: "" },
  avatar: { ...userSample, avatar: "/uploads/anh-mau.png" },
  locationImage: { ...locationSample, hinhAnh: "/uploads/anh-mau.png" },
  roomImage: { ...roomSample, hinhAnh: "/uploads/anh-mau.png" },
  login: {
    user: { ...userSample, role: "ADMIN" },
    token: "TOKEN_MINH_HOA_KHONG_CO_HIEU_LUC",
  },
};
for (const key of ["user", "location", "room", "booking", "comment"]) {
  samples[`${key}List`] = [samples[key]];
  samples[`${key}Page`] = {
    pageIndex: 1,
    pageSize: 10,
    totalRow: 1,
    totalPages: 1,
    data: [samples[key]],
  };
}
const rules = {
  id: "Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body.",
  name: "Chuỗi không trống, tối đa 255 ký tự.",
  email:
    "Email hợp lệ, tối đa 255 ký tự; chuẩn hóa chữ thường, không trùng tài khoản khác.",
  password:
    "Tạo tài khoản: 8–72 ký tự và tối đa 72 byte UTF-8. Đăng nhập: không trống, tối đa 72 ký tự.",
  phone: "Chuỗi không trống, tối đa 30 ký tự.",
  birthday: "Ngày hợp lệ dạng YYYY-MM-DD.",
  gender: "Boolean true/false, không dùng chuỗi.",
  role: "USER hoặc ADMIN; mặc định USER. Đăng ký công khai luôn tạo USER.",
  hinhAnh:
    "Chuỗi tối đa 500 ký tự; có thể để rỗng, dùng URL ảnh hoặc API upload riêng.",
  maViTri: "Số nguyên dương, vị trí phải tồn tại.",
  maPhong: "Số nguyên dương, phòng phải tồn tại.",
  maNguoiDung:
    "Số nguyên dương, người dùng phải tồn tại và phù hợp quyền sở hữu.",
  maNguoiBinhLuan:
    "Số nguyên dương, người bình luận phải tồn tại và phù hợp quyền sở hữu.",
  ngayDen: "Ngày giờ ISO 8601 có múi giờ; phải trước ngày đi.",
  ngayDi: "Ngày giờ ISO 8601 có múi giờ; phải sau ngày đến.",
  ngayBinhLuan: "Ngày giờ ISO 8601 có múi giờ.",
  soLuongKhach: "Số nguyên từ 1, không vượt sức chứa phòng.",
  saoBinhLuan: "Số nguyên từ 1 đến 5.",
  noiDung:
    "Chuỗi không trống sau khi bỏ khoảng trắng đầu/cuối, tối đa 10000 ký tự.",
  moTa: "Chuỗi không trống, tối đa 10000 ký tự.",
  khach: "Số nguyên từ 1; không được giảm dưới số khách của đặt phòng hiện có.",
  pageIndex: "Số nguyên từ 1 đến 1000000; mặc định 1.",
  pageSize: "Số nguyên từ 1 đến 100; mặc định 10.",
  keyword: "Chuỗi tối đa 255 ký tự; mặc định rỗng, lọc theo tên.",
  formFile:
    "Một ảnh PNG/JPEG/WebP, tối đa 5 MB; kiểm tra kiểu MIME và chữ ký file.",
};
function fieldRule(name, schema) {
  return (
    rules[name] ||
    (schema.type === "boolean"
      ? "Boolean true/false."
      : schema.type === "integer"
        ? "Số nguyên từ 0 đến 2147483647."
        : "Chuỗi không trống, tối đa 255 ký tự.")
  );
}
function specification(entry) {
  const operation = source.paths[entry.route][entry.method.toLowerCase()];
  const lines = [
    `**Chức năng:** ${entry.name}.`,
    `**Method / endpoint:** \`${entry.method} ${entry.route}\`.`,
    `**Quyền:** ${entry.auth === "admin" ? "ADMIN." : entry.auth === "user" ? "Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER." : "Công khai."}`,
    "",
  ];
  if (entry.notes) lines.push(entry.notes, "");
  if (entry.auth)
    lines.push(
      `**Header:** \`token: {{${entry.auth}Token}}\` (tự cấu hình sẵn).`,
      "",
    );
  if (entry.body)
    lines.push(
      "**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.",
      "",
    );
  if (entry.upload)
    lines.push(
      "**Content-Type:** multipart/form-data, để Postman tự tạo boundary. Chọn file thật ở Body → form-data → formFile. Không điền đường dẫn ảnh vào JSON.",
      "",
    );
  lines.push(
    "| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |",
    "| --- | --- | --- | --- | --- |",
  );
  for (const p of operation.parameters.filter(
    (p) => !["token", "tokenCybersoft"].includes(p.name),
  )) {
    if (p.in === "body") {
      const schema = source.definitions[p.schema.$ref.split("/").at(-1)];
      for (const [name, prop] of Object.entries(schema.properties))
        lines.push(
          `| ${name} | JSON body | ${prop.type} | ${["id", "role", "hinhAnh"].includes(name) ? "Không" : "Có"} | ${fieldRule(name, prop)} |`,
        );
    } else {
      const optional = ["pageIndex", "pageSize", "keyword"].includes(p.name);
      const rule =
        p.type === "file"
          ? rules.formFile
          : rules[p.name] ||
            (p.name === "TenNguoiDung"
              ? "Tên cần tìm, truyền trong đường dẫn."
              : "Mã định danh số nguyên dương; bản ghi liên quan phải tồn tại.");
      lines.push(
        `| ${p.name} | ${p.in} | ${p.type} | ${optional ? "Không" : "Có"} | ${rule} |`,
      );
    }
  }
  lines.push(
    "",
    "**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.",
    "",
    "**Lỗi:**",
  );
  for (const [code, message] of errorsFor(entry))
    lines.push(`- HTTP ${code}: ${message}`);
  lines.push(
    "",
    "Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.",
  );
  return lines.join("\n");
}
function errorsFor(e) {
  const errors = [...(e.errors || [])];
  if (e.body || e.query || e.ids) errors.push([400, "Dữ liệu không hợp lệ."]);
  if (e.auth)
    errors.push(
      [401, "Vui lòng đăng nhập."],
      [
        403,
        e.auth === "admin"
          ? "Chỉ quản trị viên được phép thao tác."
          : "Bạn không có quyền thao tác dữ liệu này.",
      ],
    );
  if (
    e.ids ||
    e.query?.maViTri ||
    e.query?.maPhong ||
    (["room", "booking", "comment"].includes(e.sample) && e.body)
  )
    errors.push([404, "Không tìm thấy dữ liệu."]);
  if (e.method === "DELETE")
    errors.push([409, "Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng."]);
  if (
    (e.route === "/api/users" && e.method === "POST") ||
    (e.route === "/api/users/{id}" && e.method === "PUT")
  )
    errors.push([
      409,
      "Địa chỉ email đã được sử dụng. Vui lòng chọn email khác.",
    ]);
  if (e.upload)
    errors.push(
      [400, "Vui lòng chọn ảnh trong trường formFile."],
      [400, "Dung lượng ảnh không được vượt quá 5 MB."],
    );
  errors.push([500, "Lỗi hệ thống."]);
  return errors.filter(
    ([code, message], index, all) =>
      all.findIndex((v) => v[0] === code && v[1] === message) === index,
  );
}
function itemFor(e, index) {
  let path = e.route;
  for (const [name, key] of Object.entries(e.ids || {}))
    path = path.replace(`{${name}}`, `{{${key}}}`);
  const query = Object.entries(e.query || {}).map(([key, value]) => ({
    key,
    value,
  }));
  const raw = `{{baseUrl}}${path}${query.length ? "?" + query.map((v) => `${v.key}=${v.value}`).join("&") : ""}`;
  const request = {
    method: e.method,
    auth: { type: "noauth" },
    header: [{ key: "Accept", value: "application/json" }],
    url: {
      raw,
      host: ["{{baseUrl}}"],
      path: path.slice(1).split("/"),
      ...(query.length ? { query } : {}),
    },
    description: specification(e),
  };
  if (e.auth)
    request.header.push({
      key: "token",
      value: `{{${e.auth}Token}}`,
      description: "JWT tự lưu sau đăng nhập.",
    });
  if (e.body) {
    request.header.push({ key: "Content-Type", value: "application/json" });
    request.body = {
      mode: "raw",
      raw: rawBody(e.body),
      options: { raw: { language: "json" } },
    };
  }
  if (e.upload)
    request.body = {
      mode: "formdata",
      formdata: [
        { key: "formFile", type: "file", src: [], description: rules.formFile },
      ],
    };
  const tests = [
    'pm.test("Mã HTTP đúng mong đợi", function () { pm.response.to.have.status(Number(pm.environment.get("expectedStatus") || 200)); });',
    "const result = pm.response.json();",
    'pm.test("Đúng cấu trúc phản hồi", function () { pm.expect(result.statusCode).to.eql(pm.response.code); pm.expect(result.message).to.be.a("string"); pm.expect(result).to.have.property("content"); });',
  ];
  if (e.save)
    tests.push(
      `if (pm.response.code === 200 && result.content && result.content.id) pm.environment.set("${e.save}", result.content.id);`,
    );
  if (e.signin)
    tests.push(
      'if (pm.response.code === 200) { const user = result.content.user; const key = user.role === "ADMIN" ? "admin" : "user"; pm.environment.set(key + "Token", result.content.token); pm.environment.set(key + "Id", user.id); }',
    );
  const event = [
    { listen: "test", script: { type: "text/javascript", exec: tests } },
  ];
  if (e.signin)
    event.unshift({
      listen: "prerequest",
      script: {
        type: "text/javascript",
        exec: [
          'const prefix = pm.environment.get("loginAs") === "USER" ? "user" : "admin";',
          'pm.variables.set("loginEmail", pm.environment.get(prefix + "Email"));',
          'pm.variables.set("loginPassword", pm.environment.get(prefix + "Password"));',
        ],
      },
    });
  function response(name, code, content, message) {
    return {
      name,
      originalRequest: structuredClone(request),
      status: {
        200: "OK",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        409: "Conflict",
        429: "Too Many Requests",
        500: "Internal Server Error",
      }[code],
      code,
      _postman_previewlanguage: "json",
      header: [
        { key: "Content-Type", value: "application/json; charset=utf-8" },
      ],
      cookie: [],
      body: JSON.stringify({ statusCode: code, message, content }, null, 2),
    };
  }
  const content = structuredClone(samples[e.sample]);
  if (e.method === "PUT" && e.body) {
    for (const [key, value] of Object.entries(e.body))
      if (!(typeof value === "string" && value.includes("{{")))
        content[key] = value;
  }
  return {
    name: `${String(index + 1).padStart(2, "0")}. ${e.name}`,
    request,
    event,
    response: [
      response("200 — Thành công (minh họa)", 200, content, "Thành công"),
      ...errorsFor(e).map(([code, message]) =>
        response(`${code} — ${message}`, code, null, message),
      ),
    ],
  };
}
const folders = [...new Set(entries.map((e) => e.group))].map((name) => ({
  name,
  item: entries
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.group === name)
    .map(({ e, i }) => itemFor(e, i)),
}));
const collection = {
  info: {
    name: "BC95 — Đặc tả 36 API Airbnb",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    description:
      "Đặc tả API backend Airbnb theo source hiện tại. 6 nhóm, 36 request; mô tả tiếng Việt, bảng tham số, request và response mẫu. Import Environment mẫu và đọc DAC_TA_API.md trước khi chạy. Thực hiện thủ công theo thứ tự trong hướng dẫn; không chạy toàn bộ Collection theo thứ tự hiển thị vì có các thao tác xóa và cần đăng nhập cả ADMIN/USER. Chưa deploy: baseUrl mặc định localhost. Không chứa bí mật thực tế.",
  },
  event: [
    {
      listen: "prerequest",
      script: {
        type: "text/javascript",
        exec: [
          'if (!pm.environment.get("runId")) pm.environment.set("runId", String(Date.now()));',
          'if (!pm.environment.get("userEmail")) pm.environment.set("userEmail", "postman-" + pm.environment.get("runId") + "@example.com");',
        ],
      },
    },
  ],
  item: folders,
};
const values = {
  baseUrl: "http://localhost:3001",
  loginAs: "ADMIN",
  adminEmail: "",
  adminPassword: "",
  adminToken: "",
  adminId: "",
  userEmail: "",
  userPassword: "PostmanTest123!",
  userToken: "",
  userId: "",
  managedUserId: "",
  locationId: "",
  roomId: "",
  bookingId: "",
  commentId: "",
  runId: "",
  searchName: "Postman",
  expectedStatus: "200",
};
const environment = {
  name: "Airbnb — Mẫu Local hoặc Deploy",
  _postman_variable_scope: "environment",
  values: Object.entries(values).map(([key, value]) => ({
    key,
    value,
    enabled: true,
    type: /Password|Token/.test(key) ? "secret" : "default",
  })),
};
await writeFile(
  new URL("Airbnb.postman_collection.json", out),
  JSON.stringify(collection, null, 2) + "\n",
);
await writeFile(
  new URL("Airbnb.postman_environment.json", out),
  JSON.stringify(environment, null, 2) + "\n",
);
const spec = [
  "# ĐẶC TẢ 36 API AIRBNB",
  "",
  "Ngày cập nhật: 02/11/2026. Nguồn: code backend và Swagger tham chiếu. Base URL local: `http://localhost:3001`. Chưa có URL deploy.",
  "",
  "## Quy ước chung",
  "",
  "- Response: `{ statusCode, message, content }`; mọi thao tác thành công hiện trả HTTP 200.",
  "- Khóa JSON camelCase giữ nguyên theo hợp đồng API. Nội dung thông báo lỗi bằng tiếng Việt.",
  "- ID, số khách, số sao, giá và số lượng tiện nghi là số nguyên. Ngày sinh YYYY-MM-DD; ngày giờ ISO 8601 có múi giờ, lưu/hiển thị UTC trong response.",
  "- ID trong ví dụ response là số minh họa. Biến Postman lấy ID thực từ request tạo dữ liệu; không mặc định dùng ID 1.",
  "- USER chỉ thao tác đặt phòng/bình luận của mình; ADMIN quản lý dữ liệu theo từng endpoint. Không yêu cầu tokenCybersoft.",
  "- Lịch đặt dùng khoảng [ngayDen, ngayDi), chặn trùng lịch đồng thời. Khóa ngoại chặn xóa dữ liệu đang liên kết.",
  "- Ví dụ lỗi 400 chung mô tả loại lỗi; thông điệp thực tế nêu rõ từng trường. Upload tối đa 5 MB; JSON tối đa 1 MB (413). Encoding không hỗ trợ trả 415. Auth giới hạn 100 yêu cầu/15 phút (429).",
  "- Request đăng ký và signin đều chịu giới hạn auth. Tài liệu Examples là minh họa, không phải log kiểm thử.",
  "",
  "## Danh mục",
  "",
  "| STT | Chức năng | Method | Endpoint |",
  "| --- | --- | --- | --- |",
  ...entries.map(
    (e, i) => `| ${i + 1} | ${e.name} | ${e.method} | ${e.route} |`,
  ),
];
for (const [i, e] of entries.entries()) {
  const item = folders.flatMap((f) => f.item)[i];
  spec.push(
    "",
    `## ${i + 1}. ${e.name}`,
    "",
    specification(e),
    "",
    "**URL mẫu:**",
    "",
    "```text",
    item.request.url.raw,
    "```",
  );
  if (e.body)
    spec.push(
      "",
      "**Body mẫu Postman:**",
      "",
      "```json",
      rawBody(e.body),
      "```",
      "",
      "Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.",
    );
  if (e.upload)
    spec.push(
      "",
      "**Body:** form-data, `formFile` loại File, chọn ảnh từ máy.",
    );
  spec.push(
    "",
    "**Response thành công minh họa:**",
    "",
    "```json",
    item.response[0].body,
    "```",
  );
  const error = item.response.find((r) => r.code !== 200);
  spec.push("", "**Response lỗi minh họa:**", "", "```json", error.body, "```");
}
await writeFile(new URL("DAC_TA_API.md", out), spec.join("\n") + "\n");
console.log(
  `Đã tạo Collection, Environment và đặc tả cho ${entries.length} API.`,
);
