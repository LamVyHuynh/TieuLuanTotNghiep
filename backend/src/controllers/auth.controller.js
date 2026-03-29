const { registerUser, loginUser } = require("../services/auth.service");

// Thư viện jsonwebtoken có 3 mục đích chính:
//  1. Tạo token:  jsonwebtoken.sign() tạo ra token mới dựa trên payload (thông tin người dùng) và secret key (để đảm bảo tính bảo mật của token).
//  Vào còn thêm 1 chỉ số nữa là expiresIn để xác định thời gian hết hạn của token
//  Khi đăng nhập thành công sẽ tạo ra jwt
// 2. Xác thực token: jsonwebtoken.verify() được dùng để xác thực token đã tạo ra trước đó, xem nó có hợp lệ không?
// backend nhận token từ client gửi lên từ frontend,
// Kiểm tra xem chữ kí token có hợp lệ chưa
// Token có hết hạng chưa
// 3. giải mã token: jsonwebtoken.decode() được dùng để giải mã token mà không cần xác thực
//  Nó sẽ trả về payload (đối tượng chức thông tin người dùng) mà không kiểm tra tính hợp lệ của token
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
  // Lấy dữ liệu người dùng từ request body (dữ liệu được gửi từ client qua postman)
  const userData = req.body;

  // console.log("user data ở controller (postman gửi dữ liệu qua):", userData);
  try {
    // Lấy kết quả xử lí từ service
    const result = await registerUser(userData);

    // Kiểm tra kết quả trả về từ service xem nó có undefined / null hay không
    if (!result) {
      throw new Error("Kết quả trả về từ service không hợp lệ");
    }
    // lệnh throw này dùng để thử lỗi, nếu gặp  thì tất cả những câu lệnh phía dưới nó đều không chạy
    //  Nó sẽ dừng lại ngay lập tức và chuyển qua catch để xử lý lỗi
    // throw new Error("This is a test error");

    res.status(201).json({
      message: "Register successful",
      data: result,
    });
  } catch (error) {
    if (
      error.message === "Thông tin đăng ký không đầy đủ" ||
      error.message === "Mật khẩu phải có ít nhất 8 ký tự" ||
      error.message === "Số điện thoại không được để trống" ||
      error.message === "Số điện thoại chỉ được chứa chữ số" ||
      error.message === "Số điện thoại phải có 10 hoặc 11 chữ số" ||
      error.message === "Email không hợp lệ"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }
    if (
      error.message === "Email đã tồn tại" ||
      error.message === "Số điện thoại đã tồn tại" ||
      error.message === "Role 'customer' không tồn tại" ||
      error.message === "userData is undefined"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginUser(email, password);

    // Kiểm tra kết quả trả về từ service xem nó có undefined hay null không
    if (!result) {
      throw new Error("Kết quả trả về từ service không hợp lệ");
    }

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: result,
    });
  } catch (error) {
    if (error.message === "Email hoặc mật khẩu không đúng") {
      return res.status(401).json({
        message: error.message,
      });
    }
    if (error.message === "Email hoặc mật khẩu không được để trống") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { register, login };
