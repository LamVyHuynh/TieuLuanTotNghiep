const {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  getProductById,
} = require("../services/product.service");

// Đổi lại tên hàm import cho đúng với file utils của mày nhé
const { encodeId, decodeId } = require("../utils/hashid.util");

const addProduct = async (req, res) => {
  try {
    const productData = req.body;

    // 1. Validate dữ liệu bắt buộc
    if (!productData.name || !productData.price || !productData.id_category) {
      return res.status(400).json({
        message:
          "Thiếu thông tin rồi! Phải có tên, giá, danh mục và cửa hàng nhé!",
      });
    }

    // LƯU Ý: Nếu lúc thêm, React gửi id_category là chuỗi Hash, thì mày phải decodeId(productData.id_category) ở đây.
    // Tạm thời tao giữ nguyên ép kiểu số cho mày:
    const cleanProductData = {
      ...productData,
      id_category:
        typeof productData.id_category === "string"
          ? decodeId(productData.id_category) || productData.id_category
          : productData.id_category,
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

    // 3. Gọi service để lưu vào DB (nhận về ID thật)
    const newProductId = await createProduct(cleanProductData);

    // 4. MÃ HOÁ ID TRƯỚC KHI TRẢ VỀ CHO REACT
    res.status(201).json({
      message:
        "Thêm sản phẩm thành công! Database đã nhận đủ chỉ số dinh dưỡng.",
      productId: encodeId(newProductId), // Encode chỗ này!
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
    const products = await getAllProducts(); // Trả về mảng chứa id thật

    // BỌC THÉP CHIỀU RA: Mã hoá toàn bộ id_product (và id_category)
    const safeProducts = products.map((item) => ({
      ...item,
      id_product: encodeId(item.id_product),
      id_category: encodeId(item.id_category),
    }));

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công!",
      products: safeProducts, // Trả mảng đã mã hoá về
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
    const productId = decodeId(req.params.id); // DỊCH CHIỀU VÀO TỪ URL
    if (!productId)
      return res.status(400).json({ message: "ID không hợp lệ!" });

    const success = await deleteProduct(productId);
    if (success) {
      res.status(200).json({
        message: "Xoá sản phẩm thành công!",
        deletedProductId: req.params.id, // Trả về lại cái ID chuỗi để UI biết đường xoá
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
    const productId = decodeId(req.params.id); // DỊCH CHIỀU VÀO TỪ URL
    if (!productId)
      return res.status(400).json({ message: "ID không hợp lệ!" });

    const productData = req.body;

    // LƯU Ý: Decode id_category nếu client gửi lên chữ
    const safeUpdateData = { ...productData };
    if (typeof safeUpdateData.id_category === "string") {
      safeUpdateData.id_category =
        decodeId(safeUpdateData.id_category) || safeUpdateData.id_category;
    }

    const success = await updateProduct(productId, safeUpdateData);
    if (success) {
      res.status(200).json({
        message: "Cập nhật sản phẩm thành công!",
        data: { id_product: req.params.id, ...productData }, // Trả về ID chuỗi cho React
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

const getProductDetail = async (req, res) => {
  try {
    const realProductID = decodeId(req.params.id); // DỊCH CHIỀU VÀO TỪ URL

    if (!realProductID) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    const product = await getProductById(realProductID);

    if (product) {
      // BỌC THÉP CHIỀU RA: Mã hoá ID trước khi gửi cho FrontEnd
      const safeProduct = {
        ...product,
        id_product: encodeId(product.id_product),
        id_category: encodeId(product.id_category),
      };

      res.status(200).json({
        message: "Lấy chi tiết sản phẩm thành công!",
        product: safeProduct,
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy chi tiết sản phẩm!",
      error: error.message,
    });
  }
};

module.exports = {
  addProduct,
  getProducts,
  deleteSanPham,
  updateInfoProduct,
  getProductDetail,
};
