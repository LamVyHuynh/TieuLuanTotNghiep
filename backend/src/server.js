// 1. ĐỌC BIẾN MÔI TRƯỜNG ĐẦU TIÊN
// Bắt buộc nằm ở dòng trên cùng để các file require bên dưới có thể nhận được cấu hình .env
require("dotenv").config();

// 2. CẤU HÌNH MẠNG TOÀN CỤC (SỬA LỖI FETCH API)
// Ép Node.js ưu tiên dùng IPv4 cho mọi kết nối ra bên ngoài
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");

// 3. IMPORT THƯ VIỆN & ROUTES
const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Pool kết nối database
const pool = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");
const addressRoutes = require("./routes/address.routes");
const orderRoutes = require("./routes/order.routes");
const notificationRoutes = require("./routes/notification.routes");
const reviewRoutes = require("./routes/review.routes");
const chatBoxRoutes = require("./routes/chat.routes");

// 4. KHỞI TẠO ỨNG DỤNG EXPRESS
const app = express();

// 5. CẤU HÌNH MIDDLEWARE
// Cấu hình CORS để giải quyết lỗi khi frontend và backend khác domain
const corsOptions = {
  origin: "http://localhost:5173", // Đích danh cổng Frontend của bạn
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"], // BẮT BUỘC phải có
  credentials: true,
};
app.use(cors(corsOptions));

// Sử dụng cookie-parser để đọc cookie từ request header
app.use(cookieParser());

// Cho phép server đọc JSON từ request body
app.use(express.json());

// MỞ CỬA CHO FRONTEND LẤY ẢNH (Static folder)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// 6. GẮN ROUTES VÀO SERVER (MOUNT ROUTES)
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/cart", cartRoutes);
app.use("/addresses", addressRoutes);
app.use("/orders", orderRoutes);
app.use("/notifications", notificationRoutes);
app.use("/reviews", reviewRoutes);
app.use("/chatbox", chatBoxRoutes);

// 7. KIỂM TRA MÁY CHỦ VÀ CƠ SỞ DỮ LIỆU
// Kiểm tra route gốc
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Kiểm tra kết nối database
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS solution");
    res.json({
      message: "Database connection successful",
      solution: rows[0].solution,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection error",
      error: error.message,
    });
  }
});

// 8. KHỞI ĐỘNG SERVER
// Lấy port từ file .env hoặc dùng port 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
