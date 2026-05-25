const express = require("express");
const router = express.Router();

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

const { loginRateLimiter } = require("../middlewares/rateLimit.middleware");
const {
  authenticateToken,
  isAdmin,
} = require("../middlewares/auth.middleware");
const { u } = require("framer-motion/client");

// --- KHU VỰC CÔNG CỘNG (Không cần đăng nhập) ---
router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// --- KHU VỰC YÊU CẦU ĐĂNG NHẬP (Authenticate Token) ---
router.use(authenticateToken);

// Route cho user thường
router.get("/me", getMe);
router.put("/users/:id/update-user", updateUser);
router.put("/users/:id/change-password", changePassword);

// --- KHU VỰC DÀNH RIÊNG CHO ADMIN (Kẹp thêm isAdmin) ---
// Chỉ Admin mới được vào các link dưới này
router.get("/logs", fetchAllLogs);
router.get("/list-users", fetchAllUsers);
router.post("/users/:id/toggle-status", toggleUserLock);
router.delete("/users/:id/delete-user", deleteUser);

module.exports = router;
