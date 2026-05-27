const {
  addItemToCart,
  getCartItems,
  updateCartItem,
} = require("../services/cart.service");

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id_product, quantity } = req.body;

    if (!id_product) {
      return res.status(400).json({ message: "Thiếu ID sản phẩm rồi " });
    }
    //gọi service để xử lí thêm sản phẩm vào giỏ hàng
    // Kiểm tra user và sản phầmm có tồn tại trong giỏ hàng không
    // Thực hiện thêm sản phẩm vào giỏ hàng nếu chưa có hoặc cập nhật lại số lượng sản phẩm nếu cần
    await addItemToCart(userId, id_product, quantity || 1);
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
    const items = await getCartItems(userId);
    res.status(200).json({
      message: "Lấy giỏ hàng thành công",
      cartItems: items,
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
        .json({ message: "Thiếu thông tin sản phẩm  hoặc số lượng" });
    }

    await updateCartItem(userId, id_product, newQuantity);
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

module.exports = {
  addToCart,
  getCart,
  updateCart,
};
