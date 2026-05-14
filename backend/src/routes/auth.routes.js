// import thư viện express vào file
// vì router là tính năng của express nên muốn tạo route thì phải lấy express trước
// Hiểu đơn giản: Dùng đồ của Express thì phải require('express)
const express = require("express");

// Tạo ra 1 router riêng
// Router dùng để chứa các route liên quan đến auth (đăng ký, đăng nhập, lấy thông tin người dùng,...)
// Hiểu đơn giản: router là 1 bộ các router con
const router = express.Router();

// Import register từ file auth.controller.js
// Chỗ {register} có nghĩa là  auth.controller.js đang export object có key register
// Hiểu đơn giản:
// - route không tự xử lý đăng ký
// - route chỉ gọi hàm register của controller
// 1. Import hàm từ CONTROLLER, đừng import từ Service
const {
  register,
  login,
  logout,
  getMe,
  fetchAllLogs,
  refreshToken,
  fetchAllUsers,
  toggleUserLock,
  deleteUser,
  updateUser,
  changePassword,
} = require("../controllers/auth.controller");

// IMPORT rate limit middleware vừa tạo
const { loginRateLimiter } = require("../middlewares/rateLimit.middleware");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { getAllUsers } = require("../services/auth.service");

// - Khai báo 1 route dạng POST
// - đường dẫn là /register (tức là http://localhost:5000/auth/register)
// - khi client gửi request tới đây thì gọi hàm register
router.post("/register", register);

// lấy hàm login tử controller
// Khi thấy route dạng POST
//  đường dẫn là /login (tức là http://localhost:5000/auth/login)
// khi client gửi request tới đây thì gọi hàm login
router.post("/login", loginRateLimiter, login);

// refresh token
router.post("/refresh-token", refreshToken);

// logout
router.post("/logout", logout);

router.use(authenticateToken); // Áp dụng middleware authenticateToken cho tất cả route sau dòng này

// Lấy thông tin người dùng hiện tại
router.get("/me", getMe);

// Lấy tất cả log đăng nhập
router.get("/logs", fetchAllLogs);

// Lấy tất cả người dùng (dành cho admin)
router.get("/list-users", fetchAllUsers);

// Khóa/Mở khóa người dùng (dành cho admin)
router.post("/users/:id/toggle-status", toggleUserLock);

// Admin xoá user
router.delete("/users/:id/delete-user", deleteUser);

// Cập nhật thông tin người dùng (dành cho admin)
router.put("/users/:id/update-user", updateUser);

// Cập nhật mật khẩu người dùng (dành cho admin)
router.put("/users/:id/change-password", changePassword);

// export router ra ngoài để server.js có thể import và dùng
module.exports = router;
