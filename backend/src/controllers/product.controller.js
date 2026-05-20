const {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
} = require("../services/product.service");

const addProduct = async (req, res) => {
  try {
    const productData = req.body;

    // 1. Validate dữ liệu bắt buộc
    if (
      !productData.name ||
      !productData.price ||
      !productData.id_Store ||
      !productData.id_Category
    ) {
      return res.status(400).json({
        message:
          "Thiếu thông tin rồi! Phải có tên, giá, danh mục và cửa hàng nhé!",
      });
    }

    // 2. Ép kiểu dữ liệu để an toàn cho SQL
    const cleanProductData = {
      ...productData,
      price: parseFloat(productData.price),
      discount_price: productData.discount_price
        ? parseFloat(productData.discount_price)
        : null,
      stock_quantity: parseInt(productData.stock_quantity) || 0,
      calories: parseInt(productData.calories) || 0,
      protein: parseFloat(productData.protein) || 0,
      carbs: parseFloat(productData.carbs) || 0,
      fat: parseFloat(productData.fat) || 0,
    };

    // 3. Gọi service để lưu vào DB
    const newProductId = await createProduct(cleanProductData);

    // 4. Trả về kết quả
    res.status(201).json({
      message:
        "Thêm sản phẩm thành công! Database đã nhận đủ chỉ số dinh dưỡng.",
      productId: newProductId,
    });
  } catch (error) {
    console.error("Lỗi thêm sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi server rồi ba ơi!",
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công!",
      products,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách món!", error: error.message });
  }
};

// Xoá sản phẩm
const deleteSanPham = async (req, res) => {
  try {
    const productId = req.params.id;
    const success = await deleteProduct(productId);
    if (success) {
      res.status(200).json({
        message: "Xoá sản phẩm thành công!",
        deletedProductId: productId, // Trả về ID để frontend cập nhật UI tức thì
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm để xoá!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi xoá sản phẩm!", error: error.message });
  }
};

const updateInfoProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;

    // Gọi service cập nhật
    const success = await updateProduct(productId, productData);
    if (success) {
      res.status(200).json({
        message: "Cập nhật sản phẩm thành công!",
        data: { id_product: productId, ...productData }, // Trả về data mới để frontend đồng bộ
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm để cập nhật!" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi cập nhật sản phẩm!",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  deleteSanPham,
  updateInfoProduct,
};
