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

// Hàm lấy dữ liệu đơn hàng theo từng user (dùng cho trang Lịch sử đơn hàng)
// Hàm lấy dữ liệu đơn hàng + chi tiết sản phẩm theo từng user
async function getOrdersByUserId(userId) {
  // BƯỚC 1: Lấy danh sách các đơn hàng của thằng User này
  const orderQuery = `
    SELECT id_order, total_amount, status, created_at 
    FROM orders 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `;
  const [orders] = await pool.execute(orderQuery, [userId]);

  // NẾU KHÔNG CÓ ĐƠN NÀO -> Trả về mảng rỗng luôn cho lẹ, khỏi làm tiếp
  if (orders.length === 0) {
    return [];
  }

  // BƯỚC 2: Rút trích ra một mảng chỉ chứa các ID đơn hàng (Ví dụ: [125, 126, 127])
  const orderIds = orders.map((order) => order.id_order);

  // BƯỚC 3: Quét 1 phát lấy ra TOÀN BỘ order_items thuộc về các ID ở trên
  // Tạo ra chuỗi dấu ? tương ứng với số lượng đơn hàng (Ví dụ: "?, ?, ?")
  const placeholders = orderIds.map(() => "?").join(",");
  const itemQuery = `
    SELECT id_order, id_product, product_name, quantity, price 
    FROM order_items 
    WHERE id_order IN (${placeholders})
  `;
  // Truyền mảng orderIds vào để thay thế cho các dấu ?
  const [items] = await pool.execute(itemQuery, orderIds);

  // BƯỚC 4: Lắp ráp đồ chơi - Nhét các items vào đúng cái bụng của đơn hàng chứa nó
  const finalOrders = orders.map((order) => {
    return {
      ...order,
      // Lọc ra những món hàng có id_order khớp với đơn hàng đang lặp
      items: items.filter((item) => item.id_order === order.id_order),
    };
  });

  return finalOrders;
}

// Lấy tất cả các đơn hàng của admin
async function getAllOrdersForAdmin() {
  // 1. Lấy tất cả đơn hàng từ mới nhất đến cũ nhất
  const orderQuery = `
    SELECT id_order, full_name, payment_method, total_amount, status, created_at 
    FROM orders 
    ORDER BY created_at DESC
  `;
  const [orders] = await pool.execute(orderQuery);

  if (orders.length === 0) {
    return [];
  }

  // Gom tất cả các ID đơn hàng lại
  const orderIds = orders.map((order) => order.id_order);
  const placeholders = orderIds.map(() => "?").join(",");

  // lấy tất cả món hàng thuộc về các đơn hàng trên
  const itemQuery = `
    SELECT id_order, product_name, quantity 
    FROM order_items 
    WHERE id_order IN (${placeholders})
  `;
  const [items] = await pool.execute(itemQuery, orderIds);

  // Lắp ráp lại đơn hàng với món hàng
  const finalOrders = orders.map((order) => {
    return {
      ...order,
      items: items.filter((item) => item.id_order === order.id_order),
    };
  });
  return finalOrders;
}
module.exports = {
  createOrderTransaction,
  getOrdersByUserId,
  getAllOrdersForAdmin,
};
