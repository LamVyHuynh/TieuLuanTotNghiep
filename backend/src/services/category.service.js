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
module.exports = {
  createCategory,
  getAllCategories,
};
