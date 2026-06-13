const pool = require("../config/db");

// Chức năng tạo thông báo mới
async function createNotification(userId, title, message) {
  try {
    const query = `INSERT INTO notifications (user_id,title,message) VALUES (?,?,?)`;
    await pool.query(query, [userId, title, message]);
    return true;
  } catch (error) {
    console.log("Lỗi khi tạo thông báo DB: ", error);
    return false;
  }
}

// Chức năng lấy danh sách thông báo của người dùng
async function getUserNotifications(userId) {
  try {
    const query = `SELECT id_notification, title, message, is_read, created_at 
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50`;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  } catch (error) {
    console.log("Lỗi lấy danh sách thông báo DB:", error);
    throw error;
  }
}

// Chức năng đánh dấu thông báo đã đọc
async function markNotificationAsRead(notificationId, userId) {
  try {
    const query = `UPDATE notifications SET is_read = 1 WHERE id_notification = ? AND user_id = ?`;
    const [result] = await pool.query(query, [notificationId, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.log("Lỗi cập nhật trạng thái thông báo: ", error);
    throw error;
  }
}

// Chức năng xóa thông báo (nếu cần thiết)
async function DeleteNotification(notificationId, userId) {
  try {
    const query = `DELETE FROM notifications WHERE id_notification = ? AND user_id = ?`;
    const [result] = await pool.query(query, [notificationId, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.log("Lỗi khi xóa thông báo: ", error);
    throw error;
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  DeleteNotification,
};
