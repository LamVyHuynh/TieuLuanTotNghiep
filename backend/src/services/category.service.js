const pool = require("../config/db");

// Thêm danh mục mới
async function createCategory(data) {
  const [result] = await pool.query(
    "INSERT INTO categories (name, description, image_url, status) VALUES (?, ?, ?, ?)",
    [data.name, data.description, data.image_url, data.status || "active"],
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
  const [result] = await pool.query(
    "UPDATE categories SET name = ?, description = ?, image_url = ?, status = ? WHERE id_category = ?",
    [data.name, data.description, data.image_url, data.status, id],
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

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
