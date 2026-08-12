const express = require("express");
const router = express.Router();

const upload = require("../config/uploadConfig");
const {
  createCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
  bulkDeleteCategories,
} = require("../controllers/category.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Áp dụng middleware authenticateToken cho tất cả route trong router này
// router.use(authenticateToken);

// Route hiển thị danh sách danh mục
router.get("/", getAllCategoriesController);

// Route thêm mới danh mục
router.post(
  "/add-category",
  authenticateToken,
  upload.single("image"),
  createCategoryController,
);

// Route cập nhật thông tin danh mục
router.put(
  "/:id",
  authenticateToken,
  upload.single("image"),
  updateCategoryController,
);

// Route xoá nhiều danh mục cùng lúc
router.delete("/bulk-delete", authenticateToken, bulkDeleteCategories);

// Route xoá danh mục
router.delete("/:id", authenticateToken, deleteCategoryController);

module.exports = router;
