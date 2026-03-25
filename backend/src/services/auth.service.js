// Kết nối database, xử lý logic đăng ký người dùng
const pool = require("../config/db");

// Import thư viện zod để validate dữ liệu email
const { z } = require("zod");

async function registerUser(userData) {
  if (!userData) {
    throw new Error("userData is undefined");
  }
  // Nhận dữ liệu người dùng từ controller (được gửi từ client)
  const { full_name, email, phone, password, confirm_password } = userData;
  console.log(
    "service userData controller gửi dữ liệu sai phía trước:",
    userData
  );

  if (!full_name || !email || !password || !confirm_password || !phone) {
    throw new Error("thiếu thông tin đăng ký");
  }

  if (password.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (password !== confirm_password) {
    throw new Error("Mật khẩu và xác nhận mật khẩu không khớp");
  }

  // Check Phone
  const cleanPhone = phone.trim(); // Loại bỏ khoảng trắng ở đầu và cuối;
  if (!cleanPhone) {
    throw new Error("Số điện thoại không được để trống");
  }
  if (!/^\d+$/.test(cleanPhone)) {
    throw new Error("Số điện thoại chỉ được chứa chữ số");
  }
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    throw new Error("Số điện thoại phải có 10 hoặc 11 chữ số");
  }
  // Kiểm tra trùng số điện thoại
  const [phoneRows] = await pool.query("SELECT id FROM users WHERE phone = ?", [
    cleanPhone,
  ]);
  if (phoneRows.length > 0) {
    throw new Error("Số điện thoại đã tồn tại");
  }

  // Kiểm trang trùng email

  // Kiểm tra định dạng email
  // import thư viện zod để validate dữ liệu
  const emailSchema = z.string().email();

  // safeParse() là một phương thức của Zod để kiểm tra xem dữ liệu có hợp lệ theo schema đã định nghĩa hay không.
  // safeParse() sẽ trả về một đối tượng có dạng { success: boolean, data?: T, error?: ZodError }
  const emailValidation = emailSchema.safeParse(email);
  if (!emailValidation.success) {
    throw new Error("Email không hợp lệ");
  }
  // Bắt buộc phải dùng bất đồng bộ async/await vì  query DB
  //Node.js sẽ gửi yêu cầu qua MySQL Server
  // MySQL Server sẽ xử lý yêu cầu và trả về kết quả
  // Quá trình đó không ngay lập tức được nên phải có await để chờ kết quả trả về
  // Nếu không đợi thì code bên dưới sẽ chạy khi chưa có dữ liệu trả về\
  // await pool.query() tức là gửi câu lệnh đi
  //  Đứng chờ kết quả
  // Kết quả trả về rồi gán cho email_check
  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (rows.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  console.log("userData:", userData);
  console.log("Full Name:", full_name);
  console.log("Email:", email);
  console.log("Phone:", phone);

  return { full_name, email, phone, password, confirm_password };
}

module.exports = { registerUser };
