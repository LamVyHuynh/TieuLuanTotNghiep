const crypto = require("crypto");
const axios = require("axios");
const {
  createOrderTransaction,
  getOrdersByUserId,
  getAllOrdersForAdmin,
  updateOrderStatus,
  getDashboardStats,
  getDetailReport,
} = require("../services/order.service");
const { encodeId, decodeId } = require("../../utils/hashid.util");

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

    // Gọi Service chạy Transaction để lưu đơn hàng vào Database
    const newOrderId = await createOrderTransaction(
      userId,
      orderData,
      decodedItems,
    );

    // =========================================================================
    // 🚀 GIẢI THÍCH: TỰ ĐỘNG CHUYỂN TRẠNG THÁI NẾU KHÁCH QUÉT QR (MOMO / BANK)
    // Sau khi tạo đơn xong, nếu hệ thống thấy khách dùng momo hoặc bank,
    // Nó sẽ gọi hàm updateOrderStatus (hàm này mày viết sẵn rồi) để ép trạng thái
    // của đơn hàng đó thành "processing" (Đang chuẩn bị) ngay lập tức!
    // =========================================================================
    if (payment_method === "momo" || payment_method === "bank") {
      await updateOrderStatus(newOrderId, "processing");
    }

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

// Hàm thanh toán momo
// 🚀 Hàm 1: Nhận data từ khách -> Gửi sang MoMo xin link QR thanh toán
const createPayment = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực
    const {
      full_name,
      phone,
      address,
      note,
      total_amount,
      scheduled_time,
      items,
    } = req.body;
    // A. Xử lý lưu đơn hàng tạm thời vào Database trước
    let formattedScheduledTime = null;
    if (scheduled_time) {
      const dataObj = new Date(scheduled_time);
      formattedScheduledTime = `${dataObj.getFullYear()}-${String(dataObj.getMonth() + 1).padStart(2, "0")}-${String(dataObj.getDate()).padStart(2, "0")} ${String(dataObj.getHours()).padStart(2, "0")}:${String(dataObj.getMinutes()).padStart(2, "0")}:00`;
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
      payment_method: "momo",
      total_amount,
      scheduled_time: formattedScheduledTime,
    };
    const newOrderId = await createOrderTransaction(
      userId,
      orderData,
      decodedItems,
    );

    // B Lấy cấu hình Momo từ file .env
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const redirectUrl = process.env.MOMO_REDIRECT_URL;
    const ipnUrl = process.env.MOMO_IPN_URL;

    const amount = String(total_amount);
    const orderInfo = `Thanh toan don hang tu #${newOrderId}`;
    const orderId = `${newOrderId}_${Date.now()}`;
    const requestId = orderId; // Có thể dùng orderId làm requestId luôn
    const requestType = "captureWallet"; // Cơ chế khoá cứng số tiền trong mã QR của momo
    const extraData = "";

    // C. Tạo chữ kí điện tử mã hoá ( luật nghiêm ngặt của Momo, nếu không đúng sẽ bị từ chối )
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    // D. Đóng gói dữ liệu bắn sáng ổng API của Momo
    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    // 🚀 BỌC THÉP HEADER JSON CHO MOMO
    const response = await axios.post(process.env.MOMO_API_URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // E. Nếu Momo trả về link (payUrl) thành công thì ném về cho frontend
    if (response.data && response.data.payUrl) {
      return res.status(200).json({
        success: true,
        payUrl: response.data.payUrl,
        order_id: encodeId(newOrderId),
      });
    } else {
      throw new Error("Không lấy được link MoMo");
    }
  } catch (error) {
    console.error("Lỗi tạo thanh toán MoMo: ", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo thanh toán MoMo",
      error: error.message,
    });
  }
};

// Hàm 2: API nhận lệnh chốt đơn trực tiếp từ fronend
const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    // Xử lý xác nhận thanh toán ở đây
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu mã đơn hàng" });
    }
    const realOrderId = orderId.split("_")[0]; // Tách lấy phần ID đơn hàng thực sự

    // Đổi trạng thái đơn hàng thành "processsing" đang chuẩn bị đơn hàng vì đã thanh toán thành công
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

// 🚀 Hàm 3: API nhận tin nhắn ngầm (Webhook/IPN) của MoMo (mai mốt lên Server thật xài)
const handleMomoIPN = async (req, res) => {
  try {
    const { orderId, resultCode } = req.body;
    const realOrderId = orderId.split("_")[0];
    if (Number(resultCode) === 0) {
      await updateOrderStatus(realOrderId, "processing");
      return res.status(204).send(); // Không cần gửi dữ liệu gì về Momo, chỉ cần 204 No Content là đủ
    }
    return res.status(400).send(); // Nếu resultCode khác 0 thì coi như thất bại, Momo sẽ thử gửi lại sau
  } catch (error) {
    return res.status(500).send(); // Nếu có lỗi server thì Momo sẽ thử gửi lại sau
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
