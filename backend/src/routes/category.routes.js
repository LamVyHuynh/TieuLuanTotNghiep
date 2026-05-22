const express = require("express");
const router = express.Router();

const {
  createCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
} = require("../controllers/category.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Áp dụng middleware authenticateToken cho tất cả route trong router này
router.use(authenticateToken);

// Route thêm mới danh mục
router.post("/add-category", createCategoryController);

// Route hiển thị danh sách danh mục
router.get("/", getAllCategoriesController);

// Route cập nhật thông tin danh mục
router.put("/:id", updateCategoryController);

// Route xoá danh mục
router.delete("/:id", deleteCategoryController);

module.exports = router;
