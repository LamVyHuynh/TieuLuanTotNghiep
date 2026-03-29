// import jwt from jsonwebtoken";
const jwt = require("jsonwebtoken");
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Tácch token ra khỏi header
  // Thường token nó sẽ có dịnh dạng Bearer token, nên mình sẽ tách nó ra để lấy token thôi
  const token = authHeader && authHeader.split(" ")[1];

  // Kiểm tra xem token có tồn tại không
  if (!token) {
    return res.status(401).json({
      message: "Token không tồn tại",
    });
  }

  // Kiểm tra token có hợp lệ không vằng jwt.vergify()
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        message: "Token không hợp lệ, truy cập bị từ chối",
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

module.exports = { authenticateToken };
