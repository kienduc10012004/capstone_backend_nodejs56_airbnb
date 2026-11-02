# HƯỚNG DẪN SỬ DỤNG BỘ ĐẶC TẢ API AIRBNB

## 1. Các file bàn giao

| File                              | Mục đích                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `Airbnb.postman_collection.json`  | Collection v2.1 gồm 36 API, 6 nhóm, mô tả, tham số, request/response mẫu và script kiểm tra |
| `Airbnb.postman_environment.json` | Environment mẫu để cấu hình local hoặc URL deploy                                           |
| `DAC_TA_API.md`                   | Đặc tả đầy đủ để đọc ngoài Postman; có thể mở và sao chép vào Word nếu cần                  |
| `HUONG_DAN_POSTMAN.md`            | Hướng dẫn import, xác thực và thực hiện các request                                         |

Đây là bộ đặc tả bằng Postman đáp ứng phần tài liệu API. Backend chưa deploy; bộ tài liệu không thay cho yêu cầu deploy khi nộp bài.

## 2. Chuẩn bị backend

Mở Docker Desktop. Trong terminal tại `backend_airbnb`, chạy:

```powershell
docker compose up -d --wait
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

Giữ terminal backend hoạt động. Nếu vừa clone source, cài thư viện và cấu hình `.env` theo README trước.

## 3. Import vào Postman

1. Mở Postman Desktop, chọn workspace làm việc.
2. Chọn **Import**, chọn `Airbnb.postman_collection.json` và `Airbnb.postman_environment.json`.
3. Trong Collections, mở **BC95 — Đặc tả 36 API Airbnb**; có 6 thư mục.
4. Chọn Environment **Airbnb — Mẫu Local hoặc Deploy** ở bộ chọn môi trường.
5. Trong Environments, cấu hình các giá trị dùng cho lần chạy ở môi trường của bạn rồi lưu.

Nếu dùng Postman Web để gọi localhost, cần Desktop Agent đang chạy; Postman Desktop thuận tiện hơn cho upload ảnh local.

## 4. Cấu hình biến

| Biến                                             | Cách điền / công dụng                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `baseUrl`                                        | Mặc định `http://localhost:3001`, không thêm `/api` và không có dấu `/` cuối             |
| `adminEmail`                                     | Lấy từ `SEED_ADMIN_EMAIL` trong `.env` trên máy                                          |
| `adminPassword`                                  | Lấy từ `SEED_ADMIN_PASSWORD` trong `.env` trên máy; phải đúng mật khẩu tài khoản thực tế |
| `loginAs`                                        | `ADMIN` hoặc `USER`, dùng để chọn tài khoản cho request đăng nhập                        |
| `adminToken`, `adminId`                          | Tự lưu sau đăng nhập ADMIN                                                               |
| `userEmail`                                      | Để rỗng ở lần đầu, script tạo email test theo `runId`; không dùng tài khoản cá nhân      |
| `userPassword`                                   | Mật khẩu test mẫu `PostmanTest123!`, có thể đổi trước khi đăng ký                        |
| `userToken`, `userId`                            | Tự lưu sau đăng ký/đăng nhập USER                                                        |
| `managedUserId`                                  | ID tài khoản test do ADMIN tạo; tách biệt với USER đặt phòng                             |
| `locationId`, `roomId`, `bookingId`, `commentId` | Tự lưu từ response các request tạo dữ liệu tương ứng                                     |
| `runId`                                          | Tự sinh để tạo email test không trùng; giữ nguyên trong một lượt test                    |
| `searchName`                                     | Từ khóa tìm tên người dùng, mặc định `Postman`                                           |
| `expectedStatus`                                 | Mặc định `200`; khi thử lỗi chủ động đổi sang mã dự kiến, xong đổi lại `200`             |

Không nhập token vào Authorization vì các request đã có header `token` dùng biến môi trường. Request công khai không gửi header này. Nếu token hết hạn, gửi lại request đăng nhập đúng vai trò.

Các biến ID ban đầu để rỗng nhằm tránh thao tác nhầm dữ liệu sẵn có. Phải gửi request tạo trước khi gửi request dùng ID đó. Trong raw JSON, biến ID không có dấu ngoặc kép; sau khi thay biến, giá trị phải là số.

## 5. Luồng kiểm thử đề nghị

Gửi từng request bằng nút **Send**. Số dưới đây trùng số ở đầu tên request trong Collection. Chưa dùng **Run toàn bộ Collection** theo thứ tự hiển thị: cần đăng nhập hai vai trò và dời các request xóa xuống cuối.

### A. Lấy token ADMIN và USER

1. Điền `adminEmail`, `adminPassword`; đặt `loginAs=ADMIN`.
2. Gửi **02. Đăng nhập ADMIN hoặc USER**. Kiểm tra `content.user.role` là `ADMIN`, `adminToken` được lưu.
3. Gửi **01. Đăng ký**. Script tự tạo email test và lưu `userId`. Không gửi lại đăng ký cùng email nếu đã thành công, vì sẽ nhận 409.
4. Đặt `loginAs=USER`, gửi lại **02. Đăng nhập ADMIN hoặc USER**. Kiểm tra `userToken` và `userId` được lưu.

Token ADMIN và USER được lưu riêng, nên những request tiếp theo tự chọn đúng token. `loginAs` chỉ ảnh hưởng request đăng nhập, không đổi token của các request khác.

### B. Kiểm thử người dùng

1. Gửi **04. Tạo người dùng**, lưu `managedUserId` tự động.
2. Gửi **03. Danh sách**, **05. Phân trang**, **06. Chi tiết**, **07. Cập nhật**, **08. Tìm theo tên**.
3. Gửi **09. Tải ảnh đại diện** theo cách chọn file ở mục 6. Request dùng USER mới đăng ký.
4. Để **10. Xóa người dùng test quản trị** tới bước dọn dữ liệu.

### C. Tạo vị trí và phòng

1. Gửi **11. Tạo vị trí**, sau đó **12, 13, 14, 15** để xem danh sách, phân trang, chi tiết và cập nhật.
2. Gửi **16. Tải hình vị trí** sau khi chọn ảnh; giữ lại vị trí, chưa gửi **17**.
3. Gửi **18. Tạo phòng**. `maViTri` tự lấy từ `locationId`.
4. Gửi **19, 20, 21, 22, 23** để kiểm tra danh sách, lọc vị trí, phân trang, chi tiết và cập nhật phòng.
5. Gửi **24. Tải hình phòng** sau khi chọn ảnh; chưa gửi **25. Xóa phòng**.

### D. Đặt phòng và bình luận

1. Gửi **26. Tạo đặt phòng**. `maPhong={{roomId}}`, `maNguoiDung={{userId}}`, token USER đã có.
2. Gửi **27, 28, 29, 30** để xem danh sách, chi tiết, sửa số khách lên 3 và lấy theo người dùng.
3. Chưa gửi **31. Xóa đặt phòng** nếu còn muốn kiểm tra sức chứa và lịch trùng.
4. Gửi **32. Tạo bình luận**, sau đó **33, 34, 35** để xem danh sách, lấy theo phòng và sửa bình luận.

### E. Kiểm tra trường hợp lỗi

Ở request muốn kiểm tra, đổi body/header và đặt `expectedStatus` đúng mã dự kiến. Khi xong, khôi phục request và đặt `expectedStatus=200`.

| Trường hợp                        | Cách thử                                                               | Mã mong đợi |
| --------------------------------- | ---------------------------------------------------------------------- | ----------- |
| Email trùng                       | Gửi lại request 01 với email đã tạo                                    | 409         |
| Sai mật khẩu                      | Sửa mật khẩu đăng nhập rồi gửi request 02                              | 401         |
| Không token                       | Tạm tắt header token của request có bảo vệ                             | 401         |
| USER gọi API quản trị             | Đổi header token từ adminToken sang userToken trong request tạo vị trí | 403         |
| Mạo danh người đặt                | Đổi maNguoiDung của request 26 sang ID tài khoản khác đang tồn tại     | 403         |
| Trùng lịch                        | Gửi lại request 26 khi đặt phòng đó vẫn tồn tại                        | 409         |
| Vượt sức chứa                     | Trong request 26 đặt soLuongKhach=5 khi phòng khach=4                  | 400         |
| Ngày sai                          | Trong request 26 đặt ngayDi trước hoặc bằng ngayDen                    | 400         |
| Giảm sức chứa trái ràng buộc      | Sau request 29, đổi khach=1 trong request 23 khi đặt phòng có 3 khách  | 409         |
| Số sao quá lớn                    | Trong request 32 đặt saoBinhLuan=6                                     | 400         |
| Bình luận rỗng                    | Trong request 32 đặt noiDung là chuỗi rỗng                             | 400         |
| Sai kiểu số                       | Dùng chuỗi "2" thay cho số 2 ở soLuongKhach                            | 400         |
| Xóa vị trí còn phòng              | Gửi request 17 trước khi xóa phòng                                     | 409         |
| Xóa phòng còn đặt phòng/bình luận | Gửi request 25 khi dữ liệu phụ thuộc còn tồn tại                       | 409         |
| Phân trang sai                    | Trong request 21 đặt pageSize=0                                        | 400         |
| Không có file                     | Gửi request upload mà chưa chọn formFile                               | 400         |

Tests trong Collection kiểm tra mã HTTP theo expectedStatus và cấu trúc response. Examples là response mẫu để tham khảo, không phải log ghi lại mỗi lần gửi. Để chạy toàn bộ kiểm thử nghiệp vụ tự động và kiểm tra đặt trùng đồng thời, dùng `npm.cmd test` trong backend.

### F. Dọn dữ liệu do Collection tạo

Khi đã kiểm tra xong, gửi theo thứ tự:

1. **36. Xóa bình luận**.
2. **31. Xóa đặt phòng**.
3. **25. Xóa phòng**.
4. **17. Xóa vị trí**.
5. **10. Xóa người dùng test quản trị**.

USER đăng ký ở request 01 vẫn được giữ để tiếp tục dùng. Nếu muốn xóa tài khoản này, chỉ sau khi dọn đặt phòng và bình luận, dùng request xóa người dùng với query id là userId; token phải là ADMIN. Không đổi hoặc xóa ID ADMIN.

Để chạy lượt mới, đặt rỗng `runId`, `userEmail`, `userId`, `userToken`, `managedUserId`, `locationId`, `roomId`, `bookingId`, `commentId`, rồi bắt đầu từ phần A. Mỗi request tạo bản ghi mới sẽ cập nhật ID tương ứng; gửi lại request tạo sau khi dọn sẽ cho ID mới.

## 6. Upload ảnh

Trong mỗi request upload:

1. Mở **Body → form-data**.
2. Trường `formFile` đã có loại **File**; bấm chọn một ảnh thật trên máy.
3. Dùng PNG, JPEG hoặc WebP không quá 5 MB.
4. Không tự thêm `Content-Type`: Postman cần tự tạo multipart boundary.
5. Bấm Send, lấy đường dẫn ảnh trả về. Ví dụ `/uploads/abc.png` thì mở `http://localhost:3001/uploads/abc.png`.

Ảnh mẫu trong response chỉ minh họa; không phải file thật đã tải lên. Khi chuyển Collection sang máy khác phải chọn lại file. Collection không đóng gói ảnh trên máy người tạo.

## 7. Đọc đặc tả và response mẫu

- Chọn request để đọc phần mô tả/Documentation: quyền truy cập, bảng tham số và điều kiện.
- Mở các Examples bên dưới request để xem response 200 và các trường hợp lỗi.
- Các request PUT dùng đủ trường nghiệp vụ. Không đổi khóa chính bằng id trong body.
- Ví dụ ngày giờ gửi có múi giờ +07:00; response dùng UTC với Z là cùng thời điểm, không phải sai giờ.
- `DELETE /api/users` dùng query id; upload vị trí dùng chính xác `/api/vi-tri/upload-hinh-vitri`.

## 8. Chuẩn bị nộp bài

1. Nộp Collection và Environment mẫu trong thư mục này, kèm hướng dẫn nếu cần.
2. Sau khi deploy xong, đổi `baseUrl` sang URL backend thật, không thêm `/api` ở cuối, và kiểm tra lại.
3. Cung cấp tài khoản demo theo cách riêng phù hợp yêu cầu giảng viên. Environment mẫu trong GitHub không chứa thông tin đăng nhập thật.
4. Nếu xuất Environment đã dùng, xóa mật khẩu thật, token và dữ liệu nhạy cảm trước khi chia sẻ; nhãn secret không thay cho việc xóa giá trị khi export.
5. Không nộp file `.env` hoặc mật khẩu database/JWT secret. Chưa ghi dự án đã deploy khi chưa hoàn tất triển khai.

## 9. Tạo lại tài liệu khi API đổi

```powershell
node scripts/build-postman.js
```

Script chỉ đọc Swagger tham chiếu và ghi các file đặc tả mẫu, không đọc `.env` và không gọi database. Hướng dẫn này được giữ nguyên khi tạo lại.

Chuẩn Collection: https://schema.postman.com/json/collection/v2.1.0/collection.json

Tài liệu scripts Postman: https://learning.postman.com/docs/tests-and-scripts/write-scripts/postman-sandbox-reference/pm-response/
