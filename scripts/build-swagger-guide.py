"""Tạo hướng dẫn Word từ danh mục Postman; không đọc .env hoặc database."""

import json
import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parents[1]
COLLECTION = json.loads((ROOT / 'docs/postman/Airbnb.postman_collection.json').read_text(encoding='utf-8'))
REFERENCE = json.loads((ROOT / 'swagger-reference.json').read_text(encoding='utf-8'))
OUTPUT = ROOT / 'docs/HUONG_DAN_CHAM_BAI_SWAGGER.docx'
doc = Document()
section = doc.sections[0]
section.page_width, section.page_height = Cm(21), Cm(29.7)
section.top_margin, section.bottom_margin = Cm(1.8), Cm(1.8)
section.left_margin, section.right_margin = Cm(2), Cm(2)
normal = doc.styles['Normal']
normal.font.name = 'Calibri'
normal.font.size = Pt(11)
normal.paragraph_format.space_after = Pt(6)
for name, size in [('Title', 25), ('Heading 1', 17), ('Heading 2', 13)]:
    doc.styles[name].font.name = 'Calibri'
    doc.styles[name].font.size = Pt(size)
    doc.styles[name].font.color.rgb = RGBColor.from_string('17365D')
header = section.header.paragraphs[0]
header.text = 'NODE.JS AIRBNB  |  HƯỚNG DẪN KIỂM THỬ API'
header.style = 'Caption'
footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.RIGHT
footer.add_run('Trang ')
field = OxmlElement('w:fldSimple')
field.set(qn('w:instr'), 'PAGE')
footer._p.append(field)


def p(text, style=None):
    return doc.add_paragraph(text, style)


def table(headers, rows):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = 'Light Shading Accent 1'
    for cell, text in zip(t.rows[0].cells, headers):
        cell.text = str(text)
    repeat = OxmlElement('w:tblHeader')
    t.rows[0]._tr.get_or_add_trPr().append(repeat)
    for row in rows:
        for cell, text in zip(t.add_row().cells, row):
            cell.text = str(text)
    for row in t.rows:
        cant_split = OxmlElement('w:cantSplit')
        row._tr.get_or_add_trPr().append(cant_split)
    p('')


def code(text):
    para = p(text)
    para.paragraph_format.space_before = Pt(4)
    for run in para.runs:
        run.font.name = 'Consolas'
        run.font.size = Pt(9)
    shade = OxmlElement('w:shd')
    shade.set(qn('w:fill'), 'F2F4F7')
    para._p.get_or_add_pPr().append(shade)


doc.add_heading('HƯỚNG DẪN CHẤM BÀI\nKIỂM THỬ API TRÊN SWAGGER', 0)
p('Dự án cuối khóa Node.js — Airbnb', 'Subtitle')
p('Phạm vi: kiểm thử trực tiếp hệ thống đã deploy bằng trình duyệt, đủ 36 API thuộc 6 nhóm chức năng.')
p('Không yêu cầu người chấm cài Node.js, Docker, MySQL, Postman hoặc chạy source trên máy.')
doc.add_heading('Thông tin truy cập do học viên cung cấp', 1)
table(['Thông tin', 'Giá trị cần điền trước khi nộp'], [
    ('Địa chỉ backend (BASE_URL)', '[ĐIỀN URL BACKEND ĐÃ DEPLOY]'),
    ('Đường dẫn Swagger', '[ĐIỀN URL SWAGGER THỰC TẾ] — thông thường BASE_URL/swagger'),
    ('Email ADMIN demo', '[ĐIỀN EMAIL ADMIN DEMO]'),
    ('Mật khẩu ADMIN demo', '[ĐIỀN MẬT KHẨU ADMIN DEMO / CUNG CẤP RIÊNG]'),
    ('Repository', 'https://github.com/kienduc10012004/capstone_backend_nodejs56_airbnb'),
    ('Thông tin liên hệ hỗ trợ', '[ĐIỀN THÔNG TIN LIÊN HỆ]'),
])
p('Lưu ý cho học viên: đây là mẫu hướng dẫn cho bản deploy. Phải thay các ô [ĐIỀN ...], xác minh link Swagger truy cập được và tài khoản demo hoạt động trước khi nộp. Không đưa mật khẩu thật vào bản công khai trên GitHub.')
doc.add_heading('1. Quy ước và cách dùng Swagger', 1)
for text in [
    'Mở link Swagger được cung cấp. Không truy cập localhost khi chấm bản deploy.',
    'Mở endpoint → Try it out → điền tham số/body → Execute. Xem Request URL, Server response, Code và Response body.',
    'Với JSON, chọn Parameter content type = application/json. Với upload, chọn formFile từ máy, sử dụng multipart/form-data.',
    'Response thành công của dự án dùng HTTP 200, kể cả tạo mới và xóa. Dữ liệu nằm trong content; không trả mật khẩu/hash.',
    'Các khóa JSON như maPhong, maViTri và maNguoiDung giữ nguyên. Không dùng tên cột database trong body.',
    'ID trong tài liệu là ví dụ, không phải ID cố định của bản deploy. Sau mỗi lần tạo, ghi ID trả về và thay vào các request liên quan.',
    'Số và boolean không có dấu ngoặc kép. Ngày sinh: YYYY-MM-DD. Ngày giờ: ISO 8601 kèm múi giờ. Response UTC có ký hiệu Z có thể khác giờ hiển thị nhưng là cùng thời điểm.',
]:
    p(text, 'List Bullet')
code(json.dumps({'statusCode': 200, 'message': 'Thành công', 'content': {'id': 101}}, ensure_ascii=False, indent=2))
table(['Mã', 'Ý nghĩa'], [(200, 'Thành công'), (400, 'Dữ liệu không hợp lệ'), (401, 'Chưa đăng nhập / token sai hoặc hết hạn'), (403, 'Không có quyền'), (404, 'Không tìm thấy dữ liệu'), (409, 'Trùng email/lịch, dữ liệu đang được sử dụng hoặc vi phạm ràng buộc'), (413, 'Body JSON quá 1 MB'), (429, 'Quá nhiều yêu cầu đăng ký/đăng nhập'), (500, 'Lỗi hệ thống; ghi nhận và liên hệ học viên')])

doc.add_heading('2. Tài khoản, token và thứ tự thực hiện', 1)
p('Đầu tiên dùng API 02 đăng nhập ADMIN bằng tài khoản demo. Lấy content.token, mở Authorize, dán nguyên token (không thêm Bearer), bấm Authorize rồi Close. Kiểm tra content.user.role là ADMIN.')
p('Sau đó dùng API 01 đăng ký USER A và USER B bằng hai email khác nhau. Ví dụ usera.cham.001@example.com và userb.cham.001@example.com; đổi hậu tố mỗi lượt để tránh email trùng. Mật khẩu test có thể dùng ChamBai123!.')
p('Dùng API 02 đăng nhập từng USER, ghi lại content.user.id và token. Khi chuyển vai trò, vào Authorize → Logout → nhập token tương ứng. Không cần token CyberSoft.')
table(['Thông tin', 'Giá trị người chấm ghi lại'], [('ID USER A / token USER A', '........................................................'), ('ID USER B / token USER B', '........................................................'), ('Token ADMIN', '........................................................'), ('ID người dùng test quản trị', '........................................................'), ('ID vị trí / ID phòng test', '........................................................'), ('ID đặt phòng / ID bình luận', '........................................................')])
p('Thứ tự đề nghị: đăng nhập ADMIN → đăng ký và đăng nhập USER A/B → test người dùng → tạo vị trí → tạo phòng → đặt phòng → bình luận → test lỗi/phân quyền → dọn dữ liệu. Các API xóa được mô tả theo nhóm nhưng để tới cuối lượt chấm mới thực hiện.')
p('Mã API trong tài liệu này trùng bộ Postman. API 02 được gọi nhiều lần cho các tài khoản khác nhau nhưng vẫn là một endpoint trong tổng 36 API.')
doc.add_heading('3. Danh mục 36 API', 1)
all_items = [item for folder in COLLECTION['item'] for item in folder['item']]


def swagger_path(item):
    original = '/' + '/'.join(item['request']['url']['path'])
    normalized = re.sub(r'\{\{\w+\}\}', '{}', original)
    candidates = [route for route, methods in REFERENCE['paths'].items()
                  if item['request']['method'].lower() in methods
                  and re.sub(r'\{\w+\}', '{}', route) == normalized]
    assert len(candidates) == 1
    return candidates[0]


rows = []
for item in all_items:
    route = swagger_path(item)
    rows.append((item['name'][:2], item['request']['method'], route))
table(['Mã', 'Method', 'Endpoint mẫu trên Swagger'], rows)
p('Ở danh mục, {id}, {MaPhong}, {MaNguoiDung} hoặc {TenNguoiDung} là tham số đường dẫn. Trong Swagger nhập giá trị thật vào ô tham số, không nhập dấu ngoặc nhọn.')

mapping = {
    'userId': '101', 'managedUserId': '102', 'locationId': '201', 'roomId': '301',
    'bookingId': '401', 'commentId': '501', 'searchName': 'Postman',
    'userEmail': 'usera.cham.001@example.com', 'userPassword': 'ChamBai123!',
    'runId': 'cham001', 'loginEmail': '[EMAIL TÀI KHOẢN CẦN ĐĂNG NHẬP]',
    'loginPassword': '[MẬT KHẨU TƯƠNG ỨNG]',
}
special_notes = {
    1: 'Đăng ký thêm USER B bằng email khác để test phân quyền. Khi gửi role ADMIN ở đăng ký công khai, tài khoản tạo ra vẫn phải là USER. Email trùng trả 409.',
    2: 'Dùng tài khoản ADMIN ở bảng đầu tài liệu hoặc USER vừa đăng ký. Lưu token riêng và chuyển đúng token bằng Authorize. Sai mật khẩu trả 401.',
    4: 'Ghi ID tài khoản mới làm ID người dùng test quản trị. Tài khoản này được dùng cho API 06, 07 và 10; không dùng tài khoản ADMIN đang chấm.',
    7: 'Gửi đủ các trường. Giữ email khớp tài khoản test quản trị; không cập nhật mật khẩu bằng API này.',
    9: 'Dùng token USER A. Chỉ cập nhật avatar của chính tài khoản đang đăng nhập.',
    10: 'Để cuối lượt: truyền ID người dùng test quản trị vào query id. Không có /{id} trong đường dẫn DELETE này.',
    11: 'Ghi content.id làm ID vị trí test. Có thể điền URL ảnh công khai trong hinhAnh hoặc để rỗng và dùng API 16.',
    16: 'Đường dẫn chính xác là upload-hinh-vitri. Truyền maViTri qua query, chọn formFile.',
    17: 'Chỉ xóa sau khi xóa phòng. Nếu vị trí còn phòng, trả 409.',
    18: 'Thay maViTri=201 bằng ID vị trí vừa tạo; ghi ID phòng trả về. Tạo phòng khác với API đặt phòng: kiểm tra Request URL là /api/phong-thue.',
    23: 'Body đầy đủ. Giữ khach=4 để thực hiện lượt test bình thường. Khi đặt phòng đã có 3 khách, thử khach=1 phải nhận 409.',
    24: 'Truyền maPhong qua query; chọn formFile. Không nhầm với maViTri.',
    25: 'Chỉ xóa sau khi dọn đặt phòng và bình luận. Còn dữ liệu phụ thuộc phải trả 409.',
    26: 'Dùng token USER A. Thay maPhong bằng ID phòng test và maNguoiDung bằng ID USER A; không mặc định là 1. Gửi lại cùng lịch khi bản ghi còn tồn tại phải trả 409.',
    27: 'USER chỉ thấy đặt phòng của mình. Có thể đổi token ADMIN để xem toàn bộ.',
    28: 'Dùng ID đặt phòng đã tạo. USER B xem đặt phòng USER A phải nhận 403; USER A và ADMIN được phép.',
    29: 'Tăng soLuongKhach lên 3 trong phòng sức chứa 4. Gọi lại API 28 để xác nhận trước khi thử giảm sức chứa phòng.',
    30: 'Tham số MaNguoiDung là ID USER A. USER B xem dữ liệu USER A phải nhận 403; ADMIN được xem.',
    31: 'Để cuối lượt nếu còn test lịch trùng và sức chứa. Chủ đặt phòng hoặc ADMIN được xóa; USER B xóa đặt phòng USER A phải nhận 403.',
    32: 'Dùng token USER A; maNguoiBinhLuan là ID USER A. Ghi ID bình luận trả về để dùng cho API 35, 36.',
    35: 'Chủ bình luận hoặc ADMIN được sửa. USER B không được sửa bình luận USER A kể cả đổi maNguoiBinhLuan trong body.',
    36: 'Xóa bằng token USER A hoặc ADMIN. Sau khi xóa, bản ghi không còn trong danh sách; xóa lại cùng ID trả 404.',
}

for folder in COLLECTION['item']:
    doc.add_page_break()
    doc.add_heading('4.' + folder['name'][:2].lstrip('0') + '. ' + folder['name'][4:], 1)
    for item in folder['item']:
        n = int(item['name'][:2])
        req = item['request']
        doc.add_heading('API ' + item['name'], 2)
        route_template = '/' + '/'.join(req['url']['path'])
        p(req['method'] + ' ' + swagger_path(item))
        token = next((header['value'] for header in req['header'] if header['key'] == 'token'), '')
        permission = 'ADMIN' if 'adminToken' in token else 'USER A (chủ dữ liệu) hoặc ADMIN' if token else 'Công khai; không cần token'
        if n == 9:
            permission = 'USER A đăng nhập; cập nhật ảnh của chính mình'
        p('Tài khoản sử dụng: ' + permission + '.')
        if n in special_notes:
            p(special_notes[n])
        for param in req['url'].get('query', []):
            value = re.sub(r'\{\{(\w+)\}\}', lambda m: mapping.get(m.group(1), m.group(1)), param['value'])
            p(f'Tham số query: {param["key"]} = {value}. Nếu là ID, thay số ví dụ bằng ID thật.')
        for variable in re.findall(r'\{\{(\w+)\}\}', route_template):
            p(f'Tham số trong đường dẫn: dùng {variable} thực tế (ví dụ {mapping.get(variable, "giá trị đã ghi")}).')
        body = req.get('body', {})
        if body.get('mode') == 'raw':
            rendered = re.sub(r'\{\{(\w+)\}\}', lambda m: mapping[m.group(1)], body['raw'])
            p('Body JSON mẫu (thay các ID/email ví dụ bằng giá trị của lượt test):')
            json.loads(rendered)
            code(rendered)
        if body.get('mode') == 'formdata':
            p('Chọn Try it out → formFile → Choose File → ảnh PNG/JPEG/WebP tối đa 5 MB → Execute. Không gửi JSON cho thao tác upload.')
            p('Đường dẫn trả về /uploads/... được mở bằng BASE_URL + đường dẫn đó, không dùng địa chỉ localhost.')
        p('Kết quả mong đợi: HTTP 200, statusCode=200, message="Thành công".')
        sample = json.loads(item['response'][0]['body'])['content']
        if isinstance(sample, list):
            p('content là danh sách; xác nhận có bản ghi test và các bản ghi phù hợp điều kiện lọc. Danh sách có thể rỗng khi chưa có dữ liệu.')
        elif isinstance(sample, dict) and 'totalPages' in sample:
            p('content gồm pageIndex, pageSize, totalRow, totalPages và data. Kiểm tra tối đa pageSize bản ghi và khớp từ khóa.')
        elif n == 2:
            p('content gồm user và token; kiểm tra user.role phù hợp tài khoản, không có mật khẩu/hash.')
        else:
            p('content là bản ghi tương ứng; kiểm tra ID, các trường đã nhập và nội dung vừa sửa/xóa. Không có mật khẩu/hash.')
        if req['method'] == 'PUT':
            p('Gọi lại API đọc chi tiết hoặc danh sách tương ứng để xác nhận dữ liệu mới; response cũ trên Swagger không tự cập nhật.')
        if n in [1, 4, 11, 18, 26, 32]:
            p('Ghi lại content.id để dùng cho các API tiếp theo.')
        if n in [5, 13, 21]:
            p('Thử pageSize=0 phải trả 400; pageIndex bắt đầu từ 1, pageSize từ 1 đến 100.')

doc.add_page_break()
doc.add_heading('5. Kiểm tra lỗi, phân quyền và ràng buộc', 1)
table(['Ca kiểm thử', 'Thao tác', 'Kết quả'], [
    ('Không đăng nhập', 'Logout trong Authorize, gọi API quản trị', '401'),
    ('USER gọi quản trị', 'Token USER A tạo/sửa/xóa vị trí hoặc phòng', '403'),
    ('Mạo danh người đặt', 'Token USER A, gửi maNguoiDung là ID USER B', '403'),
    ('Truy cập đặt phòng người khác', 'USER B xem/sửa/xóa đặt phòng của A', '403'),
    ('Truy cập bình luận người khác', 'USER B sửa/xóa bình luận của A', '403'),
    ('Đăng ký trùng', 'Gửi lại email đã đăng ký', '409'),
    ('Đăng nhập sai', 'Sai mật khẩu của tài khoản hợp lệ', '401'),
    ('Lịch trùng', 'Đặt lại cùng phòng và khoảng ngày đang được đặt', '409'),
    ('Lịch liền kề', 'Ngày đến đặt mới đúng thời điểm ngày đi đặt trước; dữ liệu khác hợp lệ', '200; ghi ID đặt mới để dọn'),
    ('Quá sức chứa', 'Phòng khach=4, đặt soLuongKhach=5', '400'),
    ('Ngày đi sai', 'ngayDi trước hoặc bằng ngayDen', '400'),
    ('Giảm sức chứa', 'Đặt 3 khách, gọi lại GET xác nhận; sửa phòng khach=1', '409'),
    ('Số sao sai', 'saoBinhLuan=6 hoặc 0', '400'),
    ('Nội dung rỗng', 'noiDung="" hoặc chỉ chứa khoảng trắng', '400'),
    ('Sai kiểu dữ liệu', 'soLuongKhach="2" thay cho số 2', '400'),
    ('Ảnh không hợp lệ', 'Không chọn file / tệp giả ảnh / ảnh trên 5 MB', '400'),
    ('Bản ghi không tồn tại', 'GET chi tiết ID vừa xóa, ví dụ vị trí hoặc đặt phòng', '404'),
    ('Xóa dữ liệu có liên kết', 'Xóa vị trí còn phòng hoặc phòng còn bình luận/đặt phòng', '409'),
])
p('Response lỗi ví dụ (không phải log đã deploy):')
code(json.dumps({'statusCode': 409, 'message': 'Sức chứa mới nhỏ hơn số khách của đặt phòng hiện có.', 'content': None}, ensure_ascii=False, indent=2))
p('Một số thông báo validation tương ứng: “Số sao bình luận phải nhỏ hơn hoặc bằng 5.”; “Nội dung bình luận không được để trống.”; “Địa chỉ email là thông tin bắt buộc.” Nhiều lỗi được nối bằng dấu chấm phẩy.')

doc.add_heading('6. Dọn dữ liệu kiểm thử', 1)
for text in [
    'Dùng token USER A hoặc ADMIN: xóa các bình luận đã tạo (API 36).',
    'Xóa tất cả đặt phòng đã tạo, kể cả đặt phòng liền kề nếu đã thử (API 31).',
    'Chuyển token ADMIN: xóa phòng test (API 25), sau đó xóa vị trí test (API 17).',
    'Xóa người dùng test quản trị (API 10). Nếu muốn dọn USER A/B, dùng DELETE /api/users với query id tương ứng sau khi đã dọn dữ liệu liên quan.',
    'Chỉ xóa dữ liệu đã tạo trong lượt chấm; giữ tài khoản ADMIN demo. Xóa xong không dùng lại ID cũ cho lượt mới.',
]:
    p(text, 'List Number')

doc.add_heading('7. Xử lý tình huống khi chấm', 1)
table(['Hiện tượng', 'Cách kiểm tra'], [
    ('Không truy cập Swagger', 'Kiểm tra đúng URL deploy và liên hệ học viên; không chuyển sang localhost.'),
    ('401', 'Đăng nhập lại, thay token trong Authorize. Token hết hạn không phải lỗi dữ liệu.'),
    ('403', 'Kiểm tra token ADMIN/USER và ID người sở hữu. ID người dùng không mặc định bằng 1.'),
    ('400 với trường đặt phòng khi đang tạo phòng', 'Kiểm tra Request URL: tạo phòng /api/phong-thue; đặt phòng /api/dat-phong.'),
    ('Body không được đọc', 'Chọn application/json, nhập JSON đầy đủ và tải lại Swagger nếu cần.'),
    ('Sửa khach=1 vẫn 200', 'GET lại đặt phòng ngay lúc test; chỉ bị chặn khi còn bản ghi cùng maPhong có soLuongKhach lớn hơn 1.'),
    ('Ảnh trả về đường dẫn tương đối', 'Ghép với origin backend deploy, không phải origin trang frontend hoặc localhost.'),
    ('500 hoặc phản hồi không đúng tài liệu', 'Ghi endpoint, method, body, mã HTTP, thời điểm và vai trò tài khoản. Gửi cho học viên, không công khai token.'),
])
doc.add_heading('8. Phiếu ghi nhận kết quả', 1)
table(['Nhóm', 'Số API', 'Đạt / cần kiểm tra', 'Ghi chú'], [('Auth', 2, '', ''), ('Người dùng', 8, '', ''), ('Vị trí', 7, '', ''), ('Phòng thuê', 8, '', ''), ('Đặt phòng', 6, '', ''), ('Bình luận', 5, '', ''), ('Tổng', 36, '', '')])
p('Người chấm: ......................................    Ngày kiểm thử: ......................................')
p('Kết luận / góp ý: ........................................................................................................')

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc.save(OUTPUT)
# Check the generated archive and reopen it; ensure all 36 API headings survived.
check = Document(OUTPUT)
headings = [para.text for para in check.paragraphs if para.style.name == 'Heading 2' and para.text.startswith('API ')]
assert len(headings) == 36, f'Expected 36 API headings, got {len(headings)}'
assert 'localhost' not in check.tables[0].cell(1, 1).text
print(f'Created {OUTPUT.name}: {len(headings)} APIs, {len(check.tables)} tables, {OUTPUT.stat().st_size} bytes.')
