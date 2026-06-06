const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const { createOrder } = require("../controllers/order.controller");

// Route để tạo đơn hàng mới
router.post("/checkout", authenticateToken, createOrder);

module.exports = router;
