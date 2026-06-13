const notiService = require("../services/notification.service");

// Get notifications for a user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await notiService.getUserNotifications(userId);
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy thông báo." });
  }
};
// [PUT] /notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id; // Lấy ID trên URL

    await notiService.markNotificationAsRead(notificationId, userId);

    res.status(200).json({ success: true, message: "Đã đánh dấu đọc." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi cập nhật thông báo." });
  }
};

// Xoá thông báo
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id; // Lấy ID trên URL

    await notiService.DeleteNotification(notificationId, userId);

    res.status(200).json({ success: true, message: "Đã xoá thông báo." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xoá thông báo." });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
