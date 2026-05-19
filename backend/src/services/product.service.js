// 1. Phải import cái pool từ file cấu hình DB của mạy
const pool = require("../config/db");

async function createProduct(productData) {
  const {
    id_Store,
    id_Category,
    name,
    description,
    price,
    discount_price,
    unit,
    stock_quantity,
    calories,
    protein,
    carbs,
    fat,
    image_url,
    status, // Nếu mạy muốn truyền status từ ngoài vào
  } = productData;

  // 2. Chỉnh lại câu Query:
  // - Bỏ created_at, updated_at ra khỏi danh sách VALUES nếu dùng NOW()
  // - Đảm bảo số lượng ? khớp chính xác với mảng bên dưới
  const [result] = await pool.query(
    `INSERT INTO product (
      id_Store, id_Category, name, description, price, 
      discount_price, unit, stock_quantity, calories, 
      protein, carbs, fat, image_url, status, 
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      id_Store,
      id_Category,
      name,
      description,
      price,
      discount_price || null,
      unit,
      stock_quantity || 0,
      calories || 0,
      protein || 0,
      carbs || 0,
      fat || 0,
      image_url,
      status || "active", // Để là 'active' hoặc 1 tùy mạy thiết kế DB
    ],
  );

  return result.insertId;
}

// Lấy danh sách sản phẩm
async function getAllProducts() {
  const [rows] = await pool.query(
    "SELECT * FROM product ORDER BY created_at DESC",
  );
  return rows;
}

module.exports = {
  createProduct,
  getAllProducts,
};
