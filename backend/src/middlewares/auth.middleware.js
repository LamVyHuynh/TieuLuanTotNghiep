// import jwt from jsonwebtoken";
const jwt = require("jsonwebtoken");
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Tách token ra khỏi header
  // Thường token nó sẽ có dịnh dạng Bearer + token, nên mình sẽ tách nó ra để lấy token thôi
  const token = authHeader && authHeader.split(" ")[1];

  // Bước 1: Kiểm tra xem có gửi token lên không
  if (!token) {
    return res.status(401).json({
      type: "TOKEN_MISSING",
      message: "Không tìm thấy token, vui lòng đăng nhập lại.",
    });
  }

  // Bước 2: Xác thực token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Bước 3: Phân loại lỗi dựa trên err.name của jsonwebtoken

      // Trường hợp 1: Token hết hạn
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          type: "TOKEN_EXPIRED",
          message: "Token đã hết hạn, vui lòng đăng nhập lại.",
        });
      }

      // Trường hợp 2: Token sai chữ ký (bị sửa đổi) hoặc không hợp lệ
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          type: "TOKEN_INVALID",
          message: "Token không hợp lệ hoặc đã bị thay đổi.",
        });
      }

      // Trường hợp 3: Các lỗi khác liên quan đến JWT
      return res.status(403).json({
        type: "TOKEN_ERROR",
        message: "Xác thực token thất bại.",
      });
    }
    // Nếu token hợp lệ thì lưu thông tin người dùng vào req.user để các route handler sau này có thể dùng được
    req.user = user;
    // Gọi next() để chuyển sang middleware hoặc route handler tiếp theo
    // Thực hiện các bước sau khi xác thực token thành công,
    //  ví dụ như lấy thông tin người dùng từ database, kiểm tra quyền truy cập,...
    next();
  });
}

module.exports = { authenticateToken, isAdmin };
