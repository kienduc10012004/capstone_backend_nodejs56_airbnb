# TRIỂN KHAI AIRBNB: VERCEL + MYSQL RAILWAY + CLOUDINARY

Đây là hướng dẫn cho source đã được chuẩn bị trong repository này. Chưa có triển khai online được xác minh cho tài khoản của bạn. Thực hiện theo thứ tự; chỉ sang bước tiếp theo khi bước trước thành công.

## 1. Kiểm tra source trên máy

Trong PowerShell:

```powershell
cd "D:\Bài tập\Bài tập lập trình\BC95\airbnb\backend_airbnb"
git status
npm.cmd install
npm.cmd run build
```

Build phải có thông báo tạo Prisma Client và chuẩn bị tài nguyên Swagger. Nếu đang dùng máy hiện tại, source đã được cập nhật trực tiếp. Nếu clone ở máy khác, dùng bản mới nhất nhánh main. Nếu có chỉnh sửa local, không dùng git reset hoặc ghi đè để cập nhật.

Không commit `.env`, `.env.deploy.local`, mật khẩu hoặc API secret. Không cần Docker cho database online; Docker local vẫn giữ nguyên để phát triển.

## 2. Tạo MySQL trên Railway

1. Mở https://railway.com và đăng nhập bằng GitHub.
2. Tạo project mới bằng **New Project**. Chọn tạo database MySQL; nếu project đang trống, dùng **+ New → Database → MySQL**. Có thể dùng tìm kiếm service/template nếu giao diện bố trí khác.
3. Chờ service MySQL triển khai xong và hoạt động.
4. Bấm vào service MySQL → **Settings → Networking**.
5. Bật **Public Access** / tạo **TCP Proxy** cho cổng MySQL nội bộ **3306**. Không tạo HTTP domain cho database.
6. Mở tab **Variables**, tìm **MYSQL_PUBLIC_URL** và sao chép giá trị đã resolve. Nếu chỉ thấy biểu thức tham chiếu biến, lấy chuỗi kết nối external/public ở phần Connect hoặc ghép từ host/port TCP Proxy và thông tin tài khoản.
7. URL phải có dạng `mysql://USER:PASSWORD@PUBLIC_HOST:PUBLIC_PORT/DATABASE`. Không có `railway.internal` hoặc `localhost`.

Railway có thể yêu cầu kích hoạt gói hoặc thông tin thanh toán tùy tài khoản; tự kiểm tra chi phí hiển thị và giới hạn sử dụng trước khi xác nhận. Hướng dẫn không cam kết dịch vụ miễn phí lâu dài.

**Kết quả cần có:** một chuỗi MYSQL_PUBLIC_URL kết nối từ ngoài Railway. Không gửi chuỗi chứa mật khẩu qua chat hoặc đưa lên GitHub.

Tài liệu chính thức: https://docs.railway.com/databases/mysql

## 3. Tạo bảng và ADMIN demo trên MySQL online

Tại thư mục backend, chỉ tạo file cấu hình online nếu chưa có:

```powershell
if (-not (Test-Path .env.deploy.local)) { Copy-Item .env.deploy.example .env.deploy.local }
```

Mở `.env.deploy.local` trong VS Code và điền:

```dotenv
DATABASE_URL=DAN_CHUOI_MYSQL_PUBLIC_URL_TU_RAILWAY
SEED_ADMIN_EMAIL=admin.demo@example.com
SEED_ADMIN_PASSWORD=DAT_MAT_KHAU_DEMO_CUA_BAN
```

Thay giá trị mẫu bằng thông tin thật. Không thêm dấu ngoặc, không dùng dấu cách quanh URL, không thay `.env` local. Mật khẩu ADMIN demo từ 8 ký tự, không quá 72 byte UTF-8. Ghi nhớ tài khoản này để đăng nhập bản online, không dùng nhầm ADMIN trong `.env` local.

Sau khi lưu file:

```powershell
npm.cmd run db:generate
npm.cmd run db:setup:online
```

Kết quả mong đợi:

- Script in host/port database online, không in mật khẩu.
- Migration được áp dụng thành công.
- Có dòng `Seed completed. Admin email: ...`.
- Railway Database/Data hiển thị 5 bảng nghiệp vụ (và bảng `_prisma_migrations` của Prisma).

Lệnh chỉ dùng `.env.deploy.local` cho migration và seed; không đổi `.env` local. Nếu không kết nối được, kiểm tra public URL/TCP Proxy và service MySQL. Không dùng lệnh reset database để xử lý lỗi kết nối.

Seed tạo ADMIN, một vị trí và một phòng mẫu. Không chuyển dữ liệu test/ảnh trên máy local lên online. Seed không đổi mật khẩu tài khoản đã có: đổi SEED_ADMIN_PASSWORD rồi chạy lại không tự cập nhật mật khẩu cũ.

## 4. Lấy thông tin Cloudinary

1. Mở https://cloudinary.com và tạo tài khoản hoặc đăng nhập.
2. Vào **Console**, chọn đúng product environment.
3. Ghi lại **Cloud name**.
4. Vào phần **API Keys** (thường trong Settings), lấy **API Key** và **API Secret**; có thể phải bấm biểu tượng hiện secret.
5. Giữ ba giá trị riêng để điền lên Vercel. Không cần tạo unsigned upload preset vì backend upload bằng API secret.

**Kết quả cần có:** cloud name, API key và API secret cùng một product environment.

Tài liệu Node.js: https://cloudinary.com/documentation/node_image_and_video_upload

## 5. Tạo JWT secret cho bản deploy

Trong terminal:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Copy nguyên chuỗi được tạo. Dùng nó cho JWT_SECRET trên Vercel; không đưa vào repository. Đây không phải token đăng nhập và không nhập vào Authorize trên Swagger.

## 6. Import repository lên Vercel

1. Mở https://vercel.com/new, đăng nhập bằng GitHub.
2. Trong **Import Git Repository**, tìm `kienduc10012004/capstone_backend_nodejs56_airbnb` và bấm **Import**.
3. Nếu không thấy repo, dùng **Configure GitHub App** để cấp quyền cho đúng repository, rồi quay lại import.
4. Đặt Project Name, ví dụ `airbnb-nodejs56-kien`; nếu đã có người dùng tên đó, thêm hậu tố.
5. **Framework Preset:** Express. Repository có `vercel.json` khai báo express.
6. **Root Directory:** thư mục gốc `./`. Không chọn `backend_airbnb`, vì repository này đã chứa backend ngay ở root.
7. **Build Command:** `npm run build` (đã khai báo trong vercel.json).
8. **Install Command:** mặc định `npm install`.
9. Không tự cấu hình Output Directory thành dist/public. Giữ mặc định của framework Express.
10. Nếu có lựa chọn Node.js Version, dùng **24.x**. Nếu chỉ đổi được sau import, vào Settings → Build and Deployment và redeploy sau khi đổi.

Chưa bấm Deploy cho tới khi thêm đủ biến ở bước 7.

## 7. Thêm Environment Variables

Trong màn hình import, mở **Environment Variables**. Điền từng biến; giá trị không bao gồm dấu ngoặc kép ở bên ngoài.

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Chính chuỗi MYSQL_PUBLIC_URL đã dùng thành công ở bước 3 |
| `JWT_SECRET` | Chuỗi tạo ở bước 5 |
| `JWT_EXPIRES_IN` | `1d` |
| `IMAGE_STORAGE` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name ở bước 4 |
| `CLOUDINARY_API_KEY` | API key ở bước 4 |
| `CLOUDINARY_API_SECRET` | API secret ở bước 4 |
| `DB_CONNECTION_LIMIT` | `3` |

Chọn ít nhất **Production**. Nếu muốn dùng Preview, cấu hình riêng hoặc chỉ test với database demo có thể dùng chung; tránh chạy preview tùy ý vào database chứa dữ liệu quan trọng.

Không cần thêm PORT, MYSQL_ROOT_PASSWORD hoặc các biến Docker. Không cần đưa SEED_ADMIN_PASSWORD lên Vercel vì ADMIN đã được tạo ở bước 3. Không tự đặt VERCEL: nền tảng cung cấp biến này.

Adapter có tùy chọn `DB_SSL=true` nếu nhà cung cấp yêu cầu và đã cấu hình TLS tương ứng. Không bật/tắt ngẫu nhiên hoặc bỏ xác minh chứng chỉ để xử lý lỗi.

Vercel lưu biến cấu hình theo môi trường: https://vercel.com/docs/environment-variables

## 8. Deploy và lấy domain

1. Bấm **Deploy**.
2. Theo dõi Build Logs. Cần thấy Prisma generate và chuẩn bị Swagger thành công.
3. Chờ trạng thái **Ready**.
4. Mở project → Overview/Domains, lấy **production domain**, ví dụ `https://airbnb-nodejs56-kien.vercel.app` (đây chỉ là ví dụ).
5. Mở domain đó. Backend chuyển tới `/swagger/`.

Không chạy migrate hoặc seed trong mỗi request. Không dùng `npm run dev` làm Build Command. Build dự án này không tự tạo database, nên phải hoàn thành bước 3 trước.

Express trên Vercel: https://vercel.com/docs/frameworks/backend/express

## 9. Kiểm tra sau deploy theo thứ tự

Thay YOUR_DOMAIN bằng domain thật, không copy nguyên tên mẫu:

```text
https://YOUR_DOMAIN/swagger/
https://YOUR_DOMAIN/swagger.json
https://YOUR_DOMAIN/api/vi-tri
https://YOUR_DOMAIN/api/phong-thue
```

1. Mở Swagger và xác nhận giao diện có nút Try it out, không bị trắng hoặc thiếu CSS.
2. Mở GET /api/vi-tri. Cần 200 và dữ liệu mẫu từ database online.
3. Đăng nhập ADMIN bằng email/password đã điền trong `.env.deploy.local`. Kiểm tra role ADMIN và copy content.token.
4. Nhập token vào Authorize, không thêm Bearer.
5. Tạo một vị trí mới; lấy ID trả về.
6. Gọi upload hình vị trí, chọn PNG/JPEG/WebP dưới **3 MB**. Kết quả hinhAnh phải là URL HTTPS của Cloudinary. Mở URL để kiểm tra ảnh.
7. Tạo phòng với ID vị trí vừa tạo. Kiểm tra upload hình phòng.
8. Đăng ký USER mới, đăng nhập và Authorize token USER. Kiểm tra upload avatar.
9. Đặt phòng với ID phòng thật và maNguoiDung trùng ID USER. Gửi lại cùng lịch phải trả 409.
10. Tạo, sửa và xóa bình luận; kiểm tra các quyền theo hướng dẫn Word.
11. Test đủ 36 API và dọn dữ liệu test theo thứ tự bình luận → đặt phòng → phòng → vị trí → người dùng.

Vercel giới hạn body request 4,5 MB; bản Cloudinary trong code giới hạn ảnh **3 MB** để chừa multipart overhead. Local mặc định vẫn tối đa 5 MB. Swagger runtime hiển thị đúng giới hạn hiện tại. Các file Word/Postman ban đầu có mô tả local 5 MB; khi nộp bản deploy, áp dụng 3 MB và cập nhật mô tả cho khớp.

## 10. Bảo đảm người chấm truy cập được

1. Mở production domain trong cửa sổ ẩn danh, không đăng nhập Vercel.
2. Nếu bị yêu cầu đăng nhập Vercel trước khi vào Swagger, kiểm tra **Settings → Deployment Protection**. Điều chỉnh cấu hình bảo vệ để production demo truy cập được; không nhầm với xác thực JWT của API.
3. Nếu muốn giữ preview được bảo vệ, vẫn có thể chỉ công khai production domain theo tùy chọn tài khoản hiện có.
4. Điền production domain, link Swagger và tài khoản ADMIN demo vào file Word.
5. Đổi baseUrl trong Postman Environment thành production domain, không có `/api` hoặc dấu `/` cuối.

Tài liệu Deployment Protection: https://vercel.com/docs/deployment-protection

## 11. Xử lý lỗi thường gặp

| Lỗi | Kiểm tra và xử lý |
| --- | --- |
| Build không tìm Prisma Client | Xác nhận Build Command npm run build; kiểm tra Prisma generate trong logs |
| Build lỗi DATABASE_URL | Thêm DATABASE_URL trong đúng môi trường Vercel trước khi deploy |
| Database timeout / ENOTFOUND | Dùng MYSQL_PUBLIC_URL, kiểm tra public TCP Proxy; không dùng railway.internal hoặc localhost |
| Access denied database | Kiểm tra lại username/password và URL đầy đủ, không có dấu cách |
| Không có bảng / API 500 | Chạy db:setup:online với chính URL đang đặt trên Vercel; xem runtime logs |
| Đăng nhập ADMIN 401 | Dùng thông tin đã seed online; không dùng ADMIN local hoặc tưởng đổi env sẽ đổi mật khẩu database |
| Upload 500/502/503 | Kiểm tra 3 biến Cloudinary; IMAGE_STORAGE=cloudinary; xem runtime logs, redeploy sau sửa env |
| Upload 413 | File/request vượt giới hạn Vercel; chọn ảnh dưới 3 MB |
| Swagger thiếu CSS/JS | Kiểm tra npm run build có chạy script build-vercel.js; truy cập /swagger/swagger-ui.css phải trả CSS |
| Swagger trắng / chuyển hướng lặp | Dùng bản source mới, mở /swagger/ và Ctrl+F5; kiểm tra network/logs |
| Sửa biến nhưng chưa có hiệu lực | Save Environment Variables, vào Deployments chọn bản production rồi Redeploy |
| Trang gốc báo 404 ở bản cũ | Dùng /swagger/ hoặc cập nhật bản mới có redirect trang gốc |

Khi cần hỗ trợ, gửi thông báo lỗi, ảnh Build/Runtime Logs đã che bí mật, Request URL và mã HTTP. Không gửi DATABASE_URL nguyên vẹn, API secret hoặc token thật.
