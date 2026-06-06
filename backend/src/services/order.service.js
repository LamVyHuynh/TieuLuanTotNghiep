const pool = require("../config/db");
async function createOrderTransaction(userId, orderData, items) {
  // Lấy 1 connection riêng biệt từ pool để chạy về Transaction
  const conn = await pool.getConnection();

  try {
    // Bắt đầu transaction: kể từ đây mọi thay đổi chưa được lưu vĩnh viễn
    await conn.beginTransaction();

    // 1. Tạo đơn hàng
    const { full_name, phone, address, note, payment_method, total_amount } =
      orderData;
    const insertOrderQuery = `INSERT INTO orders (user_id, full_name, phone, address, note, payment_method, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`;
    const [orderResult] = await conn.execute(insertOrderQuery, [
      userId,
      full_name,
      phone,
      address,
      note || null,
      payment_method,
      total_amount,
    ]);

    const orderId = orderResult.insertId;

    // xử lí sản phẩm trong vỏ hàng
    for (const item of items) {
      //lưu vào bảng order_items
      const insertItemQuery = `INSERT INTO order_items (id_order, id_product, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)`;
      await conn.execute(insertItemQuery, [
        orderId,
        item.id_product,
        item.name,
        item.quantity,
        item.price,
      ]);

      // trừ số lượng sản phẩm trong kho
      const updateStockQuery = `UPDATE product SET stock_quantity = stock_quantity - ? WHERE id_product = ? AND stock_quantity >= ?`;
      const [stockResult] = await conn.execute(updateStockQuery, [
        item.quantity,
        item.id_product,
        item.quantity,
      ]);

      // Nếu không có hàng đủ để trừ, sẽ trả về lỗi
      if (stockResult.affectedRows === 0) {
        throw new Error(`Sản phẩm không đủ hàng trong kho.`);
      }
    }

    // Nếu mọi thứ thành công, commit transaction để lưu vĩnh viễn
    await conn.commit();
    return orderId;
  } catch (error) {
    // 5. NẾU CÓ BẤT CỨ LỖI GÌ (ví dụ: Hết hàng, sập mạng) -> QUAY XE TOÀN BỘ!
    await conn.rollback();
    throw error; // Ném lỗi ra cho Controller xử lý
  } finally {
    conn.release();
  }
}

module.exports = {
  createOrderTransaction,
};
