# Kết quả kiểm tra — 02/11/2026

## Chuẩn bị Vercel

- Build sinh Prisma Client và copy tài nguyên Swagger vào public/swagger cho CDN.
- Entry server.js export Express trên Vercel, giữ listener khi chạy local.
- Chế độ ảnh Cloudinary dùng URL HTTPS, giới hạn 3 MB; local vẫn 5 MB.
- Có script dùng .env.deploy.local để migrate/seed database online riêng, không ghi đè .env local.
- Kiểm thử: **19 pass, 0 fail**, bao gồm 36 API, Postman, export Vercel, Swagger và nhánh lưu ảnh Cloudinary dùng mock.
- Chưa gọi Cloudinary thật và chưa deploy vào tài khoản Vercel/Railway vì người dùng cần tự cấu hình dịch vụ. Chỉ xác nhận build và kiểm thử local, không khẳng định đã triển khai thành công.

## Bộ đặc tả Postman

- Có Collection v2.1 với 6 nhóm và đúng 36 cặp method/path, đối chiếu với Swagger tham chiếu.
- Có Environment mẫu, hướng dẫn sử dụng và đặc tả Markdown đầy đủ tại `docs/postman`.
- Mỗi request có bảng tham số, điều kiện, quyền truy cập, body (nếu có), response thành công và lỗi minh họa.
- Đã thực thi các request và scripts từ Collection theo luồng hướng dẫn qua HTTP với Supertest, MySQL thật và mô phỏng phần API Postman sandbox mà scripts sử dụng; không tuyên bố đã chạy qua giao diện Postman hoặc Newman.
- Đã kiểm tra lưu riêng token ADMIN/USER, tự lưu ID, upload và dọn dữ liệu do kiểm thử tạo ra.
- Environment mẫu không chứa thông tin ADMIN thật hoặc token có hiệu lực. Các response mẫu là minh họa, không phải bằng chứng deploy.
- Toàn bộ kiểm thử sau bổ sung: **16 tests pass, 0 fail**.

## Cập nhật thông báo tiếng Việt

- Toàn bộ lỗi validation được diễn đạt bằng tiếng Việt, kèm tên trường dễ hiểu.
- Phân biệt thông tin bắt buộc, chuỗi rỗng, sai kiểu dữ liệu, giới hạn số/ký tự, định dạng email/ngày giờ và vai trò.
- Thông báo upload, JSON sai, nội dung quá lớn và lỗi thư viện phía client được chuẩn hóa bằng tiếng Việt.
- Kiểm thử sau cập nhật: **14 tests pass, 0 fail**, bao gồm luồng đủ 36 API và các ca kiểm tra thông báo tiếng Việt.

## Môi trường đã chạy

- Node.js `v24.18.0`.
- Express, Prisma `7.10.1` với adapter MariaDB và MySQL Docker `8.4`.
- Container `bc95-airbnb-mysql-1`: healthy, cổng local `3308`.
- Migration `20261102000000_init` đã áp dụng thành công.
- Seed ADMIN, vị trí và phòng mẫu thành công.

## Kiểm thử tích hợp

Lệnh: `npm.cmd test`.

Kết quả sau chỉnh sửa validation cuối cùng: **8 tests pass, 0 fail, 0 skipped**. Thời gian khoảng 5,3 giây. Bảy nhóm con nằm trong một test luồng tổng.

| Nhóm | Kết quả đã xác minh |
| --- | --- |
| Auth | Đăng ký, đăng nhập, không tự nâng ADMIN, email trùng, mật khẩu sai, ngày sinh sai, JSON sai |
| Người dùng | Đủ 8 API; tìm kiếm/phân trang; không lộ hash; thiếu/sai token; USER bị chặn API quản trị |
| Vị trí | CRUD, phân trang/tìm kiếm, upload, tên quốc gia dạng chuỗi, ID sai và không tồn tại |
| Phòng | CRUD, lọc theo vị trí, phân trang, upload, vị trí không tồn tại, chặn xóa vị trí có phòng |
| Đặt phòng | Đủ 6 API; quyền sở hữu; ngày sai; vượt sức chứa; chặn giảm sức chứa; chặn xóa dữ liệu liên kết |
| Đặt phòng đồng thời | Hai request cùng phòng và cùng lịch trả chính xác một 200 và một 409 |
| Khoảng ngày liền kề | Đặt phòng bắt đầu đúng giờ kết thúc của đặt phòng trước được chấp nhận |
| Bình luận | Đủ 5 API; kiểm tra sao; quyền sở hữu; dữ liệu người bình luận; xóa lại trả 404 |
| Upload | Ảnh hợp lệ đọc được qua HTTP; file giả, thiếu file và quá 5 MB bị từ chối |
| Tài liệu | Swagger UI/JSON truy cập được; không còn tham số tokenCybersoft |
| Hợp đồng API | Bộ kiểm thử đối chiếu đủ 36 cặp method/path trong Swagger, không bỏ sót |

Dữ liệu kiểm thử và ảnh tạo ra được dọn sau khi chạy; không xóa dữ liệu seed.

## Dependency và source

- Kết quả audit khi cài dependency cuối cùng: **0 vulnerabilities**.
- Source đã được định dạng bằng Prettier.
- `.env` và `node_modules` đã được xác minh nằm trong Git ignore.
- Đã push source lên nhánh `main` của https://github.com/kienduc10012004/capstone_backend_nodejs56_airbnb. Đã kiểm tra các file commit không chứa giá trị bí mật từ .env local.
- Chưa deploy theo yêu cầu.
