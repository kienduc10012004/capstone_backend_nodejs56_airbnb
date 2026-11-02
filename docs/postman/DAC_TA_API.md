# ĐẶC TẢ 36 API AIRBNB

Ngày cập nhật: 02/11/2026. Nguồn: code backend và Swagger tham chiếu. Base URL local: `http://localhost:3001`. Chưa có URL deploy.

## Quy ước chung

- Response: `{ statusCode, message, content }`; mọi thao tác thành công hiện trả HTTP 200.
- Khóa JSON camelCase giữ nguyên theo hợp đồng API. Nội dung thông báo lỗi bằng tiếng Việt.
- ID, số khách, số sao, giá và số lượng tiện nghi là số nguyên. Ngày sinh YYYY-MM-DD; ngày giờ ISO 8601 có múi giờ, lưu/hiển thị UTC trong response.
- ID trong ví dụ response là số minh họa. Biến Postman lấy ID thực từ request tạo dữ liệu; không mặc định dùng ID 1.
- USER chỉ thao tác đặt phòng/bình luận của mình; ADMIN quản lý dữ liệu theo từng endpoint. Không yêu cầu tokenCybersoft.
- Lịch đặt dùng khoảng [ngayDen, ngayDi), chặn trùng lịch đồng thời. Khóa ngoại chặn xóa dữ liệu đang liên kết.
- Ví dụ lỗi 400 chung mô tả loại lỗi; thông điệp thực tế nêu rõ từng trường. Upload tối đa 5 MB; JSON tối đa 1 MB (413). Encoding không hỗ trợ trả 415. Auth giới hạn 100 yêu cầu/15 phút (429).
- Request đăng ký và signin đều chịu giới hạn auth. Tài liệu Examples là minh họa, không phải log kiểm thử.

## Danh mục

| STT | Chức năng | Method | Endpoint |
| --- | --- | --- | --- |
| 1 | Đăng ký | POST | /api/auth/signup |
| 2 | Đăng nhập ADMIN hoặc USER | POST | /api/auth/signin |
| 3 | Danh sách người dùng | GET | /api/users |
| 4 | Tạo người dùng | POST | /api/users |
| 5 | Phân trang và tìm người dùng | GET | /api/users/phan-trang-tim-kiem |
| 6 | Chi tiết người dùng | GET | /api/users/{id} |
| 7 | Cập nhật người dùng | PUT | /api/users/{id} |
| 8 | Tìm người dùng theo tên | GET | /api/users/search/{TenNguoiDung} |
| 9 | Tải ảnh đại diện | POST | /api/users/upload-avatar |
| 10 | Xóa người dùng test quản trị | DELETE | /api/users |
| 11 | Tạo vị trí | POST | /api/vi-tri |
| 12 | Danh sách vị trí | GET | /api/vi-tri |
| 13 | Phân trang và tìm vị trí | GET | /api/vi-tri/phan-trang-tim-kiem |
| 14 | Chi tiết vị trí | GET | /api/vi-tri/{id} |
| 15 | Cập nhật vị trí | PUT | /api/vi-tri/{id} |
| 16 | Tải hình vị trí | POST | /api/vi-tri/upload-hinh-vitri |
| 17 | Xóa vị trí | DELETE | /api/vi-tri/{id} |
| 18 | Tạo phòng | POST | /api/phong-thue |
| 19 | Danh sách phòng | GET | /api/phong-thue |
| 20 | Lấy phòng theo vị trí | GET | /api/phong-thue/lay-phong-theo-vi-tri |
| 21 | Phân trang và tìm phòng | GET | /api/phong-thue/phan-trang-tim-kiem |
| 22 | Chi tiết phòng | GET | /api/phong-thue/{id} |
| 23 | Cập nhật phòng | PUT | /api/phong-thue/{id} |
| 24 | Tải hình phòng | POST | /api/phong-thue/upload-hinh-phong |
| 25 | Xóa phòng | DELETE | /api/phong-thue/{id} |
| 26 | Tạo đặt phòng | POST | /api/dat-phong |
| 27 | Danh sách đặt phòng | GET | /api/dat-phong |
| 28 | Chi tiết đặt phòng | GET | /api/dat-phong/{id} |
| 29 | Cập nhật đặt phòng | PUT | /api/dat-phong/{id} |
| 30 | Lấy đặt phòng theo người dùng | GET | /api/dat-phong/lay-theo-nguoi-dung/{MaNguoiDung} |
| 31 | Xóa đặt phòng | DELETE | /api/dat-phong/{id} |
| 32 | Tạo bình luận | POST | /api/binh-luan |
| 33 | Danh sách bình luận | GET | /api/binh-luan |
| 34 | Bình luận theo phòng | GET | /api/binh-luan/lay-binh-luan-theo-phong/{MaPhong} |
| 35 | Cập nhật bình luận | PUT | /api/binh-luan/{id} |
| 36 | Xóa bình luận | DELETE | /api/binh-luan/{id} |

## 1. Đăng ký

**Chức năng:** Đăng ký.
**Method / endpoint:** `POST /api/auth/signup`.
**Quyền:** Công khai.

Luôn tạo USER dù gửi role ADMIN. Tự lưu userId để đặt phòng và bình luận.

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| name | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| email | JSON body | string | Có | Email hợp lệ, tối đa 255 ký tự; chuẩn hóa chữ thường, không trùng tài khoản khác. |
| password | JSON body | string | Có | Tạo tài khoản: 8–72 ký tự và tối đa 72 byte UTF-8. Đăng nhập: không trống, tối đa 72 ký tự. |
| phone | JSON body | string | Có | Chuỗi không trống, tối đa 30 ký tự. |
| birthday | JSON body | string | Có | Ngày hợp lệ dạng YYYY-MM-DD. |
| gender | JSON body | boolean | Có | Boolean true/false, không dùng chuỗi. |
| role | JSON body | string | Không | USER hoặc ADMIN; mặc định USER. Đăng ký công khai luôn tạo USER. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Địa chỉ email không đúng định dạng.
- HTTP 409: Địa chỉ email đã được sử dụng. Vui lòng chọn email khác.
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/auth/signup
```

**Body mẫu Postman:**

```json
{
  "name": "Người dùng Postman",
  "email": "{{userEmail}}",
  "password": "{{userPassword}}",
  "phone": "0901234567",
  "birthday": "2000-01-15",
  "gender": true,
  "role": "USER"
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 101,
    "name": "Người dùng Postman",
    "email": "user-postman@example.com",
    "phone": "0901234567",
    "birthday": "2000-01-15",
    "gender": true,
    "role": "USER",
    "avatar": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Địa chỉ email không đúng định dạng.",
  "content": null
}
```

## 2. Đăng nhập ADMIN hoặc USER

**Chức năng:** Đăng nhập ADMIN hoặc USER.
**Method / endpoint:** `POST /api/auth/signin`.
**Quyền:** Công khai.

loginAs=ADMIN: dùng adminEmail/adminPassword. loginAs=USER: dùng userEmail/userPassword. Tự lưu adminToken hoặc userToken theo vai trò trả về. Đăng nhập không tự tạo tài khoản.

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| email | JSON body | string | Có | Email hợp lệ, tối đa 255 ký tự; chuẩn hóa chữ thường, không trùng tài khoản khác. |
| password | JSON body | string | Có | Tạo tài khoản: 8–72 ký tự và tối đa 72 byte UTF-8. Đăng nhập: không trống, tối đa 72 ký tự. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Địa chỉ email là thông tin bắt buộc.
- HTTP 401: Email hoặc mật khẩu không đúng.
- HTTP 429: Quá nhiều yêu cầu đăng nhập/đăng ký. Vui lòng thử lại sau.
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/auth/signin
```

**Body mẫu Postman:**

```json
{
  "email": "{{loginEmail}}",
  "password": "{{loginPassword}}"
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "user": {
      "id": 101,
      "name": "Người dùng Postman",
      "email": "user-postman@example.com",
      "phone": "0901234567",
      "birthday": "2000-01-15",
      "gender": true,
      "role": "ADMIN",
      "avatar": ""
    },
    "token": "TOKEN_MINH_HOA_KHONG_CO_HIEU_LUC"
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Địa chỉ email là thông tin bắt buộc.",
  "content": null
}
```

## 3. Danh sách người dùng

**Chức năng:** Danh sách người dùng.
**Method / endpoint:** `GET /api/users`.
**Quyền:** ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/users
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 101,
      "name": "Người dùng Postman",
      "email": "user-postman@example.com",
      "phone": "0901234567",
      "birthday": "2000-01-15",
      "gender": true,
      "role": "USER",
      "avatar": ""
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 401,
  "message": "Vui lòng đăng nhập.",
  "content": null
}
```

## 4. Tạo người dùng

**Chức năng:** Tạo người dùng.
**Method / endpoint:** `POST /api/users`.
**Quyền:** ADMIN.

ADMIN có thể chọn USER hoặc ADMIN. Tài khoản test riêng được lưu trong managedUserId để tránh xóa nhầm tài khoản đang dùng.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| name | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| email | JSON body | string | Có | Email hợp lệ, tối đa 255 ký tự; chuẩn hóa chữ thường, không trùng tài khoản khác. |
| password | JSON body | string | Có | Tạo tài khoản: 8–72 ký tự và tối đa 72 byte UTF-8. Đăng nhập: không trống, tối đa 72 ký tự. |
| phone | JSON body | string | Có | Chuỗi không trống, tối đa 30 ký tự. |
| birthday | JSON body | string | Có | Ngày hợp lệ dạng YYYY-MM-DD. |
| gender | JSON body | boolean | Có | Boolean true/false, không dùng chuỗi. |
| role | JSON body | string | Không | USER hoặc ADMIN; mặc định USER. Đăng ký công khai luôn tạo USER. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 409: Địa chỉ email đã được sử dụng. Vui lòng chọn email khác.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/users
```

**Body mẫu Postman:**

```json
{
  "name": "Tài khoản quản lý Postman",
  "email": "managed-{{runId}}@example.com",
  "password": "{{userPassword}}",
  "phone": "0901234567",
  "birthday": "2000-01-15",
  "gender": true,
  "role": "USER"
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 102,
    "name": "Tài khoản quản lý Postman",
    "email": "managed-postman@example.com",
    "phone": "0901234567",
    "birthday": "2000-01-15",
    "gender": true,
    "role": "USER",
    "avatar": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 5. Phân trang và tìm người dùng

**Chức năng:** Phân trang và tìm người dùng.
**Method / endpoint:** `GET /api/users/phan-trang-tim-kiem`.
**Quyền:** ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| pageIndex | query | integer | Không | Số nguyên từ 1 đến 1000000; mặc định 1. |
| pageSize | query | integer | Không | Số nguyên từ 1 đến 100; mặc định 10. |
| keyword | query | string | Không | Chuỗi tối đa 255 ký tự; mặc định rỗng, lọc theo tên. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/users/phan-trang-tim-kiem?pageIndex=1&pageSize=10&keyword=Postman
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "pageIndex": 1,
    "pageSize": 10,
    "totalRow": 1,
    "totalPages": 1,
    "data": [
      {
        "id": 101,
        "name": "Người dùng Postman",
        "email": "user-postman@example.com",
        "phone": "0901234567",
        "birthday": "2000-01-15",
        "gender": true,
        "role": "USER",
        "avatar": ""
      }
    ]
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 6. Chi tiết người dùng

**Chức năng:** Chi tiết người dùng.
**Method / endpoint:** `GET /api/users/{id}`.
**Quyền:** ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/users/{{managedUserId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 102,
    "name": "Tài khoản quản lý Postman",
    "email": "managed-postman@example.com",
    "phone": "0901234567",
    "birthday": "2000-01-15",
    "gender": true,
    "role": "USER",
    "avatar": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 7. Cập nhật người dùng

**Chức năng:** Cập nhật người dùng.
**Method / endpoint:** `PUT /api/users/{id}`.
**Quyền:** ADMIN.

Gửi đủ name, email, phone, birthday, gender, role. Không cập nhật mật khẩu qua API này.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| name | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| email | JSON body | string | Có | Email hợp lệ, tối đa 255 ký tự; chuẩn hóa chữ thường, không trùng tài khoản khác. |
| phone | JSON body | string | Có | Chuỗi không trống, tối đa 30 ký tự. |
| birthday | JSON body | string | Có | Ngày hợp lệ dạng YYYY-MM-DD. |
| gender | JSON body | boolean | Có | Boolean true/false, không dùng chuỗi. |
| role | JSON body | string | Không | USER hoặc ADMIN; mặc định USER. Đăng ký công khai luôn tạo USER. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 409: Địa chỉ email đã được sử dụng. Vui lòng chọn email khác.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/users/{{managedUserId}}
```

**Body mẫu Postman:**

```json
{
  "name": "Tài khoản Postman đã sửa",
  "email": "managed-{{runId}}@example.com",
  "phone": "0901234567",
  "birthday": "2000-01-15",
  "gender": true,
  "role": "USER"
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 102,
    "name": "Tài khoản Postman đã sửa",
    "email": "managed-postman@example.com",
    "phone": "0901234567",
    "birthday": "2000-01-15",
    "gender": true,
    "role": "USER",
    "avatar": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 8. Tìm người dùng theo tên

**Chức năng:** Tìm người dùng theo tên.
**Method / endpoint:** `GET /api/users/search/{TenNguoiDung}`.
**Quyền:** ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| TenNguoiDung | path | string | Có | Tên cần tìm, truyền trong đường dẫn. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/users/search/{{searchName}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 101,
      "name": "Người dùng Postman",
      "email": "user-postman@example.com",
      "phone": "0901234567",
      "birthday": "2000-01-15",
      "gender": true,
      "role": "USER",
      "avatar": ""
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 9. Tải ảnh đại diện

**Chức năng:** Tải ảnh đại diện.
**Method / endpoint:** `POST /api/users/upload-avatar`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

Cập nhật avatar của tài khoản trong token; không nhận mã người dùng.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

**Content-Type:** multipart/form-data, để Postman tự tạo boundary. Chọn file thật ở Body → form-data → formFile. Không điền đường dẫn ảnh vào JSON.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| formFile | formData | file | Có | Một ảnh PNG/JPEG/WebP, tối đa 5 MB; kiểm tra kiểu MIME và chữ ký file. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 400: Vui lòng chọn ảnh trong trường formFile.
- HTTP 400: Dung lượng ảnh không được vượt quá 5 MB.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/users/upload-avatar
```

**Body:** form-data, `formFile` loại File, chọn ảnh từ máy.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 101,
    "name": "Người dùng Postman",
    "email": "user-postman@example.com",
    "phone": "0901234567",
    "birthday": "2000-01-15",
    "gender": true,
    "role": "USER",
    "avatar": "/uploads/anh-mau.png"
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 401,
  "message": "Vui lòng đăng nhập.",
  "content": null
}
```

## 10. Xóa người dùng test quản trị

**Chức năng:** Xóa người dùng test quản trị.
**Method / endpoint:** `DELETE /api/users`.
**Quyền:** ADMIN.

id truyền trong query. Chỉ xóa tài khoản test do request Tạo người dùng tạo ra. Không dùng ID ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | query | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 409: Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/users?id={{managedUserId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 102,
    "name": "Tài khoản quản lý Postman",
    "email": "managed-postman@example.com",
    "phone": "0901234567",
    "birthday": "2000-01-15",
    "gender": true,
    "role": "USER",
    "avatar": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 11. Tạo vị trí

**Chức năng:** Tạo vị trí.
**Method / endpoint:** `POST /api/vi-tri`.
**Quyền:** ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| tenViTri | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| tinhThanh | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| quocGia | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| hinhAnh | JSON body | string | Không | Chuỗi tối đa 500 ký tự; có thể để rỗng, dùng URL ảnh hoặc API upload riêng. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/vi-tri
```

**Body mẫu Postman:**

```json
{
  "tenViTri": "Vị trí Postman",
  "tinhThanh": "Hồ Chí Minh",
  "quocGia": "Việt Nam",
  "hinhAnh": ""
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 201,
    "tenViTri": "Vị trí Postman",
    "tinhThanh": "Hồ Chí Minh",
    "quocGia": "Việt Nam",
    "hinhAnh": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 12. Danh sách vị trí

**Chức năng:** Danh sách vị trí.
**Method / endpoint:** `GET /api/vi-tri`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/vi-tri
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 201,
      "tenViTri": "Vị trí Postman",
      "tinhThanh": "Hồ Chí Minh",
      "quocGia": "Việt Nam",
      "hinhAnh": ""
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 500,
  "message": "Lỗi hệ thống.",
  "content": null
}
```

## 13. Phân trang và tìm vị trí

**Chức năng:** Phân trang và tìm vị trí.
**Method / endpoint:** `GET /api/vi-tri/phan-trang-tim-kiem`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| pageIndex | query | integer | Không | Số nguyên từ 1 đến 1000000; mặc định 1. |
| pageSize | query | integer | Không | Số nguyên từ 1 đến 100; mặc định 10. |
| keyword | query | string | Không | Chuỗi tối đa 255 ký tự; mặc định rỗng, lọc theo tên. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/vi-tri/phan-trang-tim-kiem?pageIndex=1&pageSize=10&keyword=Postman
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "pageIndex": 1,
    "pageSize": 10,
    "totalRow": 1,
    "totalPages": 1,
    "data": [
      {
        "id": 201,
        "tenViTri": "Vị trí Postman",
        "tinhThanh": "Hồ Chí Minh",
        "quocGia": "Việt Nam",
        "hinhAnh": ""
      }
    ]
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 14. Chi tiết vị trí

**Chức năng:** Chi tiết vị trí.
**Method / endpoint:** `GET /api/vi-tri/{id}`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/vi-tri/{{locationId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 201,
    "tenViTri": "Vị trí Postman",
    "tinhThanh": "Hồ Chí Minh",
    "quocGia": "Việt Nam",
    "hinhAnh": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 15. Cập nhật vị trí

**Chức năng:** Cập nhật vị trí.
**Method / endpoint:** `PUT /api/vi-tri/{id}`.
**Quyền:** ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| tenViTri | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| tinhThanh | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| quocGia | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| hinhAnh | JSON body | string | Không | Chuỗi tối đa 500 ký tự; có thể để rỗng, dùng URL ảnh hoặc API upload riêng. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/vi-tri/{{locationId}}
```

**Body mẫu Postman:**

```json
{
  "tenViTri": "Vị trí Postman",
  "tinhThanh": "Hà Nội",
  "quocGia": "Việt Nam",
  "hinhAnh": ""
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 201,
    "tenViTri": "Vị trí Postman",
    "tinhThanh": "Hà Nội",
    "quocGia": "Việt Nam",
    "hinhAnh": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 16. Tải hình vị trí

**Chức năng:** Tải hình vị trí.
**Method / endpoint:** `POST /api/vi-tri/upload-hinh-vitri`.
**Quyền:** ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

**Content-Type:** multipart/form-data, để Postman tự tạo boundary. Chọn file thật ở Body → form-data → formFile. Không điền đường dẫn ảnh vào JSON.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| maViTri | query | string | Có | Số nguyên dương, vị trí phải tồn tại. |
| formFile | formData | file | Có | Một ảnh PNG/JPEG/WebP, tối đa 5 MB; kiểm tra kiểu MIME và chữ ký file. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 400: Vui lòng chọn ảnh trong trường formFile.
- HTTP 400: Dung lượng ảnh không được vượt quá 5 MB.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/vi-tri/upload-hinh-vitri?maViTri={{locationId}}
```

**Body:** form-data, `formFile` loại File, chọn ảnh từ máy.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 201,
    "tenViTri": "Vị trí Postman",
    "tinhThanh": "Hồ Chí Minh",
    "quocGia": "Việt Nam",
    "hinhAnh": "/uploads/anh-mau.png"
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 17. Xóa vị trí

**Chức năng:** Xóa vị trí.
**Method / endpoint:** `DELETE /api/vi-tri/{id}`.
**Quyền:** ADMIN.

Thực hiện cuối cùng sau khi đã xóa các phòng thuộc vị trí; nếu còn phòng trả 409.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 409: Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/vi-tri/{{locationId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 201,
    "tenViTri": "Vị trí Postman",
    "tinhThanh": "Hồ Chí Minh",
    "quocGia": "Việt Nam",
    "hinhAnh": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 18. Tạo phòng

**Chức năng:** Tạo phòng.
**Method / endpoint:** `POST /api/phong-thue`.
**Quyền:** ADMIN.

Phải tạo vị trí trước. maViTri là số nguyên, tự lấy từ locationId; không phải ID phòng.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| tenPhong | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| khach | JSON body | integer | Có | Số nguyên từ 1; không được giảm dưới số khách của đặt phòng hiện có. |
| phongNgu | JSON body | integer | Có | Số nguyên từ 0 đến 2147483647. |
| giuong | JSON body | integer | Có | Số nguyên từ 0 đến 2147483647. |
| phongTam | JSON body | integer | Có | Số nguyên từ 0 đến 2147483647. |
| moTa | JSON body | string | Có | Chuỗi không trống, tối đa 10000 ký tự. |
| giaTien | JSON body | integer | Có | Số nguyên từ 0 đến 2147483647. |
| mayGiat | JSON body | boolean | Có | Boolean true/false. |
| banLa | JSON body | boolean | Có | Boolean true/false. |
| tivi | JSON body | boolean | Có | Boolean true/false. |
| dieuHoa | JSON body | boolean | Có | Boolean true/false. |
| wifi | JSON body | boolean | Có | Boolean true/false. |
| bep | JSON body | boolean | Có | Boolean true/false. |
| doXe | JSON body | boolean | Có | Boolean true/false. |
| hoBoi | JSON body | boolean | Có | Boolean true/false. |
| banUi | JSON body | boolean | Có | Boolean true/false. |
| maViTri | JSON body | integer | Có | Số nguyên dương, vị trí phải tồn tại. |
| hinhAnh | JSON body | string | Không | Chuỗi tối đa 500 ký tự; có thể để rỗng, dùng URL ảnh hoặc API upload riêng. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/phong-thue
```

**Body mẫu Postman:**

```json
{
  "tenPhong": "Phòng Postman",
  "khach": 4,
  "phongNgu": 2,
  "giuong": 2,
  "phongTam": 1,
  "moTa": "Phòng kiểm thử Postman",
  "giaTien": 800000,
  "mayGiat": true,
  "banLa": false,
  "tivi": true,
  "dieuHoa": true,
  "wifi": true,
  "bep": true,
  "doXe": true,
  "hoBoi": false,
  "banUi": false,
  "maViTri": {{locationId}},
  "hinhAnh": ""
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 301,
    "tenPhong": "Phòng Postman",
    "khach": 4,
    "phongNgu": 2,
    "giuong": 2,
    "phongTam": 1,
    "moTa": "Phòng kiểm thử Postman",
    "giaTien": 800000,
    "mayGiat": true,
    "banLa": false,
    "tivi": true,
    "dieuHoa": true,
    "wifi": true,
    "bep": true,
    "doXe": true,
    "hoBoi": false,
    "banUi": false,
    "maViTri": 201,
    "hinhAnh": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 19. Danh sách phòng

**Chức năng:** Danh sách phòng.
**Method / endpoint:** `GET /api/phong-thue`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/phong-thue
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 301,
      "tenPhong": "Phòng Postman",
      "khach": 4,
      "phongNgu": 2,
      "giuong": 2,
      "phongTam": 1,
      "moTa": "Phòng kiểm thử Postman",
      "giaTien": 800000,
      "mayGiat": true,
      "banLa": false,
      "tivi": true,
      "dieuHoa": true,
      "wifi": true,
      "bep": true,
      "doXe": true,
      "hoBoi": false,
      "banUi": false,
      "maViTri": 201,
      "hinhAnh": ""
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 500,
  "message": "Lỗi hệ thống.",
  "content": null
}
```

## 20. Lấy phòng theo vị trí

**Chức năng:** Lấy phòng theo vị trí.
**Method / endpoint:** `GET /api/phong-thue/lay-phong-theo-vi-tri`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| maViTri | query | string | Có | Số nguyên dương, vị trí phải tồn tại. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/phong-thue/lay-phong-theo-vi-tri?maViTri={{locationId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 301,
      "tenPhong": "Phòng Postman",
      "khach": 4,
      "phongNgu": 2,
      "giuong": 2,
      "phongTam": 1,
      "moTa": "Phòng kiểm thử Postman",
      "giaTien": 800000,
      "mayGiat": true,
      "banLa": false,
      "tivi": true,
      "dieuHoa": true,
      "wifi": true,
      "bep": true,
      "doXe": true,
      "hoBoi": false,
      "banUi": false,
      "maViTri": 201,
      "hinhAnh": ""
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 21. Phân trang và tìm phòng

**Chức năng:** Phân trang và tìm phòng.
**Method / endpoint:** `GET /api/phong-thue/phan-trang-tim-kiem`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| pageIndex | query | integer | Không | Số nguyên từ 1 đến 1000000; mặc định 1. |
| pageSize | query | integer | Không | Số nguyên từ 1 đến 100; mặc định 10. |
| keyword | query | string | Không | Chuỗi tối đa 255 ký tự; mặc định rỗng, lọc theo tên. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/phong-thue/phan-trang-tim-kiem?pageIndex=1&pageSize=10&keyword=Postman
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "pageIndex": 1,
    "pageSize": 10,
    "totalRow": 1,
    "totalPages": 1,
    "data": [
      {
        "id": 301,
        "tenPhong": "Phòng Postman",
        "khach": 4,
        "phongNgu": 2,
        "giuong": 2,
        "phongTam": 1,
        "moTa": "Phòng kiểm thử Postman",
        "giaTien": 800000,
        "mayGiat": true,
        "banLa": false,
        "tivi": true,
        "dieuHoa": true,
        "wifi": true,
        "bep": true,
        "doXe": true,
        "hoBoi": false,
        "banUi": false,
        "maViTri": 201,
        "hinhAnh": ""
      }
    ]
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 22. Chi tiết phòng

**Chức năng:** Chi tiết phòng.
**Method / endpoint:** `GET /api/phong-thue/{id}`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/phong-thue/{{roomId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 301,
    "tenPhong": "Phòng Postman",
    "khach": 4,
    "phongNgu": 2,
    "giuong": 2,
    "phongTam": 1,
    "moTa": "Phòng kiểm thử Postman",
    "giaTien": 800000,
    "mayGiat": true,
    "banLa": false,
    "tivi": true,
    "dieuHoa": true,
    "wifi": true,
    "bep": true,
    "doXe": true,
    "hoBoi": false,
    "banUi": false,
    "maViTri": 201,
    "hinhAnh": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 23. Cập nhật phòng

**Chức năng:** Cập nhật phòng.
**Method / endpoint:** `PUT /api/phong-thue/{id}`.
**Quyền:** ADMIN.

Gửi đầy đủ trường. Không được giảm khach xuống thấp hơn soLuongKhach của đặt phòng đang lưu.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| tenPhong | JSON body | string | Có | Chuỗi không trống, tối đa 255 ký tự. |
| khach | JSON body | integer | Có | Số nguyên từ 1; không được giảm dưới số khách của đặt phòng hiện có. |
| phongNgu | JSON body | integer | Có | Số nguyên từ 0 đến 2147483647. |
| giuong | JSON body | integer | Có | Số nguyên từ 0 đến 2147483647. |
| phongTam | JSON body | integer | Có | Số nguyên từ 0 đến 2147483647. |
| moTa | JSON body | string | Có | Chuỗi không trống, tối đa 10000 ký tự. |
| giaTien | JSON body | integer | Có | Số nguyên từ 0 đến 2147483647. |
| mayGiat | JSON body | boolean | Có | Boolean true/false. |
| banLa | JSON body | boolean | Có | Boolean true/false. |
| tivi | JSON body | boolean | Có | Boolean true/false. |
| dieuHoa | JSON body | boolean | Có | Boolean true/false. |
| wifi | JSON body | boolean | Có | Boolean true/false. |
| bep | JSON body | boolean | Có | Boolean true/false. |
| doXe | JSON body | boolean | Có | Boolean true/false. |
| hoBoi | JSON body | boolean | Có | Boolean true/false. |
| banUi | JSON body | boolean | Có | Boolean true/false. |
| maViTri | JSON body | integer | Có | Số nguyên dương, vị trí phải tồn tại. |
| hinhAnh | JSON body | string | Không | Chuỗi tối đa 500 ký tự; có thể để rỗng, dùng URL ảnh hoặc API upload riêng. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 409: Sức chứa mới nhỏ hơn số khách của đặt phòng hiện có.
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/phong-thue/{{roomId}}
```

**Body mẫu Postman:**

```json
{
  "tenPhong": "Phòng Postman",
  "khach": 4,
  "phongNgu": 2,
  "giuong": 2,
  "phongTam": 1,
  "moTa": "Phòng kiểm thử Postman",
  "giaTien": 900000,
  "mayGiat": true,
  "banLa": false,
  "tivi": true,
  "dieuHoa": true,
  "wifi": true,
  "bep": true,
  "doXe": true,
  "hoBoi": false,
  "banUi": false,
  "maViTri": {{locationId}},
  "hinhAnh": ""
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 301,
    "tenPhong": "Phòng Postman",
    "khach": 4,
    "phongNgu": 2,
    "giuong": 2,
    "phongTam": 1,
    "moTa": "Phòng kiểm thử Postman",
    "giaTien": 900000,
    "mayGiat": true,
    "banLa": false,
    "tivi": true,
    "dieuHoa": true,
    "wifi": true,
    "bep": true,
    "doXe": true,
    "hoBoi": false,
    "banUi": false,
    "maViTri": 201,
    "hinhAnh": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 409,
  "message": "Sức chứa mới nhỏ hơn số khách của đặt phòng hiện có.",
  "content": null
}
```

## 24. Tải hình phòng

**Chức năng:** Tải hình phòng.
**Method / endpoint:** `POST /api/phong-thue/upload-hinh-phong`.
**Quyền:** ADMIN.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

**Content-Type:** multipart/form-data, để Postman tự tạo boundary. Chọn file thật ở Body → form-data → formFile. Không điền đường dẫn ảnh vào JSON.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| maPhong | query | string | Có | Số nguyên dương, phòng phải tồn tại. |
| formFile | formData | file | Có | Một ảnh PNG/JPEG/WebP, tối đa 5 MB; kiểm tra kiểu MIME và chữ ký file. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 400: Vui lòng chọn ảnh trong trường formFile.
- HTTP 400: Dung lượng ảnh không được vượt quá 5 MB.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/phong-thue/upload-hinh-phong?maPhong={{roomId}}
```

**Body:** form-data, `formFile` loại File, chọn ảnh từ máy.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 301,
    "tenPhong": "Phòng Postman",
    "khach": 4,
    "phongNgu": 2,
    "giuong": 2,
    "phongTam": 1,
    "moTa": "Phòng kiểm thử Postman",
    "giaTien": 800000,
    "mayGiat": true,
    "banLa": false,
    "tivi": true,
    "dieuHoa": true,
    "wifi": true,
    "bep": true,
    "doXe": true,
    "hoBoi": false,
    "banUi": false,
    "maViTri": 201,
    "hinhAnh": "/uploads/anh-mau.png"
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 25. Xóa phòng

**Chức năng:** Xóa phòng.
**Method / endpoint:** `DELETE /api/phong-thue/{id}`.
**Quyền:** ADMIN.

Xóa bình luận và đặt phòng liên quan trước. Nếu còn dữ liệu phụ thuộc trả 409.

**Header:** `token: {{adminToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Chỉ quản trị viên được phép thao tác.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 409: Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/phong-thue/{{roomId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 301,
    "tenPhong": "Phòng Postman",
    "khach": 4,
    "phongNgu": 2,
    "giuong": 2,
    "phongTam": 1,
    "moTa": "Phòng kiểm thử Postman",
    "giaTien": 800000,
    "mayGiat": true,
    "banLa": false,
    "tivi": true,
    "dieuHoa": true,
    "wifi": true,
    "bep": true,
    "doXe": true,
    "hoBoi": false,
    "banUi": false,
    "maViTri": 201,
    "hinhAnh": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 26. Tạo đặt phòng

**Chức năng:** Tạo đặt phòng.
**Method / endpoint:** `POST /api/dat-phong`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

USER chỉ được gửi maNguoiDung trùng ID của chính mình. ADMIN được đặt thay. Ngày đi phải sau ngày đến, lịch không trùng, số khách không vượt sức chứa.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| maPhong | JSON body | integer | Có | Số nguyên dương, phòng phải tồn tại. |
| ngayDen | JSON body | string | Có | Ngày giờ ISO 8601 có múi giờ; phải trước ngày đi. |
| ngayDi | JSON body | string | Có | Ngày giờ ISO 8601 có múi giờ; phải sau ngày đến. |
| soLuongKhach | JSON body | integer | Có | Số nguyên từ 1, không vượt sức chứa phòng. |
| maNguoiDung | JSON body | integer | Có | Số nguyên dương, người dùng phải tồn tại và phù hợp quyền sở hữu. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Số khách vượt sức chứa của phòng.
- HTTP 409: Phòng đã được đặt trong khoảng thời gian này.
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/dat-phong
```

**Body mẫu Postman:**

```json
{
  "maPhong": {{roomId}},
  "ngayDen": "2030-12-01T14:00:00+07:00",
  "ngayDi": "2030-12-03T12:00:00+07:00",
  "soLuongKhach": 2,
  "maNguoiDung": {{userId}}
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 401,
    "maPhong": 301,
    "ngayDen": "2030-12-01T07:00:00.000Z",
    "ngayDi": "2030-12-03T05:00:00.000Z",
    "soLuongKhach": 2,
    "maNguoiDung": 101
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Số khách vượt sức chứa của phòng.",
  "content": null
}
```

## 27. Danh sách đặt phòng

**Chức năng:** Danh sách đặt phòng.
**Method / endpoint:** `GET /api/dat-phong`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

USER chỉ thấy đặt phòng của mình. Đổi token sang adminToken nếu muốn xem toàn bộ.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/dat-phong
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 401,
      "maPhong": 301,
      "ngayDen": "2030-12-01T07:00:00.000Z",
      "ngayDi": "2030-12-03T05:00:00.000Z",
      "soLuongKhach": 2,
      "maNguoiDung": 101
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 401,
  "message": "Vui lòng đăng nhập.",
  "content": null
}
```

## 28. Chi tiết đặt phòng

**Chức năng:** Chi tiết đặt phòng.
**Method / endpoint:** `GET /api/dat-phong/{id}`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/dat-phong/{{bookingId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 401,
    "maPhong": 301,
    "ngayDen": "2030-12-01T07:00:00.000Z",
    "ngayDi": "2030-12-03T05:00:00.000Z",
    "soLuongKhach": 2,
    "maNguoiDung": 101
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 29. Cập nhật đặt phòng

**Chức năng:** Cập nhật đặt phòng.
**Method / endpoint:** `PUT /api/dat-phong/{id}`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

Chủ đặt phòng hoặc ADMIN. Không được mạo danh người đặt khác. Kiểm tra lại lịch và sức chứa khi cập nhật.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| maPhong | JSON body | integer | Có | Số nguyên dương, phòng phải tồn tại. |
| ngayDen | JSON body | string | Có | Ngày giờ ISO 8601 có múi giờ; phải trước ngày đi. |
| ngayDi | JSON body | string | Có | Ngày giờ ISO 8601 có múi giờ; phải sau ngày đến. |
| soLuongKhach | JSON body | integer | Có | Số nguyên từ 1, không vượt sức chứa phòng. |
| maNguoiDung | JSON body | integer | Có | Số nguyên dương, người dùng phải tồn tại và phù hợp quyền sở hữu. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/dat-phong/{{bookingId}}
```

**Body mẫu Postman:**

```json
{
  "maPhong": {{roomId}},
  "ngayDen": "2030-12-01T14:00:00+07:00",
  "ngayDi": "2030-12-03T12:00:00+07:00",
  "soLuongKhach": 3,
  "maNguoiDung": {{userId}}
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 401,
    "maPhong": 301,
    "ngayDen": "2030-12-01T14:00:00+07:00",
    "ngayDi": "2030-12-03T12:00:00+07:00",
    "soLuongKhach": 3,
    "maNguoiDung": 101
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 30. Lấy đặt phòng theo người dùng

**Chức năng:** Lấy đặt phòng theo người dùng.
**Method / endpoint:** `GET /api/dat-phong/lay-theo-nguoi-dung/{MaNguoiDung}`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

USER chỉ xem được mã người dùng của mình; ADMIN được xem người khác.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| MaNguoiDung | path | string | Có | Mã định danh số nguyên dương; bản ghi liên quan phải tồn tại. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/dat-phong/lay-theo-nguoi-dung/{{userId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 401,
      "maPhong": 301,
      "ngayDen": "2030-12-01T07:00:00.000Z",
      "ngayDi": "2030-12-03T05:00:00.000Z",
      "soLuongKhach": 2,
      "maNguoiDung": 101
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 31. Xóa đặt phòng

**Chức năng:** Xóa đặt phòng.
**Method / endpoint:** `DELETE /api/dat-phong/{id}`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

Chủ đặt phòng hoặc ADMIN. Xóa xong không thể xem/cập nhật ID này, trừ khi tạo bản ghi mới với ID mới.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 409: Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/dat-phong/{{bookingId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 401,
    "maPhong": 301,
    "ngayDen": "2030-12-01T07:00:00.000Z",
    "ngayDi": "2030-12-03T05:00:00.000Z",
    "soLuongKhach": 2,
    "maNguoiDung": 101
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 32. Tạo bình luận

**Chức năng:** Tạo bình luận.
**Method / endpoint:** `POST /api/binh-luan`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

maNguoiBinhLuan phải là ID của USER trong token; ADMIN có thể thao tác thay. Số sao nguyên từ 1 đến 5.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| maPhong | JSON body | integer | Có | Số nguyên dương, phòng phải tồn tại. |
| maNguoiBinhLuan | JSON body | integer | Có | Số nguyên dương, người bình luận phải tồn tại và phù hợp quyền sở hữu. |
| ngayBinhLuan | JSON body | string | Có | Ngày giờ ISO 8601 có múi giờ. |
| noiDung | JSON body | string | Có | Chuỗi không trống sau khi bỏ khoảng trắng đầu/cuối, tối đa 10000 ký tự. |
| saoBinhLuan | JSON body | integer | Có | Số nguyên từ 1 đến 5. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Số sao bình luận phải nhỏ hơn hoặc bằng 5.
- HTTP 400: Nội dung bình luận không được để trống.
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/binh-luan
```

**Body mẫu Postman:**

```json
{
  "maPhong": {{roomId}},
  "maNguoiBinhLuan": {{userId}},
  "ngayBinhLuan": "2030-12-03T15:00:00+07:00",
  "noiDung": "Phòng sạch sẽ, đầy đủ tiện nghi",
  "saoBinhLuan": 5
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 501,
    "maPhong": 301,
    "maNguoiBinhLuan": 101,
    "ngayBinhLuan": "2030-12-03T08:00:00.000Z",
    "noiDung": "Phòng sạch sẽ, đầy đủ tiện nghi",
    "saoBinhLuan": 5,
    "tenNguoiBinhLuan": "Người dùng Postman",
    "avatar": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Số sao bình luận phải nhỏ hơn hoặc bằng 5.",
  "content": null
}
```

## 33. Danh sách bình luận

**Chức năng:** Danh sách bình luận.
**Method / endpoint:** `GET /api/binh-luan`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/binh-luan
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 501,
      "maPhong": 301,
      "maNguoiBinhLuan": 101,
      "ngayBinhLuan": "2030-12-03T08:00:00.000Z",
      "noiDung": "Phòng sạch sẽ, đầy đủ tiện nghi",
      "saoBinhLuan": 5,
      "tenNguoiBinhLuan": "Người dùng Postman",
      "avatar": ""
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 500,
  "message": "Lỗi hệ thống.",
  "content": null
}
```

## 34. Bình luận theo phòng

**Chức năng:** Bình luận theo phòng.
**Method / endpoint:** `GET /api/binh-luan/lay-binh-luan-theo-phong/{MaPhong}`.
**Quyền:** Công khai.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| MaPhong | path | string | Có | Mã định danh số nguyên dương; bản ghi liên quan phải tồn tại. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/binh-luan/lay-binh-luan-theo-phong/{{roomId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": [
    {
      "id": 501,
      "maPhong": 301,
      "maNguoiBinhLuan": 101,
      "ngayBinhLuan": "2030-12-03T08:00:00.000Z",
      "noiDung": "Phòng sạch sẽ, đầy đủ tiện nghi",
      "saoBinhLuan": 5,
      "tenNguoiBinhLuan": "Người dùng Postman",
      "avatar": ""
    }
  ]
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 35. Cập nhật bình luận

**Chức năng:** Cập nhật bình luận.
**Method / endpoint:** `PUT /api/binh-luan/{id}`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

Chủ bình luận hoặc ADMIN. Gửi đầy đủ các trường của bình luận.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

**Content-Type:** application/json. PUT cần đầy đủ các trường nghiệp vụ.

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| id | JSON body | integer | Không | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |
| maPhong | JSON body | integer | Có | Số nguyên dương, phòng phải tồn tại. |
| maNguoiBinhLuan | JSON body | integer | Có | Số nguyên dương, người bình luận phải tồn tại và phù hợp quyền sở hữu. |
| ngayBinhLuan | JSON body | string | Có | Ngày giờ ISO 8601 có múi giờ. |
| noiDung | JSON body | string | Có | Chuỗi không trống sau khi bỏ khoảng trắng đầu/cuối, tối đa 10000 ký tự. |
| saoBinhLuan | JSON body | integer | Có | Số nguyên từ 1 đến 5. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/binh-luan/{{commentId}}
```

**Body mẫu Postman:**

```json
{
  "maPhong": {{roomId}},
  "maNguoiBinhLuan": {{userId}},
  "ngayBinhLuan": "2030-12-03T15:00:00+07:00",
  "noiDung": "Đánh giá đã cập nhật",
  "saoBinhLuan": 4
}
```

Các biến số không đặt trong dấu ngoặc kép; JSON này được Postman thay biến trước khi gửi.

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 501,
    "maPhong": 301,
    "maNguoiBinhLuan": 101,
    "ngayBinhLuan": "2030-12-03T15:00:00+07:00",
    "noiDung": "Đánh giá đã cập nhật",
    "saoBinhLuan": 4,
    "tenNguoiBinhLuan": "Người dùng Postman",
    "avatar": ""
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```

## 36. Xóa bình luận

**Chức năng:** Xóa bình luận.
**Method / endpoint:** `DELETE /api/binh-luan/{id}`.
**Quyền:** Đã đăng nhập; chủ dữ liệu hoặc ADMIN. Request mẫu dùng token USER.

Chủ bình luận hoặc ADMIN. Response xóa là bản ghi bình luận, không kèm tên và avatar người bình luận.

**Header:** `token: {{userToken}}` (tự cấu hình sẵn).

| Trường | Vị trí | Kiểu | Bắt buộc | Điều kiện |
| --- | --- | --- | --- | --- |
| id | path | integer | Có | Không gửi khi tạo; ID trong path được dùng khi sửa. Không cho đổi khóa chính qua body. |

**Thành công:** HTTP 200, JSON `{ statusCode, message, content }`. Dữ liệu trong `content`; không trả mật khẩu/hash. Xem Examples để biết cấu trúc cụ thể.

**Lỗi:**
- HTTP 400: Dữ liệu không hợp lệ.
- HTTP 401: Vui lòng đăng nhập.
- HTTP 403: Bạn không có quyền thao tác dữ liệu này.
- HTTP 404: Không tìm thấy dữ liệu.
- HTTP 409: Dữ liệu liên kết không hợp lệ hoặc đang được sử dụng.
- HTTP 500: Lỗi hệ thống.

Các response trong Examples là dữ liệu minh họa hợp đồng API, không phải bằng chứng đã deploy. ID minh họa không được dùng thay cho ID thực tế. Nhiều lỗi validation được nối bằng dấu chấm phẩy.

**URL mẫu:**

```text
{{baseUrl}}/api/binh-luan/{{commentId}}
```

**Response thành công minh họa:**

```json
{
  "statusCode": 200,
  "message": "Thành công",
  "content": {
    "id": 501,
    "maPhong": 301,
    "maNguoiBinhLuan": 101,
    "ngayBinhLuan": "2030-12-03T08:00:00.000Z",
    "noiDung": "Phòng sạch sẽ, đầy đủ tiện nghi",
    "saoBinhLuan": 5
  }
}
```

**Response lỗi minh họa:**

```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ.",
  "content": null
}
```
