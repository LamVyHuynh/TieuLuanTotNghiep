const express = require("express");
const router = express.Router();
const { addToCart, getCart } = require("../controllers/cart.controller");
// Middleware xác thực token để đảm bảo người dùng đã đăng nhập
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/add-product-to-cart", authenticateToken, addToCart);

// Lấy danh sách vỏ hàng
router.get("/", authenticateToken, getCart);

module.exports = router;
