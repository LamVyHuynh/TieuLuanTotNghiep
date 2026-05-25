const express = require("express");

const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteSanPham,
  updateInfoProduct,
  getProductDetail,
} = require("../controllers/product.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Áp dụng middleware authenticateToken cho tất cả route trong router này
// router.use(authenticateToken);

// Route để lấy danh sách sản phẩm
router.get("/", getProducts);

// Route để thêm sản phẩm mới
router.post("/add-product", authenticateToken, addProduct);

// Route để xoá sản phẩm (nếu cần thiết)
router.delete("/:id", authenticateToken, deleteSanPham);

// Route để cập nhật thông tin sản phẩm
router.put("/:id", authenticateToken, updateInfoProduct);

// Route để lấy chi tiết sản phẩm theo ID
router.get("/:id", getProductDetail);

module.exports = router;
