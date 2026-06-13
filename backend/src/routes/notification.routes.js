const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const {
  getNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

// Lấy danh sách thông báo của User đang đăng nhập
router.get("/", authenticateToken, getNotifications);

// Đánh dấu 1 thông báo là đã đọc
router.put("/:id/read", authenticateToken, markAsRead);

// Xoá thông báo
router.delete("/:id", authenticateToken, deleteNotification);

module.exports = router;
