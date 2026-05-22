const { ca, de } = require("zod/v4/locales");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../services/category.service");

// Controller để thêm danh mục mới
const createCategoryController = async (req, res) => {
  try {
    const categoryData = req.body;
    if (
      !categoryData.name ||
      !categoryData.description ||
      !categoryData.image_url
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin danh mục!" });
    }
    const newCategoryId = await createCategory(categoryData);
    res.status(201).json({
      message: "Thêm danh mục thành công!",
      categoryId: newCategoryId,
      categoryData: {
        id: newCategoryId,
        ...categoryData,
      },
    });
  } catch (error) {
    console.error("Lỗi thêm danh mục:", error);
    res.status(500).json({
      message: "Lỗi server rồi ba ơi!",
      error: error.message,
    });
  }
};

// Hiển thị danh sách danh mục
const getAllCategoriesController = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json({
      message: "Lấy danh sách danh mục thành công!",
      categories: categories,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách danh mục:", error);
    res.status(500).json({
      message: "Lỗi server rồi ba ơi!",
      error: error.message,
    });
  }
};

// Cập nhật thông tin danh mục
const updateCategoryController = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryData = req.body;
    const updateDataCategory = await updateCategory(categoryId, categoryData);
    if (updateDataCategory) {
      res.status(200).json({
        message: "Cập nhật danh mục thành công!",
        categoryData: {
          id: categoryId,
          ...categoryData,
        },
      });
    } else {
      res.status(404).json({
        message: "Không tìm thấy danh mục với ID này!",
      });
    }
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    res.status(500).json({
      message: "Lỗi server rồi ba ơi!",
      error: error.message,
    });
  }
};

// Hàm xoá danh mục
const deleteCategoryController = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const deleteDataCategory = await deleteCategory(categoryId);
    if (deleteDataCategory) {
      res.status(200).json({
        message: "Xoá danh mục thành công!",
        deletedCategoryId: categoryId,
      });
    } else {
      res.status(404).json({
        message: "Không tìm thấy danh mục với ID này!",
      });
    }
  } catch (error) {
    console.error("Lỗi xoá danh mục:", error);
    res.status(500).json({
      message: "Lỗi server rồi ba ơi!",
      error: error.message,
    });
  }
};
module.exports = {
  createCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
};
