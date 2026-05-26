const pool = require("../config/db");

const addItemToCart = async (userId, productId, quantity = 1) => {
  // Bước 1: kiểm tra xem người dùng đã có giỏ hàng chưa
  let [cart] = await pool.query("SELECT * FROM cart WHERE user_id = ?", [
    userId,
  ]);
  let cartId;
  if (cart.length === 0) {
    // Nếu chưa có giỏ hàng mới cho user
    const [newCart] = await pool.query(
      "INSERT INTO cart (user_id) VALUES (?)",
      [userId],
    );
    cartId = newCart.insertId;
  } else {
    cartId = cart[0].id_cart;
  }

  // Bước 2: kiểm tra xem sản phẩm có trong giỏ hàng chưa
  let [existingItem] = await pool.query(
    "SELECT id_cart_item, quantity FROM cart_items WHERE id_cart = ? AND id_product = ?",
    [cartId, productId],
  );
  // Đã có  sản phẩm trong giỏ hàng, cập nhật số lượng
  if (existingItem.length > 0) {
    await pool.query(
      "UPDATE cart_items SET quantity = quantity + ? WHERE id_cart_item = ?",
      [quantity, existingItem[0].id_cart_item],
    );
  } else {
    // Chưa có sản phẩm trong giỏ hàng, thêm mới
    await pool.query(
      "INSERT INTO cart_items (id_cart, id_product, quantity) VALUES (?, ?, ?)",
      [cartId, productId, quantity],
    );
  }
  return true;
};

module.exports = {
  addItemToCart,
};
