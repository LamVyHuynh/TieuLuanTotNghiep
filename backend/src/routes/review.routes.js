const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const {
  addReview,
  getReviewsByProductId,
} = require("../controllers/review.controller");

// Route Thêm đánh giá (Bắt buộc đăng nhập)
router.post("/", authenticateToken, addReview);

// Route Lấy danh sách đánh giá của sản phẩm (Ai cũng xem được)
router.get("/product/:id", getReviewsByProductId);

module.exports = router;
