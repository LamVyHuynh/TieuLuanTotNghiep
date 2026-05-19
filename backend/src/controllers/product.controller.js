const {
  createProduct,
  getAllProducts,
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

    // 2. Ép kiểu dữ liệu để an toàn cho SQL (Carbs chứ không phải Cabs nhé mạy)
    const cleanProductData = {
      ...productData,
      price: parseFloat(productData.price),
      discount_price: productData.discount_price
        ? parseFloat(productData.discount_price)
        : null,
      stock_quantity: parseInt(productData.stock_quantity) || 0,
      calories: parseInt(productData.calories) || 0,
      protein: parseFloat(productData.protein) || 0, // Dùng float cho chính xác
      carbs: parseFloat(productData.carbs) || 0, // Sửa cabs thành carbs
      fat: parseFloat(productData.fat) || 0,
    };

    // 3. Gọi service để lưu vào DB
    const newProductId = await createProduct(cleanProductData);

    // 4. Trả về kết quả (dùng đúng tên biến newProductId)
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

module.exports = {
  addProduct,
  getProducts,
};
