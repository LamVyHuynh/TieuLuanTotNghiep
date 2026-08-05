const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const {
  createOrder,
  getOrdersHistory,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getDashboardReview,
  getReportsAdmin,
  createMomoPayment,
  checkMomoPaymentStatus,
} = require("../controllers/order.controller");

// Route để tạo đơn hàng mới
router.post("/checkout", authenticateToken, createOrder);

// Route để lấy lịch sử đơn hàng
router.get("/history", authenticateToken, getOrdersHistory);

// Route để lấy tất cả đơn hàng cho admin
router.get("/admin/all", authenticateToken, getAllOrdersAdmin);

// Route để cập nhật trạng thái đơn hàng (dùng cho admin)
router.put("/admin/:id/status", authenticateToken, updateOrderStatusAdmin);

// Route để lấy thống kê đánh giá cho dashboard admin
router.get("/admin/dashboard", authenticateToken, getDashboardReview);

// Route để lấy báo cáo chi tiết cho admin
router.get("/admin/reports", authenticateToken, getReportsAdmin);

// Route để tạo thanh toán Momo
router.post("/momo-payment", authenticateToken, createMomoPayment);

// Route để kiểm tra trạng thái thanh toán Momo
router.post("/momo-check-status", authenticateToken, checkMomoPaymentStatus);

module.exports = router;
