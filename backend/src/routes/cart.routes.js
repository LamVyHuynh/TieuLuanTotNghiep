const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCart,
} = require("../controllers/cart.controller");
// Middleware xác thực token để đảm bảo người dùng đã đăng nhập
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/add-product-to-cart", authenticateToken, addToCart);
router.put("/update-cart", authenticateToken, updateCart);

// Lấy danh sách vỏ hàng
router.get("/", authenticateToken, getCart);

module.exports = router;
