const express = require("express");
const router = express.Router();
const { addToCart } = require("../controllers/cart.controller");
// Middleware xác thực token để đảm bảo người dùng đã đăng nhập
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/add-product-to-cart", authenticateToken, addToCart);

module.exports = router;
