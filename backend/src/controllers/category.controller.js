const { ca } = require("zod/v4/locales");
const {
  createCategory,
  getAllCategories,
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
      categories,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách danh mục:", error);
    res.status(500).json({
      message: "Lỗi server rồi ba ơi!",
      error: error.message,
    });
  }
};

module.exports = {
  createCategoryController,
  getAllCategoriesController,
};
