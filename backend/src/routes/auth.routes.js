const express = require("express");
const router = express.Router();

// Import cỗ máy multer để xử lý file ảnh
const upload = require("../config/uploadConfig");

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
  updateAvatar,
  googleLogin,
  facebookLogin,
} = require("../controllers/auth.controller");

const { loginRateLimiter } = require("../middlewares/rateLimit.middleware");
const {
  authenticateToken,
  isAdmin,
} = require("../middlewares/auth.middleware");
// --- KHU VỰC CÔNG CỘNG (Không cần đăng nhập) ---
router.post("/register", upload.single("avatar_file"), register);
router.post("/login", loginRateLimiter, login);
// Tạo đường dẫn API để Frontend gọi xuống
// Khi Frontend gọi POST tới '/google', hàm googleLogin sẽ được chạy
router.post("/google", googleLogin);

// Tạo đường dẫn API để Frontend gọi xuống
// Khi Frontend gọi POST tới '/facebook', hàm facebookLogin sẽ được chạy
router.post("/facebook", facebookLogin);
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

// Route cập nhật ảnh đại diện
// upload.single("avatar_file") đứng ra làm "bảo vệ", hứng file ảnh rồi mới cho chạy vào updateAvatar
// Nhận hàng với nhãn dán là "avatar_file" từ frontend, multer sẽ hứng file ảnh này và lưu tạm vào RAM (do cấu hình ở uploadConfig.js là memoryStorage)
router.put("/users/:id/avatar", upload.single("avatar_file"), updateAvatar);

module.exports = router;
