const pool = require("../config/db");

// Thêm danh mục mới
// status = 1 là hiển thị, status = 0 là ẩn
async function createCategory(data) {
  const status = data.status ?? 1; // Đảm bảo status chỉ nhận giá trị 1 hoặc 0
  const [result] = await pool.query(
    "INSERT INTO categories (name, description, image_url, status) VALUES (?, ?, ?, ?)",
    [data.name, data.description, data.image_url, status],
  );

  return result.insertId;
}

// Hiển thị danh sách danh mục
async function getAllCategories() {
  const [rows] = await pool.query("SELECT * FROM categories");
  return rows;
}

// Cập nhật thông tin danh mục
async function updateCategory(id, data) {
  const status = data.status ?? 1; // Đảm bảo status chỉ nhận giá trị 1 hoặc 0
  const [result] = await pool.query(
    "UPDATE categories SET name = ?, description = ?, image_url = ?, status = ? WHERE id_category = ?",
    [data.name, data.description, data.image_url, status, id],
  );
  return result.affectedRows > 0; // Trả về true nếu có bản ghi nào bị ảnh hưởng, ngược lại trả về false
}

// Hàm xoá danh mục
async function deleteCategory(id) {
  const [result] = await pool.query(
    "DELETE FROM categories WHERE id_category = ?",
    [id],
  );
  return result.affectedRows > 0; // Trả về true nếu có bản ghi nào bị ảnh hưởng, ngược lại trả về false
}

// Xoá nhiều danh mục cùng lúc
async function deleteMultipleCategories(categoryIds) {
  const placeholders = categoryIds.map(() => "?").join(", ");

  const [result] = await pool.query(
    `DELETE FROM categories WHERE id_category IN (${placeholders})`,
    categoryIds,
  );

  return result.affectedRows; // Trả về số lượng bản ghi bị xoá
}

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteMultipleCategories,
};
