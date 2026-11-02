const fieldLabels = {
  id: "Mã định danh",
  name: "Họ tên",
  email: "Địa chỉ email",
  password: "Mật khẩu",
  phone: "Số điện thoại",
  birthday: "Ngày sinh",
  gender: "Giới tính",
  role: "Vai trò",
  avatar: "Đường dẫn ảnh đại diện",
  tenViTri: "Tên vị trí",
  tinhThanh: "Tỉnh thành",
  quocGia: "Quốc gia",
  hinhAnh: "Đường dẫn hình ảnh",
  tenPhong: "Tên phòng",
  khach: "Sức chứa của phòng",
  phongNgu: "Số phòng ngủ",
  giuong: "Số giường",
  phongTam: "Số phòng tắm",
  moTa: "Mô tả phòng",
  giaTien: "Giá phòng",
  mayGiat: "Tiện nghi máy giặt",
  banLa: "Tiện nghi bàn là",
  tivi: "Tiện nghi tivi",
  dieuHoa: "Tiện nghi điều hòa",
  wifi: "Tiện nghi wifi",
  bep: "Tiện nghi bếp",
  doXe: "Tiện nghi đỗ xe",
  hoBoi: "Tiện nghi hồ bơi",
  banUi: "Tiện nghi bàn ủi",
  maViTri: "Mã vị trí",
  maPhong: "Mã phòng",
  maNguoiDung: "Mã người dùng",
  MaNguoiDung: "Mã người dùng",
  MaPhong: "Mã phòng",
  maNguoiBinhLuan: "Mã người bình luận",
  ngayDen: "Ngày đến",
  ngayDi: "Ngày đi",
  soLuongKhach: "Số lượng khách",
  ngayBinhLuan: "Ngày bình luận",
  noiDung: "Nội dung bình luận",
  saoBinhLuan: "Số sao bình luận",
  pageIndex: "Số trang",
  pageSize: "Số bản ghi mỗi trang",
  keyword: "Từ khóa tìm kiếm",
};

export function validationMessage(issue, req) {
  const field = issue.path[0];
  const label =
    fieldLabels[field] || (field ? "Trường dữ liệu" : "Mã định danh");
  const value = field
    ? (req.body?.[field] ?? req.query?.[field] ?? req.params?.[field])
    : undefined;
  switch (issue.code) {
    case "invalid_type": {
      if (!field && issue.expected === "object")
        return "Nội dung yêu cầu phải là một đối tượng JSON hợp lệ.";
      if (field && value === undefined)
        return `${label} là thông tin bắt buộc.`;
      const types = {
        string: "chuỗi ký tự",
        number: "số",
        int: "số nguyên",
        boolean: "giá trị true hoặc false",
        object: "đối tượng JSON",
      };
      return `${label} phải là ${types[issue.expected] || "dữ liệu đúng kiểu"}.`;
    }
    case "too_small":
      if (issue.origin === "string")
        return issue.minimum === 1
          ? `${label} không được để trống.`
          : `${label} phải có ít nhất ${issue.minimum} ký tự.`;
      return `${label} phải ${issue.inclusive ? "lớn hơn hoặc bằng" : "lớn hơn"} ${issue.minimum}.`;
    case "too_big":
      if (issue.origin === "string")
        return `${label} không được vượt quá ${issue.maximum} ký tự.`;
      return `${label} phải ${issue.inclusive ? "nhỏ hơn hoặc bằng" : "nhỏ hơn"} ${issue.maximum}.`;
    case "invalid_format":
      if (field === "email") return "Địa chỉ email không đúng định dạng.";
      if (field === "birthday")
        return "Ngày sinh phải là ngày hợp lệ theo định dạng YYYY-MM-DD.";
      if (["ngayDen", "ngayDi", "ngayBinhLuan"].includes(field))
        return `${label} phải là ngày giờ hợp lệ có múi giờ, ví dụ 2030-12-01T14:00:00+07:00.`;
      return `${label} không đúng định dạng.`;
    case "invalid_value":
      return field === "role"
        ? "Vai trò chỉ được nhận giá trị USER hoặc ADMIN."
        : `${label} có giá trị không hợp lệ.`;
    case "custom":
      // Custom messages are authored in Vietnamese in the application schemas.
      return issue.message;
    default:
      return `${label} không hợp lệ.`;
  }
}
