const { Trophy } = require("lucide-react");
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
const { PayOS } = require("@payos/node");

// Vẫn khởi tạo PayOS để dùng hàm xác thực Webhook
const payOSClient = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY,
);

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
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const mi = String(dateObj.getMinutes()).padStart(2, "0");
      const ss = String(dateObj.getSeconds()).padStart(2, "0");
      formattedScheduledTime = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
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
      payment_method,
      total_amount,
      scheduled_time: formattedScheduledTime,
    };

    const newOrderId = await createOrderTransaction(
      userId,
      orderData,
      decodedItems,
    );
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
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy lịch sử đơn hàng" });
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
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy tất cả đơn hàng" });
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
        .json({ success: false, message: "Trạng thái không hợp lệ!" });

    await updateOrderStatus(realOrderId, status);
    res
      .status(200)
      .json({ success: true, message: "Cập nhật trạng thái thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật trạng thái" });
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
      data: { ...stats, recentOrders: secureRecentOrders },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy thống kê" });
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

const createMomoPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const partnerCode = "MOMO5RGX20191128";
    const accessKey = "M8brj9K6E22vXoDB";
    const secretKey = "nqQiVSgDMy809JoPF6OzP5OdBUB550Y4";
    const redirectUrl = "https://momo.vn";
    const ipnUrl = "http://localhost:3000/order";

    const amountNum = Number(amount);
    const uniqueOrderId = `${orderId}_${new Date().getTime()}`;
    const requestId = partnerCode + new Date().getTime();
    const orderInfo = `Thanh toan don hang ${uniqueOrderId}`;
    const requestType = "captureWallet";
    const extraData = "";

    const rawSignature = `accessKey=${accessKey}&amount=${amountNum}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${uniqueOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

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

    const result = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
    );

    if (result.data && result.data.resultCode === 0) {
      //  Ép tạo mã QR từ payUrl. Ai dùng cam điện thoại quét nó cũng nhảy thẳng vào Web MoMo
      const finalQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.data.payUrl)}`;

      res.status(200).json({
        success: true,
        qrCodeUrl: finalQrCodeUrl,
        momoOrderId: uniqueOrderId,
        message: "Tạo mã QR MoMo thành công",
      });
    } else {
      throw new Error(`MoMo từ chối: ${result.data.message}`);
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi kết nối cổng thanh toán MoMo!" });
  }
};

const checkMomoPaymentStatus = async (req, res) => {
  try {
    const { momoOrderId } = req.body;
    const partnerCode = "MOMO5RGX20191128";
    const accessKey = "M8brj9K6E22vXoDB";
    const secretKey = "nqQiVSgDMy809JoPF6OzP5OdBUB550Y4";
    const requestId = partnerCode + new Date().getTime();

    const rawSignature = `accessKey=${accessKey}&orderId=${momoOrderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode,
      requestId,
      orderId: momoOrderId,
      signature,
      lang: "vi",
    };
    const result = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/query",
      requestBody,
    );

    if (result.data && result.data.resultCode === 0) {
      const encodedOrderId = momoOrderId.split("_")[0];
      const realOrderId = decodeId(encodedOrderId);
      if (realOrderId) await updateOrderStatus(realOrderId, "processing");
      return res
        .status(200)
        .json({ success: true, message: "Thanh toán thành công" });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Đang chờ thanh toán" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi kiểm tra trạng thái MoMo" });
  }
};

// =================================================================
// TẠO LINK THANH TOÁN PAYOS (GỌI AXIOS TRỰC TIẾP CHỐNG LỖI THƯ VIỆN)
// =================================================================
const createPayOSPayment = async (req, res) => {
  try {
    const { orderId, amount, description } = req.body;
    const realOrderId = decodeId(orderId);

    if (!realOrderId) {
      return res
        .status(400)
        .json({ success: false, message: "Mã đơn hàng không hợp lệ!" });
    }

    const requestData = {
      orderCode: Number(realOrderId),
      amount: Number(amount),
      description: description || `Thanh toan don ${realOrderId}`,
      cancelUrl: "http://localhost:5173/cart",
      returnUrl: "http://localhost:5173/order",
    };

    // Tự tạo chữ ký bảo mật (Signature) để gọi API thẳng
    const rawSignature = `amount=${requestData.amount}&cancelUrl=${requestData.cancelUrl}&description=${requestData.description}&orderCode=${requestData.orderCode}&returnUrl=${requestData.returnUrl}`;
    const signature = crypto
      .createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY)
      .update(rawSignature)
      .digest("hex");
    requestData.signature = signature;

    const response = await axios.post(
      "https://api-merchant.payos.vn/v2/payment-requests",
      requestData,
      {
        headers: {
          "x-client-id": process.env.PAYOS_CLIENT_ID,
          "x-api-key": process.env.PAYOS_API_KEY,
        },
      },
    );

    const paymentLink = response.data.data;

    return res.status(200).json({
      success: true,
      bin: paymentLink.bin,
      accountNumber: paymentLink.accountNumber,
      amount: paymentLink.amount,
      description: paymentLink.description,
    });
  } catch (error) {
    console.error(
      "LỖI KHI GỌI PAYOS:",
      error.response ? error.response.data : error.message,
    );
    res
      .status(500)
      .json({ success: false, message: "Lỗi kết nối cổng thanh toán PayOS!" });
  }
};

const receivePayOSWebhook = async (req, res) => {
  try {
    if (req.body.code === "00") {
      const webhookData = payOSClient.verifyPaymentWebhookData(req.body);
      const realOrderId = webhookData.orderCode;
      await updateOrderStatus(realOrderId, "processing");
      console.log(
        `[PayOS Webhook] Tiền đã về bản! Tự động chốt đơn #${realOrderId}`,
      );
      return res
        .status(200)
        .json({ success: true, message: "Đã xử lý Webhook thành công" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Đã ghi nhận tín hiệu" });
  } catch (error) {
    return res
      .status(200)
      .json({ success: false, message: "Dữ liệu Webhook không hợp lệ" });
  }
};

const checkPayOSPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    const realOrderId = decodeId(orderId);

    if (!realOrderId)
      return res
        .status(400)
        .json({ success: false, message: "Mã đơn hàng không hợp lệ!" });

    // Gọi API PayOS trực tiếp
    const response = await axios.get(
      `https://api-merchant.payos.vn/v2/payment-requests/${realOrderId}`,
      {
        headers: {
          "x-client-id": process.env.PAYOS_CLIENT_ID,
          "x-api-key": process.env.PAYOS_API_KEY,
        },
      },
    );

    const paymentInfo = response.data.data;
    if (paymentInfo && paymentInfo.status === "PAID") {
      await updateOrderStatus(realOrderId, "processing");
      return res
        .status(200)
        .json({ success: true, message: "Thanh toán thành công" });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Đang chờ thanh toán" });
    }
  } catch (error) {
    res.status(200).json({ success: false, message: "Đang chờ thanh toán" });
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
  checkMomoPaymentStatus,
  createPayOSPayment,
  receivePayOSWebhook,
  checkPayOSPaymentStatus,
};
