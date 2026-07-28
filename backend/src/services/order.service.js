const pool = require("../config/db");

// 🚀 THÊM MỚI: Import hàm tạo thông báo từ service mới tạo
const { createNotification } = require("./notification.service");

const { encodeId } = require("../utils/hashid.util");

async function createOrderTransaction(userId, orderData, items) {
  // Lấy 1 connection riêng biệt từ pool để chạy về Transaction
  const conn = await pool.getConnection();

  try {
    // Bắt đầu transaction: kể từ đây mọi thay đổi chưa được lưu vĩnh viễn
    await conn.beginTransaction();

    // 1. Tạo đơn hàng
    const {
      full_name,
      phone,
      address,
      note,
      payment_method,
      total_amount,
      scheduled_time,
    } = orderData;
    const insertOrderQuery = `INSERT INTO orders (user_id, full_name, phone, address, note, payment_method, total_amount, scheduled_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;
    const [orderResult] = await conn.execute(insertOrderQuery, [
      userId,
      full_name,
      phone,
      address,
      note || null,
      payment_method,
      total_amount,
      scheduled_time,
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
    SELECT id_order, total_amount, status, created_at, scheduled_time 
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
      items: items
        .filter((item) => item.id_order === order.id_order)
        .map((item) => ({
          ...item,
          // 🚀 TUYỆT CHIÊU Ở ĐÂY: Mã hoá cái id_product lại trước khi ném về cho Frontend
          id_product: encodeId(item.id_product),
        })),
    };
  });

  return finalOrders;
}

// Lấy tất cả các đơn hàng của admin
async function getAllOrdersForAdmin() {
  // 1. Lấy tất cả đơn hàng từ mới nhất đến cũ nhất
  // 🚀 ĐÃ SỬA: Dùng LEFT JOIN móc sang bảng users để lấy cột avatar_url ra
  const orderQuery = `
    SELECT o.id_order, o.full_name, o.address, o.payment_method, o.total_amount, o.status, o.created_at, o.scheduled_time, u.avatar_url 
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
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
    SELECT id_order, product_name, quantity, price
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

// Hàm cập nhật trạng thái đơn hàng (dùng cho admin)
async function updateOrderStatus(orderId, newStatus) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Cập nhật trạng thái đơn hàng
    const updateOrderStatusQuery = `UPDATE orders SET status = ? WHERE id_order = ?`;
    await conn.execute(updateOrderStatusQuery, [newStatus, orderId]);

    if (newStatus === "cancelled") {
      // Lấy danh sách tất cả các món hàng
      const [items] = await conn.execute(
        `SELECT id_product, quantity FROM order_items WHERE id_order = ?`,
        [orderId],
      );

      // trả lại số lượng sản phẩm vào kho
      for (const item of items) {
        await conn.execute(
          `UPDATE product SET stock_quantity = stock_quantity + ? WHERE id_product = ?`,
          [item.quantity, item.id_product],
        );
      }
    }

    // =========================================================================
    // 🚀 NÂNG CẤP: ĐOẠN TỰ ĐỘNG BẮN THÔNG BÁO HIỆN TÊN SẢN PHẨM THỰC TẾ
    // =========================================================================

    // 1. Lấy thông tin user_id VÀ gộp tên tất cả các món ăn trong đơn hàng lại bằng GROUP_CONCAT
    const [orderRows] = await conn.execute(
      `SELECT 
          o.user_id, 
          GROUP_CONCAT(oi.product_name SEPARATOR ', ') as product_names 
       FROM orders o
       LEFT JOIN order_items oi ON o.id_order = oi.id_order
       WHERE o.id_order = ?
       GROUP BY o.id_order`,
      [orderId],
    );

    const orderDataForNoti = orderRows[0];

    if (orderDataForNoti && orderDataForNoti.user_id) {
      const userId = orderDataForNoti.user_id;
      const productNames = orderDataForNoti.product_names || "sản phẩm";

      // Khống chế độ dài chuỗi tên sản phẩm tối đa 40 ký tự để không làm tràn vỡ UI bong bóng thông báo
      const shortProductNames =
        productNames.length > 40
          ? productNames.substring(0, 40) + "..."
          : productNames;

      let title = "Trạng thái đơn hàng";
      let msg = `Đơn hàng chứa [${shortProductNames}] của bạn vừa có cập nhật mới từ hệ thống.`;

      // 2. Thiết lập tiêu đề và nội dung linh hoạt theo từng sự thay đổi trạng thái
      if (newStatus === "processing") {
        title = "Đơn hàng đã được duyệt! 🎉";
        msg = `Tuyệt vời! Đơn hàng chứa [${shortProductNames}] của bạn đã được cửa hàng xác nhận và bắt đầu chuẩn bị chế biến.`;
      } else if (newStatus === "shipping") {
        title = "Đơn hàng đang giao đến bạn! 🚚";
        msg = `Các món ăn ngon [${shortProductNames}] trong đơn hàng của bạn đã được bàn giao cho shipper. Bạn vui lòng chú ý điện thoại nhé!`;
      } else if (newStatus === "completed") {
        title = "Giao hàng thành công! 🥰";
        msg = `Đơn hàng chứa [${shortProductNames}] của bạn đã hoàn thành xuất sắc. Chúc bạn có một bữa ăn ngon miệng và healthy!`;
      } else if (newStatus === "cancelled") {
        title = "Đơn hàng của bạn đã bị hủy 😥";
        msg = `Rất tiếc, đơn hàng chứa [${shortProductNames}] đã bị hủy bỏ. Vui lòng kiểm tra lại hoặc liên hệ CSKH để được hỗ trợ kịp thời.`;
      }

      // 3. Đẩy lệnh ghi vào bảng notifications nằm trong cùng khối Transaction
      const insertNotiQuery = `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`;
      await conn.execute(insertNotiQuery, [userId, title, msg]);
    }

    await conn.commit();
    return true;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function getDashboardStats() {
  try {
    const revenueQuery = `SELECT SUM(total_amount) AS total_revenue FROM orders WHERE status != 'cancelled'`;
    const ordersCountQuery = `SELECT COUNT(*) AS total_orders FROM orders`;
    const usersCountQuery = `SELECT COUNT(*) AS total_users FROM users WHERE role_id = 2`;
    const recentOrdersQuery = `SELECT id_order, full_name, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`;
    const bestSellingQuery = `SELECT product_name, SUM(quantity) AS total_sold FROM order_items GROUP BY id_product, product_name ORDER BY total_sold DESC LIMIT 5`;

    // 🚀 ĐÃ THÊM LỆNH ĐẾM SỐ ĐƠN HÀNG: COUNT(id_order) as total_orders
    const monthlyRevenueQuery = `
      SELECT MONTH(created_at) AS month, SUM(total_amount) AS total_revenue, COUNT(id_order) AS total_orders
      FROM orders 
      WHERE status != 'cancelled' AND YEAR(created_at) = YEAR(CURDATE()) 
      GROUP BY MONTH(created_at) 
      ORDER BY month
    `;

    const [
      [revenueResult],
      [ordersCountResult],
      [usersCountResult],
      [recentOrders],
      [bestSellingProducts],
      [monthlyRaw],
    ] = await Promise.all([
      pool.execute(revenueQuery),
      pool.execute(ordersCountQuery),
      pool.execute(usersCountQuery),
      pool.execute(recentOrdersQuery),
      pool.execute(bestSellingQuery),
      pool.execute(monthlyRevenueQuery),
    ]);

    // 🚀 Gom thành mảng Object chứa cả tiền và số lượng đơn
    const finalMonthlyStats = Array.from({ length: 12 }, (_, index) => {
      const monthData = monthlyRaw.find((m) => m.month === index + 1);
      return {
        revenue: monthData ? Number(monthData.total_revenue) : 0,
        orders: monthData ? Number(monthData.total_orders) : 0,
      };
    });

    return {
      totalRevenue: revenueResult[0].total_revenue || 0,
      totalOrders: ordersCountResult[0].total_orders || 0,
      totalUsers: usersCountResult[0].total_users || 0,
      recentOrders: recentOrders,
      bestSellingProducts: bestSellingProducts,
      monthlyRevenue: finalMonthlyStats, // Mảng Object mới
    };
  } catch (error) {
    console.error("Lỗi thực thi SQL trong Service:", error);
    throw error;
  }
}

// Báo cáo chi tiết doanh thu theo tháng (dùng cho admin)
async function getDetailReport() {
  try {
    // 1.Tính giá trị đơn hàng trung bình (AOV)
    const aovQuery = `SELECT AVG(total_amount) AS aov FROM orders WHERE status != 'cancelled'`;

    // 2. Tính tỷ lệ huỷ đơn hàng
    const cancelQuery = `SELECT 
        COUNT(*) AS total_orders, 
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders 
      FROM orders`;

    // 3. Cơ cấu thanh toán
    const paymentQuery = `
      SELECT payment_method, COUNT(*) AS count 
      FROM orders 
      GROUP BY payment_method
    `;

    // Đếm đơn hàng dùng phương thức thanh toán COD
    const codCountQuery = `SELECT COUNT(*) AS cod_count FROM orders WHERE payment_method = 'cod'`;

    // Đếm đơn hàng dùng phương thức thanh toán momo
    const momoCountQuery = `SELECT COUNT(*) AS momo_count FROM orders WHERE payment_method = 'momo'`;

    // Đếm đơn hàng dùng phương thức thanh toán chuyển khoản
    const bankCountQuery = `SELECT COUNT(*) AS bank_count FROM orders WHERE payment_method = 'bank'`;

    // 4. Top 5 Khách hàng VIP (Mua nhiều tiền nhất)
    const vipQuery = `
      SELECT full_name, COUNT(*) AS total_orders, SUM(total_amount) AS total_spent 
      FROM orders 
      WHERE status != 'cancelled' AND user_id IS NOT NULL 
      GROUP BY user_id, full_name 
      ORDER BY total_spent DESC 
      LIMIT 5
    `;

    // 5. Doanh thu theo từng tháng trong năm
    const monthlyRevenueQuery = `
      SELECT MONTH(created_at) AS month, SUM(total_amount) AS total_revenue, COUNT(id_order) AS total_orders
      FROM orders 
      WHERE status != 'cancelled' AND YEAR(created_at) = YEAR(CURDATE())
      GROUP BY MONTH(created_at)
      ORDER BY month
    `;

    // 6. Doanh thu theo từng loại sản phẩm
    const productRevenueQuery = `
      SELECT oi.product_name, SUM(oi.quantity * oi.price) AS revenue 
      FROM order_items oi 
      JOIN orders o ON oi.id_order = o.id_order 
      WHERE o.status != 'cancelled' 
      GROUP BY oi.id_product, oi.product_name 
      ORDER BY revenue DESC
    `;

    const [
      [aovRes],
      [cancelRes],
      [paymentRes],
      [vipRes],
      [monthlyRaw],
      [productRaw],
      [codCountRes],
      [momoCountRes],
      [bankCountRes],
    ] = await Promise.all([
      pool.execute(aovQuery),
      pool.execute(cancelQuery),
      pool.execute(paymentQuery),
      pool.execute(vipQuery),
      pool.execute(monthlyRevenueQuery),
      pool.execute(productRevenueQuery),
      pool.execute(codCountQuery),
      pool.execute(momoCountQuery),
      pool.execute(bankCountQuery),
    ]);

    const totalOrders = cancelRes[0]?.total_orders || 0;
    const cancelledOrders = cancelRes[0]?.cancelled_orders || 0;
    const cancelRate =
      totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;

    return {
      aov: aovRes[0]?.aov || 0,
      cancelRate: cancelRate,
      payments: paymentRes, // Mảng các phương thức thanh toán
      vips: vipRes, // Mảng Top VIP
      monthlyRevenue: monthlyRaw,
      productRevenue: productRaw,
      codCount: codCountRes[0]?.cod_count || 0,
      momoCount: momoCountRes[0]?.momo_count || 0,
      bankCount: bankCountRes[0]?.bank_count || 0,
    };
  } catch (error) {
    console.error("Lỗi lấy báo cáo chi tiết:", error);
    throw error;
  }
}

module.exports = {
  createOrderTransaction,
  getOrdersByUserId,
  getAllOrdersForAdmin,
  updateOrderStatus,
  getDashboardStats,
  getDetailReport,
};
