# Backend Airbnb — Node.js BC95

Backend Express theo cấu trúc dự án mẫu: `routers → controllers → services → Prisma → MySQL`. Bao gồm 36 API theo Swagger chính thức; không yêu cầu token CyberSoft. Chưa deploy.

## Yêu cầu

- Node.js 22.12+ hoặc Node.js 24 và npm.
- Docker Desktop đang chạy, cổng `3308` còn trống.

## Chạy dự án

Thực hiện trong thư mục `backend_airbnb`:

```powershell
npm.cmd install
Copy-Item .env.example .env
# Điền các giá trị trong .env trước khi chạy các lệnh tiếp theo.
docker compose up -d --wait
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Nếu `.env` đã được tạo sẵn trên máy, giữ lại file hiện có. Mật khẩu local và JWT secret đã được tạo ngẫu nhiên; đọc trực tiếp trong `.env` khi cần đăng nhập. Không commit file này.

Các biến cần cấu hình:

| Biến                                             | Ý nghĩa                                                   |
| ------------------------------------------------ | --------------------------------------------------------- |
| `PORT`                                           | Cổng backend, mặc định `3001`                             |
| `MYSQL_PORT`                                     | Cổng MySQL trên máy, mặc định `3308`                      |
| `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` | Database và tài khoản ứng dụng                            |
| `MYSQL_ROOT_PASSWORD`                            | Mật khẩu root cho container mới                           |
| `DATABASE_URL`                                   | URL MySQL, phải khớp user/password/port/database bên trên |
| `JWT_SECRET`                                     | Chuỗi ngẫu nhiên tối thiểu 32 ký tự                       |
| `JWT_EXPIRES_IN`                                 | Thời hạn JWT, ví dụ `1d`                                  |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`        | Tài khoản ADMIN được tạo bởi seed                         |

Các biến khởi tạo MySQL chỉ áp dụng khi volume mới được tạo. Nếu đã có volume, sửa `.env` không tự đổi tài khoản bên trong MySQL.

- API: http://localhost:3001/api
- Swagger UI: http://localhost:3001/swagger
- Swagger JSON của backend: http://localhost:3001/swagger.json
- `swagger-reference.json`: bản gốc tải từ https://airbnbnew.cybersoft.edu.vn/swagger/v1/swagger.json để đối chiếu, không sửa trực tiếp.

## Đăng nhập và phân quyền

Đăng nhập qua `POST /api/auth/signin` với `email` và `password`. JWT nằm trong `content.token`. Nhập JWT vào **Authorize** trên Swagger, hoặc gửi header `token: <JWT>` / `Authorization: Bearer <JWT>`.

| Nhóm                                                 | Quyền                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Đăng ký, đăng nhập                                   | Công khai; đăng ký luôn tạo USER kể cả khi gửi role ADMIN                        |
| Đọc phòng và vị trí                                  | Công khai                                                                        |
| Thêm/sửa/xóa phòng, vị trí và upload ảnh tương ứng   | ADMIN                                                                            |
| Quản lý người dùng, tìm kiếm, xem danh sách/chi tiết | ADMIN                                                                            |
| Upload avatar                                        | Người dùng đã đăng nhập, cập nhật avatar của chính mình                          |
| Đọc danh sách bình luận, bình luận theo phòng        | Công khai                                                                        |
| Thêm/sửa/xóa bình luận                               | Chủ bình luận hoặc ADMIN; USER không được mạo danh người khác                    |
| Đặt phòng                                            | Đã đăng nhập; USER chỉ đọc và thao tác đặt phòng của mình; ADMIN quản lý toàn bộ |

Token được kiểm tra với tài khoản và vai trò hiện tại trong database; xóa tài khoản sẽ làm token đó không còn dùng được.

## Hợp đồng dữ liệu và nghiệp vụ

- Tên JSON và tham số theo Swagger, ví dụ `maViTri`, `maNguoiDung`, `maNguoiBinhLuan`.
- Response thống nhất: `{ "statusCode": 200, "message": "Thành công", "content": ... }`. Mật khẩu và hash không xuất hiện trong response.
- Swagger gốc không mô tả schema response; định dạng trên là quy ước của backend này.
- `PUT` nhận đủ các trường nghiệp vụ như mẫu Swagger. `id` trong URL là định danh dùng để cập nhật; `id` trong body không được dùng để thay khóa chính.
- Ngày sinh dùng `YYYY-MM-DD`. Ngày đến, ngày đi và ngày bình luận dùng ISO 8601 có múi giờ, ví dụ `2030-12-01T14:00:00+07:00`; xử lý và lưu theo UTC.
- Ngày đi phải sau ngày đến; số khách là số nguyên dương không vượt sức chứa; số sao từ 1 đến 5.
- Khoảng đặt phòng là `[ngayDen, ngayDi)`: một đặt phòng có thể bắt đầu đúng thời điểm đặt phòng trước kết thúc.
- Khóa phòng trong transaction khi kiểm tra lịch để tránh đặt trùng khi có yêu cầu đồng thời.
- Không được giảm sức chứa xuống dưới số khách của đặt phòng đang lưu.
- Khóa ngoại chặn xóa người dùng/phòng/vị trí đang có dữ liệu liên quan. Xóa dữ liệu phụ thuộc trước nếu cần.
- Phân trang: `pageIndex` bắt đầu từ 1, `pageSize` từ 1 đến 100; `keyword` lọc theo tên. Trả `{ pageIndex, pageSize, totalRow, totalPages, data }`.
- `DELETE /api/users` nhận `id` trong query, không phải path.
- Upload vị trí dùng đúng đường dẫn Swagger: `/api/vi-tri/upload-hinh-vitri`.

## Database

5 bảng: `NguoiDung`, `ViTri`, `Phong`, `DatPhong`, `BinhLuan`. Prisma ánh xạ trường camelCase sang cột snake_case phù hợp mô hình.

Theo chỉ dẫn ưu tiên Swagger, các khác biệt với diagram đã được xử lý:

- `Phong.ma_vi_tri` liên kết phòng với vị trí; không thêm người sở hữu phòng vì Swagger không có.
- `BinhLuan.ma_phong` thay `ma_cong_viec`.
- `ViTri.quoc_gia` là chuỗi; `NguoiDung.gender` là boolean.
- Giữ cả `ban_la` và `ban_ui` vì Swagger có cả hai.
- Thêm `NguoiDung.avatar` để lưu kết quả API upload avatar.
- `DatPhong.ma_nguoi_dat` được ánh xạ sang trường API `maNguoiDung`.

Migration trong `prisma/migrations` có thể tạo lại schema bằng `npm.cmd run db:migrate`. Seed chạy lặp không ghi đè tài khoản/dữ liệu đã tồn tại; tạo một ADMIN, một vị trí và một phòng mẫu. Đổi `SEED_ADMIN_PASSWORD` không tự đổi mật khẩu tài khoản đã seed.

## Upload ảnh local

Gửi `multipart/form-data`, tên trường file là `formFile`. Ảnh PNG/JPEG/WebP tối đa 5 MB; kiểm tra MIME và chữ ký file. File được đặt tên UUID trong `uploads`; API trả đường dẫn tương đối `/uploads/...`, ghép với origin backend để hiển thị.

Ảnh cũ được giữ khi upload thay thế hoặc xóa bản ghi để tránh xóa file còn được tham chiếu. Có thể dọn thủ công các ảnh không còn được sử dụng khi cần. Folder ảnh không được đưa vào Git; cần sao lưu riêng nếu chuyển máy.

## Kiểm thử

Sau khi MySQL đã chạy, migration và seed xong:

```powershell
npm.cmd test
```

Bộ kiểm thử tích hợp gọi đủ 36 API trên MySQL thật; kiểm tra CRUD, quyền, dữ liệu sai, tìm kiếm/phân trang, upload, quan hệ và đặt trùng lịch đồng thời. Dữ liệu test được tạo với mã ngẫu nhiên, chỉ dọn bản ghi của lần chạy đó và file ảnh do test tạo. Chạy trên database local dùng cho phát triển; không chạy trên dữ liệu production.

## Tổ chức source

```text
prisma/                  Schema, migration và seed
src/common/constants/    Cấu hình môi trường
src/common/helpers/      Response, lỗi và kiểm tra quyền sở hữu
src/common/middlewares/  Xác thực, phân quyền, xử lý lỗi
src/common/multer/       Upload ảnh
src/common/prisma/       Kết nối Prisma
src/common/swagger/      Swagger của backend
src/common/validators/   Kiểm tra input
src/controllers/         Nhận request và trả response
src/routers/             Đường dẫn và middleware theo nhóm
src/services/            Nghiệp vụ và truy cập database
test/                    Kiểm thử tích hợp HTTP
uploads/                 File ảnh local
server.js                Khởi động HTTP server
```

Prisma schema đóng vai trò mô hình dữ liệu; không tạo thêm model trùng với Prisma. Cách cấu hình adapter MySQL tham khảo [tài liệu Prisma](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/mysql).

## GitHub, quản lý task và deploy

- Chưa push GitHub khi chưa có repository đích; không đưa `.env`, `node_modules` hoặc ảnh upload vào Git.
- Theo dõi tiến độ tại `TASKS.csv` (mở bằng Excel) và `../huonglam.md`.
- Deploy thực hiện sau khi hoàn tất và kiểm thử, theo thống nhất của người dùng.
