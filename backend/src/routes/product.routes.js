const express = require("express");

const router = express.Router();
const { addProduct } = require("../controllers/product.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Áp dụng middleware authenticateToken cho tất cả route trong router này
router.use(authenticateToken);

// Route để thêm sản phẩm mới
router.post("/add-product", addProduct);

module.exports = router;
