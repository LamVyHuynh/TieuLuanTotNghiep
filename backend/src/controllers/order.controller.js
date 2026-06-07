const {
  createOrderTransaction,
  getOrdersByUserId,
  getAllOrdersForAdmin,
} = require("../services/order.service");
const { encodeId, decodeId } = require("../../utils/hashid.util");
const { get } = require("../routes/auth.routes");

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

    // BỌC THÉP CHIỀU VÀO: Giải mã id_product từ mảng items mà React gửi lên
    const decodedItems = items.map((item) => {
      const realProductId = decodeId(item.id_product);
      console.log("Decoded product ID:", realProductId);
      if (!realProductId) {
        throw new Error("ID sản phẩm không hợp lệ: " + item.id_product);
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

module.exports = {
  createOrder,
  getOrdersHistory,
  getAllOrdersAdmin,
};
