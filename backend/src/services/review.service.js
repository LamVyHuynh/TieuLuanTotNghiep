const pool = require("../config/db");

// Thêm đánh giá mới
const createReview = async (userId, productId, rating, comment) => {
  try {
    const query = `INSERT INTO reviews (user_id, id_product, rating, comment) VALUES (?,?,?,?)`;
    const values = [userId, productId, rating, comment];
    const result = await pool.query(query, values);
    return result.insertId; // Trả về ID của đánh giá mới tạo
  } catch (error) {
    console.log("Lỗi khi tạo đánh giá", error);
    throw error;
  }
};

// Lấy danh sách đánh giá của 1 sản phẩm
const getReviewByProductId = async (productId) => {
  try {
    const query = `SELECT r.id_review, r.rating, r.comment, r.created_at, u.full_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id_product = ?
      ORDER BY r.created_at DESC`;
    const [rows] = await pool.query(query, [productId]);
    return rows;
  } catch (error) {
    console.log("Lỗi khi lấy đánh giá", error);
    throw error;
  }
};

module.exports = { createReview, getReviewByProductId };
