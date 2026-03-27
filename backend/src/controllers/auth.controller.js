const { registerUser } = require("../services/auth.service");
const { loginUser } = require("../services/auth.service");
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
      data: result,
    });
  } catch (error) {
    if (error.message === "Email hoặc mật khẩu không đúng") {
      return res.status(400).json({
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
