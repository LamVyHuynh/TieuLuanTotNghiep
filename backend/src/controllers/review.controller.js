const reviewService = require("../services/review.service");
const { encodeId, decodeId } = require("../utils/hashid.util");

// Khách gửi đánh giá
const addReview = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID người dùng từ token đã xác thực
    const { productId: hashedProductId, rating, comment } = req.body;

    // 🚀 BƯỚC QUAN TRỌNG: Giải mã ID sản phẩm từ Frontend gửi lên
    const productId = decodeId(hashedProductId);

    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin đánh giá hoặc ID không hợp lệ!",
      });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Số sao phải từ 1 đến 5!" });
    }

    await reviewService.createReview(userId, productId, rating, comment);

    res
      .status(201)
      .json({ success: true, message: "Cảm ơn bạn đã đánh giá sản phẩm! 🥰" });
  } catch (error) {
    console.log("Lỗi khi thêm đánh giá", error);
    res.status(500).json({ message: "Lỗi khi thêm đánh giá" });
  }
};

// Lấy danh sách đánh giá của 1 sản phẩm
const getReviewsByProductId = async (req, res) => {
  try {
    const productId = decodeId(req.params.id); // Giải mã ID sản phẩm từ URL
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ!" });
    }

    const reviews = await reviewService.getReviewByProductId(productId);
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.log("Lỗi khi lấy đánh giá", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy đánh giá" });
  }
};

module.exports = { addReview, getReviewsByProductId };
