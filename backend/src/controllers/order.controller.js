const {
  createOrderTransaction,
  getOrdersByUserId,
  getAllOrdersForAdmin,
  updateOrderStatus,
  getDashboardStats,
  getDetailReport,
} = require("../services/order.service");
const { encodeId, decodeId } = require("../utils/hashid.util");
const axios = require("axios");
const crypto = require("crypto");
// Tạo đơn hàng mới (dùng cho trang Checkout)
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực
    const {
      full_name,
      phone,
      address,
      note,
      payment_method,
      total_amount,
      scheduled_time, // Nhận từ Frontend (có thể dính chữ T và Z)
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

    // =====================================================================
    // 🚀 THUỐC GIẢI: ÉP KIỂU LẠI THỜI GIAN NGAY TẠI ĐÂY TRƯỚC KHI ĐƯA VÀO DB
    // =====================================================================
    let formattedScheduledTime = null;
    if (scheduled_time) {
      // 1. Tạo Date object từ chuỗi Frontend gửi lên
      const dateObj = new Date(scheduled_time);

      // 2. Rút trích từng phần theo giờ địa phương của Server
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const mi = String(dateObj.getMinutes()).padStart(2, "0");
      const ss = String(dateObj.getSeconds()).padStart(2, "0");

      // 3. Ráp lại chuẩn YYYY-MM-DD HH:mm:ss cho MySQL (SẠCH BÓNG CHỮ T VÀ Z)
      formattedScheduledTime = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    // BỌC THÉP CHIỀU VÀO: Giải mã id_product từ mảng items mà React gửi lên
    // BỌC THÉP CHIỀU VÀO: Phân biệt ID số và ID mã hóa
    const decodedItems = items.map((item) => {
      const productId = item.id_product;

      if (!productId) {
        throw new Error("Lỗi giỏ hàng: Không tìm thấy ID của sản phẩm!");
      }

      let realProductId;

      // KIỂM TRA: Nếu là số thì lấy luôn, nếu là chữ thì mới decodeId
      if (typeof productId === "number" || !isNaN(productId)) {
        realProductId = Number(productId);
      } else {
        realProductId = decodeId(productId);
      }

      if (!realProductId) {
        throw new Error("ID sản phẩm không hợp lệ: " + productId);
      }

      return {
        ...item,
        id_product: realProductId,
      };
    });

    const orderData = {
      full_name,
      phone,
      address,
      note,
      payment_method,
      total_amount,
      scheduled_time: formattedScheduledTime, // 🚀 Ném cái giờ đã làm sạch xuống Service
    };

    // Gọi Service chạy Transaction
    const newOrderId = await createOrderTransaction(
      userId,
      orderData,
      decodedItems,
    );
    // BỌC THÉP CHIỀU RA: Mã hóa cái ID đơn hàng vừa tạo để React xài
    const safeOrderId = encodeId(newOrderId);

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công!",
      order_id: safeOrderId,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    // Bắt cái lỗi "Không đủ số lượng" mà mình chủ động quăng ra từ Service
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
// Controller lấy đơn hàng theo user (dùng cho trang Lịch sử đơn hàng)
const getOrdersHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực
    const orders = await getOrdersByUserId(userId);
    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        id_order: encodeId(order.id_order), // Mã hóa ID đơn hàng trước khi gửi về client
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

// lấy đơn hàng của admin
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await getAllOrdersForAdmin();
    res.status(200).json({
      success: true,
      orders: orders.map((order) => ({
        ...order,
        id_order: encodeId(order.id_order), // Mã hóa ID đơn hàng trước khi gửi về client
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

// Hàm cập nhật trạng thái đơn hàng (dùng cho admin)
const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const realOrderId = decodeId(id);
    if (!realOrderId) {
      return res
        .status(400)
        .json({ success: false, message: "Mã đơn hàng không hợp lệ!" });
    }

    const validStatuses = [
      "pending",
      "processing",
      "shipping",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái đơn hàng không hợp lệ!" });
    }

    // Gọi Service để cập nhật trạng thái đơn hàng
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

    // Chuyển đổi dữ liệu để phù hợp với yêu cầu của frontend
    const secureRecentOrders = stats.recentOrders.map((order) => ({
      ...order,
      id_order: encodeId(order.id_order), // Mã hóa ID đơn hàng trước khi gửi về client
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

// Nhớ import getDetailedReports từ service lên trên cùng nhé!
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

// =================================================================
// TẠO MÃ QR THANH TOÁN MOMO UAT (BẢN CHUẨN DEEPLINK NATIVE APP)
// =================================================================
const createMomoPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // 1. GẮN CỨNG BỘ KEY
    const partnerCode = "MOMO5RGX20191128";
    const accessKey = "M8brj9K6E22vXoDB";
    const secretKey = "nqQiVSgDMy809JoPF6OzP5OdBUB550Y4";
    const redirectUrl = "http://localhost:3000/order";
    const ipnUrl = "http://localhost:3000/order";

    // 2. Chuẩn hoá dữ liệu
    const amountNum = Number(amount);
    const uniqueOrderId = `${orderId}_${new Date().getTime()}`;
    const requestId = partnerCode + new Date().getTime();
    const orderInfo = `Thanh toan don hang ${uniqueOrderId}`;
    const requestType = "captureWallet";
    const extraData = "";

    // 3. Xếp chuỗi chữ ký đúng chuẩn
    const rawSignature = `accessKey=${accessKey}&amount=${amountNum}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${uniqueOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // 4. Băm chữ ký
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    // 5. Gói hàng gửi lên MoMo
    const requestBody = {
      partnerCode,
      partnerName: "HealthyGO",
      storeId: "MomoTestStore",
      requestId,
      amount: amountNum,
      orderId: uniqueOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    // 6. Gọi API MoMo
    const result = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
    );

    // 7. 🚀 XỬ LÝ ẢNH QR CHUẨN NATIVE
    if (result.data && result.data.resultCode === 0) {
      // Ưu tiên 1: Lấy ảnh QR xịn do chính MoMo cấp (nếu có)
      let finalQrCodeUrl = result.data.qrCodeUrl;

      // Ưu tiên 2: Tạo QR từ 'deeplink' (momo://...) để ép MoMo bật popup thanh toán gốc
      if (!finalQrCodeUrl && result.data.deeplink) {
        finalQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(result.data.deeplink)}`;
      }

      res.status(200).json({
        success: true,
        qrCodeUrl: finalQrCodeUrl,
        message: "Tạo mã QR MoMo thành công",
      });
    } else {
      throw new Error(`MoMo từ chối: ${result.data.message}`);
    }
  } catch (error) {
    console.error(
      "LỖI KHI GỌI MOMO:",
      error.response ? error.response.data : error.message,
    );
    res
      .status(500)
      .json({ success: false, message: "Lỗi kết nối cổng thanh toán MoMo!" });
  }
};
module.exports = {
  createOrder,
  getOrdersHistory,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getDashboardReview,
  getReportsAdmin,
  createMomoPayment,
};
