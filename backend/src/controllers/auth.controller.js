const { registerUser } = require("../services/auth.service");
const register = async (req, res) => {
  const userData = req.body;

  console.log("user data ở controller (postman gửi dữ liệu qua):", userData);
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
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = { register };
