const rateLimit = require("express-rate-limit");

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn mỗi IP chỉ được phép thực hiện 5 lần đăng nhập trong 15 phút
  message: {
    message: "Bạn đã đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true, // Trả về thông tin giới hạn trong header `RateLimit-*`
  legacyHeaders: false, // Không trả về header `X-RateLimit-*`
});

module.exports = { loginRateLimiter };
