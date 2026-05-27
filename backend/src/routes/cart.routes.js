const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
} = require("../controllers/cart.controller");
// Middleware xác thực token để đảm bảo người dùng đã đăng nhập
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/add-product-to-cart", authenticateToken, addToCart);
router.put("/update-cart", authenticateToken, updateCart);

// Lấy danh sách vỏ hàng
router.get("/", authenticateToken, getCart);

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/remove/:id", authenticateToken, removeFromCart);

module.exports = router;
