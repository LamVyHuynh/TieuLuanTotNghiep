const pool = require("../config/db");

async function getDefaultAddress(userId) {
  const query =
    "SELECT * FROM user_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1";
  const [rows] = await pool.execute(query, [userId]);
  if (rows.length > 0) {
    return rows[0];
  }
  return null;
}

// lấy tất cả địa chỉ
async function getAllAddresses(userId) {
  const query = "SELECT * FROM user_addresses WHERE user_id=?";
  const [rows] = await pool.execute(query, [userId]);
  if (rows.length > 0) {
    return rows;
  }
  return null;
}

// Thêm mới địa chỉ cho người dùng
async function addAddress(userId, addressData) {
  // Đầu tiên kiểm tra xem đã có địa chỉ nào hay chưua
  const checkQuery =
    "SELECT COUNT(*) as total FROM user_addresses WHERE user_id=?";
  const [rows] = await pool.execute(checkQuery, [userId]);
  const addressCount = rows[0].total;

  //Bước 2 quyết định mặc định địa chỉ hay không
  let final_to_set_default = 0; // Mặc định không phải là địa chỉ mặc định
  if (addressCount === 0) {
    final_to_set_default = 1; // Nếu chưa có địa chỉ nào, thì địa chỉ mới sẽ được đặt làm mặc định
  }

  // Thêm vào DB
  const insertQuery = `INSERT INTO user_addresses(user_id, receiver_name, phone, address, is_default) VALUES (?, ?, ?, ?, ?)`;
  const [result] = await pool.execute(insertQuery, [
    userId,
    receiver_name || null,
    phone || null,
    address,
    final_to_set_default,
  ]);

  return result.insertId;
}

module.exports = {
  getDefaultAddress,
  getAllAddresses,
  addAddress,
};
