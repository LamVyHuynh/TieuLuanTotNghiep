// Dòng này import thư viện mysql2 để Node.js có thể kết nối MySQL database.
// mysql2/promise nghĩa là:
// → dùng Promise + async/await
const mysql = require("mysql2/promise");
require("dotenv").config();

// Tạo pool kết nối đến MySQL
// createPool() tạo connection pool
// Connection pool nghĩa là:
// Server tạo sẵn nhiều kết nối database để dùng lại
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
// Dòng này export pool ra ngoài để các file khác dùng.
module.exports = pool;
