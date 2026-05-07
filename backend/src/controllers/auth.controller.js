const { success } = require("zod");
const {
  registerUser,
  loginUser,
  getCurrentUserById,
  recordLoginLog,
  getAllLoginLogs,
  getAllUsers,
} = require("../services/auth.service");

// Thư viện jsonwebtoken có 3 mục đích chính:
//  1. Tạo token:  jsonwebtoken.sign() tạo ra token mới dựa trên payload (thông tin người dùng) và secret key (để đảm bảo tính bảo mật của token).
//  Và còn thêm 1 chỉ số nữa là expiresIn để xác định thời gian hết hạn của token
//  Khi đăng nhập thành công sẽ tạo ra jwt
// 2. Xác thực token: jsonwebtoken.verify() được dùng để xác thực token đã tạo ra trước đó, xem nó có hợp lệ không?
// backend nhận token từ client gửi lên từ frontend,
// Kiểm tra xem chữ kí token có hợp lệ chưa
// Token có hết hạng chưa
// 3. giải mã token: jsonwebtoken.decode() được dùng để giải mã token mà không cần xác thực
//  Nó sẽ trả về payload (đối tượng chức thông tin người dùng) mà không kiểm tra tính hợp lệ của token
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
  // Lấy dữ liệu người dùng từ request body (dữ liệu được gửi từ client qua postman)
  const userData = req.body;

  // console.log("user data ở controller (postman gửi dữ liệu qua):", userData);
  try {
    // Lấy kết quả xử lí từ service
    const result = await registerUser(userData);

    // Kiểm tra kết quả trả về từ service xem nó có undefined / null hay không
    if (!result) {
      throw new Error("Kết quả trả về từ service không hợp lệ");
    }
    // lệnh throw này dùng để thử lỗi, nếu gặp  thì tất cả những câu lệnh phía dưới nó đều không chạy
    //  Nó sẽ dừng lại ngay lập tức và chuyển qua catch để xử lý lỗi
    // throw new Error("This is a test error");

    res.status(201).json({
      message: "Register successful",
      data: result,
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
      return res.status(400).json({
        message: error.message,
      });
    }
    if (
      error.message === "Email đã tồn tại" ||
      error.message === "Số điện thoại đã tồn tại" ||
      error.message === "Role 'customer' không tồn tại" ||
      error.message === "userData is undefined"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  // Lấy dữ liệu đăng nhập từ request body (email và password)
  const { email, password } = req.body;

  // Lấy ip và thông tin thiết bị
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  try {
    const result = await loginUser(email, password);

    // ghi log thành công
    await recordLoginLog({
      user_id: result.id,
      email: email,
      status: "success",
      ip,
      userAgent,
    });

    // Tạo token JWT với payload chứa id và role của người dùng,
    // secret key lấy từ biến môi trường JWT_SECRET,
    //  Số ngắn 15 phút để tăng tính bảo mật (nếu token bị đánh cắp thì kẻ xấu chỉ có thể sử dụng trong 15 phút)
    const accessToken = jwt.sign(
      { id: result.id, role: result.role_id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    // Tạo refresh toke với sống dài 7 ngày
    const refreshToken = jwt.sign(
      {
        id: result.id,
        role: result.role_id,
      },
      process.env.JWT_REFRESH_SECRET || "CaiNayLaSecretKhoaRefreshNheMay",
      { expiresIn: "7d" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Ngăn chặn JS truy cập (tránh hacker dùng XSS để đánh cắp token)
      secure: false, // set thành true khi chạy https thật(production), để chỉ gửi cookie qua kết nối an toàn
      sameSite: "lax", // Đảm bảo trình duyệt tự động đính kèm cookie khi gọi API domain
      maxAge: 7 * 24 * 60 * 60 * 1000, // Thời gian sống của cookie (7 ngày)
    });
    res.status(200).json({
      message: "Login successful",
      token: accessToken, // Gửu accessToken cho frontend để lưu vào bộ nhớ tạm thời (ví dụ: localStorage, sessionStorage) và đính kèm vào header của những request sau này để xác thực
      user: result,
    });
  } catch (error) {
    // ghi log thất bại
    await recordLoginLog({
      user_id: null, // thường không có id là lỗi
      email: email,
      status: "failure",
      ip,
      userAgent,
      reason: error.message,
    });

    if (error.message === "Email hoặc mật khẩu không đúng") {
      return res.status(400).json({
        message: error.message,
      });
    }

    // 1. Bắt lỗi tài khoản bị khóa (MỚI THÊM)
    if (
      error.message ===
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết."
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }
    // 2. Bắt lỗi sai thông tin đăng nhập
    if (error.message === "Email hoặc mật khẩu không đúng") {
      return res.status(401).json({
        message: error.message,
      });
    }
    // 3. Bắt lỗi để trống thông tin
    if (error.message === "Email hoặc mật khẩu không được để trống") {
      return res.status(400).json({ message: error.message });
    }
    // 4. Các lỗi server khác
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    // Xóa cookie refresh token ở client bằng cách gửi cookie rỗng với maxAge = 0
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // Để true nếu dùng https
      sameSite: "lax",
    });

    res
      .status(200)
      .json({ message: "Đăng xuất thành công (Phiên làm việc đã kết thúc)" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi logout",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id; // Thông tin được lấy từ middleware authenticateToken sau khi xác thực token thành công

    const user = await getCurrentUserById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User không tồn tại",
      });
    }
    res.status(200).json({
      message: "Lấy thông tin người dùng thành công",
      user: user,
    });
  } catch (error) {
    if (
      error.message === "Token không tồn tại" ||
      error.message === "Token không hợp lệ, truy cập bị từ chối"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const fetchAllLogs = async (req, res) => {
  try {
    // Hứng param từ URL(ví dụ: /auth/login?page=2&limit=5).Nếu không có thì lấy mặt định là 1 và 5
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;

    // Truyền xuống service để lấy log với phân trang
    const result = await getAllLoginLogs(page, limit);
    res.status(200).json({
      success: true,
      data: result.data, // chứa mảng 5 cái log
      total: result.total, // tổng số log trong database
      stats: result.stats, // thống kê trạng thái (success, failure, critical)
    });
  } catch (error) {
    // Nếu sập, nó sẽ lọt vào đây và trả về 500 kèm chi tiết lỗi
    res.status(500).json({
      message: "Lỗi server khi lấy log",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    // 1. Đọc refresh token từ cookie gửi lên
    const refreshToken = req.cookies.refreshToken; // Lấy refresh token từ cookie
    if (!refreshToken) {
      return res.status(401).json({
        message: "Không tìm thấy phiên đăng nhập cũ (Refresh Token missing)",
      });
    }

    // 2. Xác thực refresh token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "CaiNayLaSecretKhoaRefreshNheMay",
      (err, decoded) => {
        if (err) {
          // Nếu refresh token hết hạn hoặc giả mạo thì đuổi cổ cho đăng
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

// Lấy danh sách tất cả người dùng (MỚI THÊM)
const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      message: "Lấy danh sách người dùng thành công",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách người dùng",
      error: error.message,
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
};
