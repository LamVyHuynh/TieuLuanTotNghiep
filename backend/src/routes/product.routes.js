const express = require("express");

const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteSanPham,
  updateInfoProduct,
} = require("../controllers/product.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Áp dụng middleware authenticateToken cho tất cả route trong router này
router.use(authenticateToken);

// Route để thêm sản phẩm mới
router.post("/add-product", addProduct);

// Route để lấy danh sách sản phẩm
router.get("/", getProducts);

// Route để xoá sản phẩm (nếu cần thiết)
router.delete("/:id", deleteSanPham);

// Route để cập nhật thông tin sản phẩm
router.put("/:id", updateInfoProduct);

module.exports = router;
