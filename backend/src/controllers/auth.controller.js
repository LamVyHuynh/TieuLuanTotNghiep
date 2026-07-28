const { success } = require("zod");
const {
  registerUser,
  loginUser,
  getCurrentUserById,
  recordLoginLog,
  getAllLoginLogs,
  getAllUsers,
  toggleUserActiveStatus,
  deleteUserById,
  updateUserById,
  updateUserPassword,
  updateUserAvatar,
} = require("../services/auth.service");
const { uploadToSupabase } = require("../utils/uploadHelper");

const jwt = require("jsonwebtoken");

// 1. IMPORT MÁY DỊCH MÃ VÀO
const { encodeId, decodeId } = require("../utils/hashid.util");
const { PawPrint } = require("lucide-react");

const register = async (req, res) => {
  const userData = req.body;

  try {
    if (req.file) {
      const avatarUrl = await uploadToSupabase(req.file, "avatars");
      userData.avatar_url = avatarUrl; // Nhét link vào userData trước khi gọi service
    }
    const result = await registerUser(userData);

    if (!result) {
      throw new Error("Kết quả trả về từ service không hợp lệ");
    }

    // 2. MÃ HOÁ ID TRƯỚC KHI GỬI VỀ CHO REACT
    const safeUser = {
      ...result,
      id: encodeId(result.id),
    };

    res.status(201).json({
      message: "Register successful",
      data: safeUser, // Trả về user có ID đã mã hoá
    });
  } catch (error) {
    if (
      error.message === "Thông tin đăng ký không đầy đủ" ||
      error.message === "Mật khẩu phải có ít nhất 8 ký tự" ||
      error.message === "Số điện thoại không được để trống" ||
      error.message === "Số điện thoại chỉ được chứa chữ số" ||
      error.message === "Số điện thoại phải có 10 hoặc 11 chữ số" ||
      error.message === "Email không hợp lệ"
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (
      error.message === "Email đã tồn tại" ||
      error.message === "Số điện thoại đã tồn tại" ||
      error.message === "Role 'customer' không tồn tại" ||
      error.message === "userData is undefined"
    ) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  try {
    const result = await loginUser(email, password);

    await recordLoginLog({
      user_id: result.id,
      email: email,
      status: "success",
      ip,
      userAgent,
    });

    // LƯU Ý: JWT VẪN DÙNG ID THẬT ĐỂ MIDDLEWARE BÊN TRONG HỆ THỐNG XỬ LÝ CHO NHANH
    // Client không đọc được cái token này (đã bị băm) nên cứ để số nguyên cho nhẹ.
    const accessToken = jwt.sign(
      { id: result.id, role: result.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: result.id, role: result.role_id },
      process.env.JWT_REFRESH_SECRET || "CaiNayLaSecretKhoaRefreshNheMay",
      { expiresIn: "7d" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 3. NHƯNG KHI GỬI THÔNG TIN BỀ MẶT CHO REACT THÌ PHẢI MÃ HOÁ
    const safeUser = {
      ...result,
      id: encodeId(result.id),
    };

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: safeUser,
    });
  } catch (error) {
    await recordLoginLog({
      user_id: null,
      email: email,
      status: "failure",
      ip,
      userAgent,
      reason: error.message,
    });

    if (error.message === "Email hoặc mật khẩu không đúng") {
      return res.status(400).json({ message: error.message });
    }
    if (
      error.message ===
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."
    ) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Email hoặc mật khẩu không đúng") {
      return res.status(401).json({ message: error.message });
    }
    if (error.message === "Email hoặc mật khẩu không được để trống") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res
      .status(200)
      .json({ message: "Đăng xuất thành công (Phiên làm việc đã kết thúc)" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi logout", error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ JWT nên nó đang là số thật

    const user = await getCurrentUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // 4. MÃ HOÁ ID TRƯỚC KHI TRẢ VỀ CHO REACT
    const safeUser = {
      ...user,
      id: encodeId(user.id),
    };

    res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      user: safeUser,
    });
  } catch (error) {
    if (
      error.message === "Token không tồn tại" ||
      error.message === "Token không hợp lệ, truy cập bị từ chối"
    ) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const fetchAllLogs = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;

    const result = await getAllLoginLogs(page, limit);

    // 5. MÃ HOÁ DANH SÁCH LOG (Mã hoá user_id bên trong log)
    const safeLogs = result.data.map((log) => ({
      ...log,
      id: encodeId(log.id), // Nếu log có id riêng thì mã hoá luôn
      user_id: encodeId(log.user_id), // Mã hoá khóa ngoại
    }));

    res.status(200).json({
      success: true,
      data: safeLogs,
      total: result.total,
      stats: result.stats,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy log", error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "Không tìm thấy phiên đăng nhập cũ (Refresh Token missing)",
      });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "CaiNayLaSecretKhoaRefreshNheMay",
      (err, decoded) => {
        if (err) {
          return res.status(403).json({
            message:
              "Phiên đăng nhập đã hết hạn vui lòng đăng nhập lại (Invalid Refresh Token)",
          });
        }

        const newAccessToken = jwt.sign(
          {
            id: decoded.id,
            role: decoded.role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "15m" },
        );

        res.status(200).json({
          message: "Token mới đã được tạo",
          token: newAccessToken,
        });
      },
    );
  } catch (error) {
    res.status(500).json({
      message: "Lỗi hệ thống khi refresh token",
      error: error.message,
    });
  }
};

// Lấy danh sách tất cả người dùng (Admin)
const fetchAllUsers = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const result = await getAllUsers(page, limit);

    // 6. MÃ HOÁ DANH SÁCH USER CHO ADMIN
    const safeUsers = result.data.map((u) => ({
      ...u,
      id: encodeId(u.id),
    }));

    res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      data: safeUsers,
      total: result.total,
      stats: result.stats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái hoạt động của người dùng (Khóa / Mở Khóa)
const toggleUserLock = async (req, res) => {
  try {
    // 7. GIẢI MÃ ID TỪ URL
    const userId = decodeId(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const newStats = await toggleUserActiveStatus(userId);
    res.status(200).json({
      message: "Trạng thái người dùng đã được cập nhật",
      status: newStats,
    });
  } catch (error) {
    if (error.message === "Không tìm thấy người dùng") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({
      message: "Lỗi server khi cập nhật trạng thái người dùng",
      error: error.message,
    });
  }
};

// Xóa user trong trang admin
const deleteUser = async (req, res) => {
  try {
    // 8. GIẢI MÃ ID TỪ URL
    const userId = decodeId(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    await deleteUserById(userId);
    res.status(200).json({
      message: "Người dùng đã được xoá thành công",
    });
  } catch (error) {
    if (error.message === "Không tìm thấy người dùng") {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Lỗi server khi xoá người dùng", error: error.message });
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    // 9. GIẢI MÃ ID TỪ URL
    const userId = decodeId(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const updateData = req.body;

    if (req.file) {
      const avatarUrl = await uploadToSupabase(req.file, "avatars");
      userData.avatar_url = avatarUrl; // Nhét link vào userData trước khi gọi service
    }

    const updateddUser = await updateUserById(userId, updateData);

    // 10. MÃ HOÁ ID SAU KHI UPDATE XONG ĐỂ TRẢ VỀ
    const safeUser = {
      ...updateddUser,
      id: encodeId(updateddUser.id),
    };

    res.status(200).json({
      message: "Thông tin người dùng đã được cập nhật thành công",
      user: safeUser,
    });
  } catch (error) {
    if (error.message === "Không tìm thấy người dùng") {
      return res.status(404).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật thông tin người dùng" });
  }
};

// Cập nhật mật khẩu người dùng
const changePassword = async (req, res) => {
  try {
    // 11. GIẢI MÃ ID TỪ URL
    const userId = decodeId(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    const { new_password } = req.body;

    if (!new_password || new_password.length < 8) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    await updateUserPassword(userId, new_password);
    res.status(200).json({
      message: "Mật khẩu đã được cập nhật thành công",
    });
  } catch (error) {
    if (error.message === "Không tìm thấy người dùng")
      return res.status(404).json({ message: error.message });
    if (error.message === "Mật khẩu hiện tại không đúng")
      return res.status(400).json({ message: error.message });
    if (error.message === "Mật khẩu mới phải có ít nhất 8 ký tự")
      return res.status(400).json({ message: error.message });

    res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật mật khẩu người dùng" });
  }
};

const updateAvatar = async (req, res) => {
  try {
    // 1. GIẢI MÃ ID TỪ URL
    const userId = decodeId(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ" });
    }

    // 2. Kiểm tra xem multer có bắt được file ảnh không
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn một bức ảnh!" });
    }

    // 3. Tạo đường link ảo để lưu vào DB (tên file đã được multer đổi tên)
    // const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    // Dùng công cụ đẩy lên thư mục avatar trong kho của Supabase
    const avatarUrl = await uploadToSupabase(req.file, "avatars");

    // 4. Gọi Service để lưu vào Database
    await updateUserAvatar(userId, avatarUrl);

    // 5. Trả về phản hồi thành công
    res.status(200).json({
      message: "Cập nhật ảnh đại diện thành công",
      avatarUrl: avatarUrl,
    });
  } catch (error) {
    if (error.message === "Không tìm thấy người dùng") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({
      message: "Lỗi server khi cập nhật ảnh đại diện",
      error: "Lỗi: " + error.message,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  fetchAllLogs,
  getMe,
  refreshToken,
  fetchAllUsers,
  toggleUserLock,
  deleteUser,
  updateUser,
  changePassword,
  updateAvatar,
};
