// Kết nối database, xử lý logic đăng ký người dùng
const pool = require("../config/db");

// Import thư viện zod để validate dữ liệu email
const { z } = require("zod");

// Thư viện hash password
const bcrypt = require("bcrypt");

async function registerUser(userData) {
  if (!userData) {
    throw new Error("userData is undefined");
  }

  // Nhận dữ liệu người dùng từ controller (được gửi từ client)
  const { full_name, email, phone, password } = userData;
  // console.log(
  //   "service userData controller gửi dữ liệu sai phía trước:",
  //   userData
  // );

  if (!full_name || !email || !password || !phone) {
    throw new Error("Thông tin đăng ký không đầy đủ");
  }

  if (password.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
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

  // Bắt buộc phải dùng bất đồng bộ async/await vì query DB là bất đồng bộ
  //Node.js sẽ gửi yêu cầu qua MySQL Server
  // MySQL Server sẽ xử lý yêu cầu và trả về kết quả
  // Quá trình đó không ngay lập tức được nên phải có await để chờ kết quả trả về
  // Nếu không đợi thì code bên dưới sẽ chạy khi chưa có dữ liệu trả về
  // await pool.query() tức là gửi câu lệnh đi
  //  Đứng chờ kết quả
  // Kết quả trả về rồi gán cho biến rows
  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (rows.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  // Hash password trước khi lưu vào database
  // Hash password thì cần 2 thứ, thứ nhất là password, thứ hai là salt rounds (số lần băm)
  // Hash password là bất động bộ nên dùng await để chờ kết quả trả về
  // Nếu không dùng await thì nó sẽ trả về 1 promise chứ không phải chuỗi password đã hash
  const hashedPassword = await bcrypt.hash(password, 10);

  // Lấy role_id của role 'customer' từ bảng roles
  const [roleRows] = await pool.query("SELECT id FROM roles WHERE name = ?", [
    "customer",
  ]);
  if (roleRows.length === 0) {
    throw new Error("Role 'customer' không tồn tại trong database");
  }
  const role_id = roleRows[0].id;

  console.log("Role ID của role 'customer': ", role_id);
  // console.log("Password đã hash: ", hashedPassword);
  // console.log("userData:", userData);
  // console.log("Full Name:", full_name);
  // console.log("Email:", email);
  // console.log("Phone:", phone);

  // Inser user vào database
  const [insertResult] = await pool.query(
    "INSERT INTO users(full_name, email, phone, password_hash, role_id) VALUES (?,?,?,?,?)",
    [full_name, email, cleanPhone, hashedPassword, role_id]
  );
  return {
    id: insertResult.insertId,
    full_name,
    email,
    phone: cleanPhone,
    role_id,
  };
}

module.exports = { registerUser };
