const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteMultipleCategories,
} = require("../services/category.service");

const { encodeId, decodeId } = require("../utils/hashid.util");
const { uploadToSupabase } = require("../utils/uploadHelper");

// Controller để thêm danh mục mới
const createCategoryController = async (req, res) => {
  try {
    const categoryData = req.body;
    let imageUrl = ""; // Khởi tạo biến imageUrl

    // Nếu có file ảnh được tải lên, gọi hàm uploadToSupabase để tải ảnh lên Supabase
    if (req.file) {
      imageUrl = await uploadToSupabase(req.file, "categories");
      // Gắn link ảnh trả về từ Supabase vào dữ liệu danh mục
      categoryData.image_url = imageUrl;
    }

    if (!categoryData.name || !categoryData.description || !imageUrl) {
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

    // Nếu có file ảnh được tải lên, gọi hàm uploadToSupabase để tải ảnh lên Supabase
    if (req.file) {
      const imageUrl = await uploadToSupabase(req.file, "categories");
      categoryData.image_url = imageUrl; // Cập nhật đường dẫn ảnh mới vào dữ liệu danh mục
    }

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

    const deleteDataCategoryName = await deleteCategory(categoryId); // Xóa bằng Số

    if (deleteDataCategoryName) {
      res.status(200).json({
        message: `Đã xoá danh mục "${deleteDataCategoryName}" thành công!`,
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

// Xoá nhiều danh mục cùng lúc
const bulkDeleteCategories = async (req, res) => {
  try {
    const { ids } = req.body;
    console.log("Received categoryIds for bulk delete:", ids);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn ít nhất 1 danh mục để xoá!" });
    }

    // Giải mã tất cả ID danh mục từ chữ sang số
    const realCategoryIds = ids.map((id) => decodeId(id));
    if (realCategoryIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Dữ liệu ID danh mục không hợp lệ!" });
    }

    // Gọi service để xoá nhiều danh mục cùng lúc
    const { deletedCount, deletedNames } =
      await deleteMultipleCategories(realCategoryIds);

    // Xử lý chuỗi thông minh y hệt bên Users
    let namesString = "";
    if (deletedNames.length <= 3) {
      namesString = deletedNames.join(", ");
    } else {
      namesString =
        deletedNames.slice(0, 3).join(", ") +
        `... và ${deletedNames.length - 3} mục khác`;
    }
    res.status(200).json({
      message: `Đã xóa thành công danh mục: ${namesString}`, // Câu thông báo có tên
      deletedCategoryIds: ids,
    });
  } catch (error) {
    console.error("Lỗi xoá hàng loạt:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xoá hàng loạt!",
      error: error.message,
    });
  }
};

module.exports = {
  createCategoryController,
  getAllCategoriesController,
  updateCategoryController,
  deleteCategoryController,
  bulkDeleteCategories,
};
