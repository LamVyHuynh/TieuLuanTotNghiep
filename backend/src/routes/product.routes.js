const express = require("express");

// import
const upload = require("../config/uploadConfig");

const router = express.Router();
const {
  addProduct,
  getProducts,
  deleteSanPham,
  updateInfoProduct,
  getProductDetail,
  importProducts,
  bulkDeleteProducts,
} = require("../controllers/product.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Áp dụng middleware authenticateToken cho tất cả route trong router này
// router.use(authenticateToken);

// Route để lấy danh sách sản phẩm
router.get("/", getProducts);

// Route để thêm sản phẩm mới
router.post(
  "/add-product",
  authenticateToken,
  upload.single("image"),
  addProduct,
);

// Route để cập nhật thông tin sản phẩm
router.put(
  "/:id",
  authenticateToken,
  upload.single("image"),
  updateInfoProduct,
);

// Route để xoá nhiều sản phẩm cùng lúc
router.delete("/bulk-delete", authenticateToken, bulkDeleteProducts);

// Route để xoá sản phẩm (nếu cần thiết)
router.delete("/:id", authenticateToken, deleteSanPham);

// Route để import sản phẩm từ file Excel
router.post(
  "/import",
  authenticateToken,
  upload.single("file"), // Multer sẽ đón file với cái nhãn tên là "file"
  importProducts,
);

// Route để lấy chi tiết sản phẩm theo ID
router.get("/:id", getProductDetail);

module.exports = router;
