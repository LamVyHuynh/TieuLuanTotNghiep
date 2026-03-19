// Import thư viện
// import framwork express: tạo server,tạo API,xử lý request/response

// import thư viện cors: giải quyết lỗi CORS khi frontend và backend khác domain
const express = require("express");

// Đọc file env để lấy biến môi trường PORT, DB_HOST, DB_USER… từ file .env.
const dotenv = require("dotenv");
dotenv.config();

// Pool kết nối database
const pool = require("./config/db");

// Impor routes
// const authRoutes = require("./routes/auth.routes");

// Tạo ứng dụng express
// Hiểu đơn giản app = server
// Sau này có thể dùng: app.get, app.post, app.listen,... để tạo API, xử lý request/response
const app = express();
// Middleware (phần mềm trung gian) để xử lý request trước khi đến route handler
// Cho phép react gọi backend bằng cách giải quyết lỗi CORS
const cors = require("cors");
app.use(cors());
// Cho phép server đọc JSON từ request body
app.use(express.json());
// Mount routes (gắn route)
// Gắn route vào server
// app.use("/auth", authRoutes);

// Kiểm tra route
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
    // 500 là lỗi server máy chủ gặp sự cố hoặc không thể hoàn thành yêu cầu từ trình duyệt
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});
// Lấy port từ file .env hoặc dùng port 5000 nếu không có biến môi trường PORT
const PORT = process.env.PORT || 5000;

// Khởi động server(máy chủ)
// server mở cổng (port) và chờ request(yêu cầu gửi đến)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
