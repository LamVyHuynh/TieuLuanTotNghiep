const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const {
  createOrder,
  getOrdersHistory,
  getAllOrdersAdmin,
} = require("../controllers/order.controller");

// Route để tạo đơn hàng mới
router.post("/checkout", authenticateToken, createOrder);

// Route để lấy lịch sử đơn hàng
router.get("/history", authenticateToken, getOrdersHistory);

// Route để lấy tất cả đơn hàng cho admin
router.get("/admin/all", authenticateToken, getAllOrdersAdmin);

module.exports = router;
