const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../services/category.service");

const { encodeId, decodeId } = require("../../utils/hashid.util");

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
    const newCategoryId = await createCategory(categoryData); // Trả về ID thật (số)

    res.status(201).json({
      message: "Thêm danh mục thành công!",
      categoryId: encodeId(newCategoryId), // BỌC THÉP CHIỀU RA
      categoryData: {
        id: encodeId(newCategoryId), // BỌC THÉP CHIỀU RA
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
    const categories = await getAllCategories(); // Lấy từ DB ra id thật

    // BỌC THÉP CHIỀU RA: Lặp qua và mã hoá toàn bộ id_category
    const safeCategories = categories.map((cat) => ({
      ...cat,
      id_category: encodeId(cat.id_category),
    }));

    res.status(200).json({
      message: "Lấy danh sách danh mục thành công!",
      categories: safeCategories, // Trả mảng đã mã hoá
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
    // DỊCH MÃ CHIỀU VÀO TỪ URL (Chữ -> Số)
    const categoryId = decodeId(req.params.id);

    if (!categoryId) {
      return res.status(400).json({ message: "ID danh mục không hợp lệ!" });
    }

    const categoryData = req.body;
    const updateDataCategory = await updateCategory(categoryId, categoryData); // Chọc xuống DB bằng Số

    if (updateDataCategory) {
      res.status(200).json({
        message: "Cập nhật danh mục thành công!",
        categoryData: {
          id: req.params.id, // Trả lại cái ID bằng chữ cho Frontend nó dùng
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
    // DỊCH MÃ CHIỀU VÀO TỪ URL (Chữ -> Số)
    const categoryId = decodeId(req.params.id);

    if (!categoryId) {
      return res.status(400).json({ message: "ID danh mục không hợp lệ!" });
    }

    const deleteDataCategory = await deleteCategory(categoryId); // Xóa bằng Số

    if (deleteDataCategory) {
      res.status(200).json({
        message: "Xoá danh mục thành công!",
        deletedCategoryId: req.params.id, // Trả về ID chữ để FE biết đường xóa UI
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
