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
  // Lấy tên danh mục trước khi xoá để trả về
  const [rows] = await pool.query(
    "SELECT name FROM categories WHERE id_category = ?",
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  const categoryName = rows[0].name; // Lấy tên danh mục trước khi xoá

  // Tiến hành xoá
  const [result] = await pool.query(
    "DELETE FROM categories WHERE id_category = ?",
    [id],
  );

  return result.affectedRows > 0 ? categoryName : null; // Trả về true nếu có bản ghi nào bị ảnh hưởng, ngược lại trả về false
}

// Xoá nhiều danh mục cùng lúc
async function deleteMultipleCategories(categoryIds) {
  const placeholders = categoryIds.map(() => "?").join(", ");

  // Lấy tên các danh mục trước khi xoá để trả về
  const [categoriesToDelete] = await pool.query(
    `
    SELECT name FROM categories WHERE id_category IN (${placeholders})`,
    categoryIds,
  );

  const [result] = await pool.query(
    `DELETE FROM categories WHERE id_category IN (${placeholders})`,
    categoryIds,
  );

  // Rút trích mảng tên trả về
  const deletedNames = categoriesToDelete.map((cat) => cat.name);
  return {
    deletedCount: result.affectedRows,
    deletedNames: deletedNames,
  };
}

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteMultipleCategories,
};
