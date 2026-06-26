const crypto = require("crypto");

// 1. 🚀 LẤY CLASS PAYOS BẤT CHẤP PHIÊN BẢN (Chống Crash)
const PayOSRaw = require("@payos/node");
const PayOSClass = PayOSRaw.PayOS || PayOSRaw.default || PayOSRaw;

const {
  createOrderTransaction,
  getOrdersByUserId,
  getAllOrdersForAdmin,
  updateOrderStatus,
  getDashboardStats,
  getDetailReport,
} = require("../services/order.service");
const { encodeId, decodeId } = require("../../utils/hashid.util");

// 2. 🚀 KHỞI TẠO PAYOS BẰNG CÚ PHÁP MỚI NHẤT (Dùng Object)
let payos;
try {
  payos = new PayOSClass({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  });
} catch (error) {
  // Bọc lót: Nếu dùng bản cũ không hỗ trợ Object thì truyền 3 chuỗi
  payos = new PayOSClass(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY,
  );
}

// Tạo đơn hàng mới (dùng cho trang Checkout)
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      address,
      note,
      payment_method,
      total_amount,
      scheduled_time,
      items,
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Đơn hàng không có sản phẩm nào !!!" });
    }

    if (!full_name || !phone || !address) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin nhận hàng !!!" });
    }

    let formattedScheduledTime = null;
    if (scheduled_time) {
      const dateObj = new Date(scheduled_time);
      formattedScheduledTime = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}:00`;
    }

    const decodedItems = items.map((item) => {
      const productId = item.id_product;
      if (!productId)
        throw new Error("Lỗi giỏ hàng: Không tìm thấy ID của sản phẩm!");

      let realProductId =
        typeof productId === "number" || !isNaN(productId)
          ? Number(productId)
          : decodeId(productId);
      if (!realProductId)
        throw new Error("ID sản phẩm không hợp lệ: " + productId);

      return { ...item, id_product: realProductId };
    });

    const orderData = {
      full_name,
      phone,
      address,
      note,
      payment_method, // Lấy chuẩn "momo" hoặc "bank" từ Frontend truyền xuống
      total_amount,
      scheduled_time: formattedScheduledTime,
    };

    const newOrderId = await createOrderTransaction(
      userId,
      orderData,
      decodedItems,
    );

    // Xử lý tự động nếu không xài API bên ngoài (dành cho popup tự chế)
    if (payment_method === "momo" || payment_method === "bank") {
      await updateOrderStatus(newOrderId, "processing");
    }

    const safeOrderId = encodeId(newOrderId);

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      order_id: safeOrderId,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    if (error.message.includes("không đủ hàng trong kho")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đặt hàng",
      error: error.message,
    });
  }
};

const getOrdersHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getOrdersByUserId(userId);
    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        id_order: encodeId(order.id_order),
      })),
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử đơn hàng",
      error: error.message,
    });
  }
};

const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await getAllOrdersForAdmin();
    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        id_order: encodeId(order.id_order),
      })),
    });
  } catch (error) {
    console.error("Lỗi lấy tất cả đơn hàng cho admin:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy tất cả đơn hàng cho admin",
      error: error.message,
    });
  }
};

const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const realOrderId = decodeId(id);
    if (!realOrderId)
      return res
        .status(400)
        .json({ success: false, message: "Mã đơn hàng không hợp lệ!" });

    const validStatuses = [
      "pending",
      "processing",
      "shipping",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái đơn hàng không hợp lệ!" });

    await updateOrderStatus(realOrderId, status);
    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công!",
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
};

const getDashboardReview = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    const secureRecentOrders = stats.recentOrders.map((order) => ({
      ...order,
      id_order: encodeId(order.id_order),
    }));
    res.status(200).json({
      success: true,
      data: {
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
        totalUsers: stats.totalUsers,
        bestSellingProducts: stats.bestSellingProducts,
        recentOrders: secureRecentOrders,
        monthlyRevenue: stats.monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê dashboard",
      error: error.message,
    });
  }
};

const getReportsAdmin = async (req, res) => {
  try {
    const data = await getDetailReport();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy báo cáo" });
  }
};

/// =======================================================
// 🚀 HÀM TẠO LINK THANH TOÁN PAYOS
// =======================================================
const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      phone,
      address,
      note,
      total_amount,
      scheduled_time,
      items,
      payment_method,
    } = req.body;

    let formattedScheduledTime = null;
    if (scheduled_time) {
      const dateObj = new Date(scheduled_time);
      formattedScheduledTime = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")} ${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}:00`;
    }

    const decodedItems = items.map((item) => {
      const realProductId =
        typeof item.id_product === "number" || !isNaN(item.id_product)
          ? Number(item.id_product)
          : decodeId(item.id_product);
      return { ...item, id_product: realProductId };
    });

    const orderData = {
      full_name,
      phone,
      address,
      note,
      payment_method: payment_method || "bank",
      total_amount,
      scheduled_time: formattedScheduledTime,
    };

    const newOrderId = await createOrderTransaction(
      userId,
      orderData,
      decodedItems,
    );
    const safeOrderId = encodeId(newOrderId);

    const body = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: 2000,
      description: `Thanh toan don hang`,
      returnUrl: `http://localhost:5173/payment-result?resultCode=0&orderId=${safeOrderId}`,
      cancelUrl: `http://localhost:5173/payment-result?resultCode=1&orderId=${safeOrderId}`,
    };

    // 🚀 BỌC THÉP TẠO LINK (Chống crash do phiên bản mới)
    let paymentLinkResponse;
    if (payos.createPaymentLink) {
      paymentLinkResponse = await payos.createPaymentLink(body);
    } else if (payos.paymentRequests && payos.paymentRequests.create) {
      paymentLinkResponse = await payos.paymentRequests.create(body);
    } else {
      throw new Error("Không thể gọi API PayOS để tạo link!");
    }

    return res.status(200).json({
      success: true,
      payUrl: paymentLinkResponse.checkoutUrl,
      order_id: safeOrderId,
    });
  } catch (error) {
    console.error("Lỗi tạo thanh toán PayOS: ", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo thanh toán PayOS",
      error: error.message,
    });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã đơn hàng" });
    const realOrderId = orderId.split("_")[0];

    await updateOrderStatus(realOrderId, "processing");
    return res
      .status(200)
      .json({ success: true, message: "Đã cập nhật đơn hàng thành công" });
  } catch (error) {
    console.error("Lỗi xác nhận đơn hàng local: ", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác nhận đơn hàng",
      error: error.message,
    });
  }
};

const handleMomoIPN = async (req, res) => {
  try {
    const { orderId, resultCode } = req.body;
    const realOrderId = orderId.split("_")[0];
    if (Number(resultCode) === 0) {
      await updateOrderStatus(realOrderId, "processing");
      return res.status(204).send();
    }
    return res.status(400).send();
  } catch (error) {
    return res.status(500).send();
  }
};

module.exports = {
  createOrder,
  getOrdersHistory,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getDashboardReview,
  getReportsAdmin,
  createPayment,
  confirmPayment,
  handleMomoIPN,
};
