# Kết quả kiểm tra — 02/11/2026

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
- GitHub chờ URL repository, chưa push.
- Chưa deploy theo yêu cầu.
