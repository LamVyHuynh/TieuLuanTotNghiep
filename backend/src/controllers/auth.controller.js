const { registerUser } = require("../services/auth.service");
const register = async (req, res) => {
  const userData = req.body;

  // console.log("user data ở controller (postman gửi dữ liệu qua):", userData);
  try {
    // Lấy kết quả xử lí từ service
    const result = await registerUser(userData);

    // lệnh throw này dùng để thử lỗi, nếu gặp  thì tất cả những câu lệnh phía dưới nó đều không chạy
    //  Nó sẽ dừng lại ngay lập tức và chuyển qua catch để xử lý lỗi
    // throw new Error("This is a test error");

    res.status(201).json({
      message: "Register successful",
      data: result,
    });
  } catch (error) {
    if (
      error.message === "thiếu thông tin đăng ký" ||
      error.message === "Mật khẩu phải có ít nhất 8 ký tự" ||
      error.message === "Mật khẩu và xác nhận mật khẩu không khớp" ||
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
      error.message === "Số điện thoại đã tồn tại"
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
module.exports = { register };
