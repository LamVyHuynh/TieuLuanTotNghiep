const {
  addItemToCart,
  getCartItems,
  updateCartItem,
  removeCartItem,
} = require("../services/cart.service");

// 1. IMPORT MÁY DỊCH MÃ
const { encodeId, decodeId } = require("../../utils/hashid.util");

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id; // UserID lấy từ token, giữ nguyên số thật
    const { id_product, quantity } = req.body; // id_product từ React gửi lên đang là CHỮ (Hash)

    if (!id_product) {
      return res.status(400).json({ message: "Thiếu ID sản phẩm rồi" });
    }

    // 2. GIẢI MÃ ID SẢN PHẨM TRƯỚC KHI LƯU VÀO GIỎ
    const realProductId = decodeId(id_product);
    if (!realProductId) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    // Gọi service với ID thật (số)
    await addItemToCart(userId, realProductId, quantity || 1);

    res.status(200).json({ message: "Thêm sản phẩm vào giỏ hàng thành công" });
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi Server khi thêm vào giỏ!",
      error: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await getCartItems(userId); // Lấy từ DB ra

    // BỌC THÉP TẤT CẢ CÁC THỂ LOẠI ID CÓ TRONG GIỎ HÀNG
    const safeItems = items.map((item) => {
      const safeItem = { ...item };

      // Mã hoá id_product
      if (item.id_product) safeItem.id_product = encodeId(item.id_product);

      // MÃ HOÁ LUÔN CỘT id (Vì bên React đang gọi item.id)
      if (item.id) safeItem.id = encodeId(item.id);

      // Đề phòng DB có cột id_cart
      if (item.id_cart) safeItem.id_cart = encodeId(item.id_cart);

      return safeItem;
    });

    res.status(200).json({
      message: "Lấy giỏ hàng thành công",
      cartItems: safeItems,
    });
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi Server khi lấy giỏ hàng!",
      error: error.message,
    });
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_product, newQuantity } = req.body;

    if (!id_product || newQuantity === undefined) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin sản phẩm hoặc số lượng" });
    }

    // 4. GIẢI MÃ ID SẢN PHẨM ĐỂ CẬP NHẬT SỐ LƯỢNG TRONG DB
    const realProductId = decodeId(id_product);
    if (!realProductId) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    await updateCartItem(userId, realProductId, newQuantity);
    res
      .status(200)
      .json({ message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng" });
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi Server khi cập nhật giỏ hàng!",
      error: error.message,
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // 5. GIẢI MÃ ID TỪ URL PARAMS (VD: /cart/remove/x7bA9Rkz)
    const realProductId = decodeId(req.params.id);

    if (!realProductId) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    await removeCartItem(userId, realProductId);
    res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi Server khi xóa sản phẩm khỏi giỏ hàng!",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
};
