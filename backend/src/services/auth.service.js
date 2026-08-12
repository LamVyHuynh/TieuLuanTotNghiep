// Kết nối database, xử lý logic đăng ký người dùng
const pool = require("../config/db");

// Import thư viện zod để validate dữ liệu email
const { z } = require("zod");

// Thư viện hash password
const bcrypt = require("bcrypt");
const { ca } = require("zod/v4/locales");

// import sendMail
const { sendMail } = require("../utils/sendMail");

async function registerUser(userData) {
  if (!userData) {
    throw new Error("userData is undefined");
  }

  // Nhận dữ liệu người dùng từ controller (được gửi từ client)
  const { full_name, email, phone, password } = userData;
  // console.log(
  //   "service userData controller gửi dữ liệu sai phía trước:",
  //   userData
  // );

  //làm sạch email bằng trim và tolowerCase
  const cleanEmail = email.trim().toLowerCase();

  if (!full_name || !email || !password || !phone) {
    throw new Error("Thông tin đăng ký không đầy đủ");
  }

  if (password.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  // Check Phone
  const cleanPhone = phone.trim(); // Loại bỏ khoảng trắng ở đầu và cuối;
  if (!cleanPhone) {
    throw new Error("Số điện thoại không được để trống");
  }
  if (!/^\d+$/.test(cleanPhone)) {
    throw new Error("Số điện thoại chỉ được chứa chữ số");
  }
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    throw new Error("Số điện thoại phải có 10 hoặc 11 chữ số");
  }
  // Kiểm tra trùng số điện thoại
  const [phoneRows] = await pool.query("SELECT id FROM users WHERE phone = ?", [
    cleanPhone,
  ]);
  if (phoneRows.length > 0) {
    throw new Error("Số điện thoại đã tồn tại");
  }

  // Kiểm trang trùng email

  // Kiểm tra định dạng email
  // import thư viện zod để validate dữ liệu
  const emailSchema = z.string().email();

  // safeParse() là một phương thức của Zod để kiểm tra xem dữ liệu có hợp lệ theo schema đã định nghĩa hay không.
  // safeParse() sẽ trả về một đối tượng có dạng { success: boolean, data?: T, error?: ZodError }
  const emailValidation = emailSchema.safeParse(cleanEmail);
  if (!emailValidation.success) {
    throw new Error("Email không hợp lệ");
  }

  // Bắt buộc phải dùng bất đồng bộ async/await vì query DB là bất đồng bộ
  //Node.js sẽ gửi yêu cầu qua MySQL Server
  // MySQL Server sẽ xử lý yêu cầu và trả về kết quả
  // Quá trình đó không ngay lập tức được nên phải có await để chờ kết quả trả về
  // Nếu không đợi thì code bên dưới sẽ chạy khi chưa có dữ liệu trả về
  // await pool.query() tức là gửi câu lệnh đi
  //  Đứng chờ kết quả
  // Kết quả trả về rồi gán cho biến rows
  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
    cleanEmail,
  ]);
  if (rows.length > 0) {
    throw new Error("Email đã tồn tại");
  }

  // Hash password trước khi lưu vào database
  // Hash password thì cần 2 thứ, thứ nhất là password, thứ hai là salt rounds (số lần băm)
  // Hash password là bất động bộ nên dùng await để chờ kết quả trả về
  // Nếu không dùng await thì nó sẽ trả về 1 promise chứ không phải chuỗi password đã hash
  const hashedPassword = await bcrypt.hash(password, 10);

  // Lấy role_id của role 'customer' từ bảng roles
  const [roleRows] = await pool.query("SELECT id FROM roles WHERE name = ?", [
    "customer",
  ]);
  if (roleRows.length === 0) {
    throw new Error("Role 'customer' không tồn tại trong database");
  }
  const role_id = roleRows[0].id;

  // Inser user vào database
  const [insertResult] = await pool.query(
    "INSERT INTO users(full_name, email, phone, password_hash, role_id) VALUES (?,?,?,?,?)",
    [full_name, cleanEmail, cleanPhone, hashedPassword, role_id],
  );
  return {
    id: insertResult.insertId,
    full_name,
    email,
    phone: cleanPhone,
    role_id,
  };
}

async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("Email hoặc mật khẩu không được để trống");
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Thêm avatar_url vào câu lệnh SELECT
  const [rows] = await pool.query(
    "SELECT id, full_name, email, phone, password_hash, role_id, is_active, avatar_url FROM users WHERE email = ?",
    [cleanEmail],
  );
  if (rows.length === 0) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const user = rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  if (!user.is_active) {
    throw new Error(
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.",
    );
  }

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    role_id: user.role_id,
    avatar_url: user.avatar_url, // 2. Thêm dòng này để trả ảnh về
  };
}

// Hàm xử lý chung cho TẤT CẢ các loại đăng nhập mạng xã hội
//  Nhận thêm tham số social_id
async function handleSocialUser(
  email,
  full_name,
  avatar_url,
  provider,
  social_id = null,
) {
  let targetEmail = email; // Dùng biến phụ để có thể linh hoạt đổi email

  // 1. Kiểm tra xem email đã tồn tại trong DB chưa
  const [existingUsers] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [targetEmail],
  );

  // 2. NẾU ĐÃ CÓ TÀI KHOẢN (Trùng Email)
  if (existingUsers.length > 0) {
    const user = existingUsers[0];

    // Kiểm tra xem tài khoản user có bị khoá hay chưa
    if (!user.is_active) {
      throw new Error(
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.",
      );
    }

    //  KIỂM TRA NGUỒN ĐĂNG NHẬP VÀ XỬ LÝ TRÙNG LẶP
    if (user.auth_provider !== provider) {
      // Nếu là Facebook bị trùng email -> Tự động bẻ lái sang email ảo để tạo nick riêng
      if (provider === "facebook" && social_id) {
        targetEmail = `${social_id}@facebook.local`;

        // Kiểm tra xem email ảo này đã từng được tạo chưa
        const [fakeEmailUsers] = await pool.query(
          "SELECT * FROM users WHERE email = ?",
          [targetEmail],
        );
        if (fakeEmailUsers.length > 0) {
          return fakeEmailUsers[0]; // Trả về nick facebook cũ nếu đã tạo
        }
      } else {
        // Nếu là Google đụng hàng, hoặc không có ID -> Báo lỗi thẳng mặt
        throw new Error(
          `Email này đã được đăng ký bằng ${user.auth_provider}. Vui lòng đăng nhập bằng ${user.auth_provider}!`,
        );
      }
    } else {
      // Đúng nguồn đăng nhập -> Trả về user
      return user;
    }
  }

  // 3. NẾU CHƯA CÓ TÀI KHOẢN (Hoặc vừa được bẻ lái sang email ảo) -> Khởi tạo tài khoản
  const [roleRows] = await pool.query("SELECT id FROM roles WHERE name = ?", [
    "customer",
  ]);

  if (roleRows.length === 0) {
    throw new Error("Role 'customer' không tồn tại trong database");
  }
  const role_id = roleRows[0].id;

  const randomPassword =
    Math.random().toString(36).slice(-10) +
    Math.random().toString(36).slice(-10);
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  // 🚀 LƯU VÀO DATABASE VỚI TARGET_EMAIL
  const [insertResult] = await pool.query(
    "INSERT INTO users(full_name, email, phone, password_hash, role_id, avatar_url, auth_provider) VALUES (?,?,?,?,?,?,?)",
    [full_name, targetEmail, "", hashedPassword, role_id, avatar_url, provider],
  );

  return {
    id: insertResult.insertId,
    full_name,
    email: targetEmail, // Trả về email đúng chuẩn
    phone: "",
    role_id,
    avatar_url,
    auth_provider: provider,
  };
}
async function getCurrentUserById(userId) {
  // 1. Thêm avatar_url vào câu lệnh SELECT
  const [rows] = await pool.query(
    "SELECT id, full_name, email, phone, role_id, avatar_url FROM users WHERE id = ?",
    [userId],
  );
  if (rows.length === 0) {
    throw new Error("User không tồn tại");
  }
  return {
    id: rows[0].id,
    full_name: rows[0].full_name,
    email: rows[0].email,
    phone: rows[0].phone,
    role_id: rows[0].role_id,
    avatar_url: rows[0].avatar_url,
  };
}

// Hàm ghi hoạt động
async function recordLoginLog({
  user_id,
  email,
  status,
  ip,
  userAgent,
  reason = null,
}) {
  try {
    await pool.query(
      "INSERT INTO login_logs (user_id, email_attempted, status, ip_address, user_agent, reason) VALUES (?,?,?,?,?,?)",
      [user_id, email, status, ip, userAgent, reason],
    );
  } catch (error) {
    console.error("Lỗi ghi log đăng nhập: ", error);
    // Không throw lỗi ở đây để tránh làm gián đoạn quá trình đăng nhập của user
  }
}

async function getAllLoginLogs(page = 1, limit = 5) {
  //Ép nó về kiểu nguyên để tránh lỗi SQL khi truyền tham số
  const pageNum = parseInt(page, 10) || 1; // Nếu page không phải số hợp lệ thì mặc định là 1
  const limitNum = parseInt(limit, 10) || 5; // Nếu limit không phải số hợp lệ thì mặc định là 5

  // Tính điểm bắt đầu cắt dữ liệu
  const offset = (pageNum - 1) * limitNum;
  try {
    // KỸ THUẬT SONG SONG: Chạy cả 2 câu truy vấn cùng một lúc để tiết kiệm 50% thời gian
    const [rowsResult, totalResult, statsResult] = await Promise.all([
      // Truy vấn 1: Lấy đúng 5 dòng của trang hiện tại
      pool.query(
        `SELECT l.*, u.full_name 
         FROM login_logs l
         LEFT JOIN users u ON l.user_id = u.id
         ORDER BY l.created_at DESC
         LIMIT ? OFFSET ?`,
        [limitNum, offset],
      ),
      // Truy vấn 2: Đếm tổng số dòng (MySQL sẽ tự tối ưu quét qua Index primary key)
      pool.query("SELECT COUNT(*) as total FROM login_logs"),

      //// Truy vấn 3 (CÁI MẠY ĐANG THIẾU NÈ): Đếm thống kê trên TOÀN BỘ database
      pool.query(`
        SELECT 
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successCount,
          SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failureCount,
          SUM(CASE WHEN reason LIKE '%khóa%' THEN 1 ELSE 0 END) as criticalCount
        FROM login_logs
      `),
    ]);

    // Giải nén kết quả từ Promise.all
    const rows = rowsResult[0];
    const total = totalResult[0][0].total;
    // Ép kiểu về số vì kết quả hàm SUM() trong SQL thường trả về chuỗi (String)
    const stats = {
      success: parseInt(statsResult[0][0].successCount) || 0,
      failure: parseInt(statsResult[0][0].failureCount) || 0,
      critical: parseInt(statsResult[0][0].criticalCount) || 0,
    };

    return {
      data: rows,
      total: total,
      stats: stats,
    };
  } catch (error) {
    console.error("Lỗi tối ưu truy vấn logs: ", error);
    throw error; // Ném lỗi lên controller để trả về phản hồi lỗi cho client
  }
}

// Lấy thông tin user từ database bằng userId (được lấy từ token sau khi xác thực thành công)
async function getAllUsers(page = 1, limit = 10) {
  // Ép kiểu số để tránh lỗi SQL khi truyền tham số
  const pageNum = parseInt(page, 10) || 1; // Nếu page không phải số hợp lệ thì mặc định là 1
  const limitNum = parseInt(limit, 10) || 10; // Nếu limit không phải số hợp lệ thì mặc định là 10

  // Tính điểm bắt đầu cắt dữ liệu
  const offset = (pageNum - 1) * limitNum;
  try {
    const [rowsResult, totalResult, statsResult] = await Promise.all([
      pool.query(
        `SELECT id, full_name, email, phone, avatar_url, role_id, is_active, created_at
          FROM users
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?`,
        [limitNum, offset],
      ),
      pool.query("SELECT COUNT(*) as total FROM users"),
      pool.query(`
        SELECT 
          SUM(CASE WHEN role_id = 1 THEN 1 ELSE 0 END) as adminCount,
          SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) as customerCount,
          SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) as storeOwnerCount,
          SUM(CASE WHEN is_active = 0 OR is_active = false THEN 1 ELSE 0 END) as lockedCount
        FROM users
       `),
    ]);

    return {
      data: rowsResult[0],
      total: totalResult[0][0].total,
      stats: {
        admins: parseInt(statsResult[0][0].adminCount) || 0,
        customers: parseInt(statsResult[0][0].customerCount) || 0,
        storeOwners: parseInt(statsResult[0][0].storeOwnerCount) || 0,
        locked: parseInt(statsResult[0][0].lockedCount) || 0,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy tất cả người dùng: ", error);
    throw error; // Ném lỗi lên controller để trả về phản hồi lỗi cho client
  }
}
// ĐÓNG/MỞ HOẠT ĐỘNG USER - CẬP NHẬT TRẠNG THÁI IS_ACTIVE
async function toggleUserActiveStatus(userId) {
  // Kiểm tra user có tồn tại hay chưa
  const [rows] = await pool.query("SELECT is_active FROM users WHERE id = ?", [
    userId,
  ]);
  if (rows.length === 0) {
    throw new Error("Không tìm thấy người dùng");
  }

  const currentStatus = rows[0].is_active;

  // Đảo ngược trạng thái is_active: Đang 0 thì 1, đang 1 thì 0
  const newStats = currentStatus === 1 || currentStatus === true ? 0 : 1;

  // Cập nhật vào DB
  await pool.query("UPDATE users SET is_active = ? WHERE id = ?", [
    newStats,
    userId,
  ]);

  return newStats; // Trả về trạng thái mới sau khi cập nhật
}

// XOÁ USER TRONG ADMIN DỰA TRÊN USERID
async function deleteUserById(userId) {
  // Kiểm tra user có tồn tại hay chưa
  const [rows] = await pool.query("SELECT id FROM users WHERE id=?", [userId]);
  if (rows.length === 0) {
    throw new Error("Người dùng không tồn tại");
  }

  // thực hiện xoá người dùng
  await pool.query("DELETE FROM users WHERE id=?", [userId]);

  return true; // Trả về true nếu xoá thành công
}

// CẬP NHẬT THÔNG TIN USER, CHO PHÉP CẬP NHẬT tất cả thông tin trừ password
async function updateUserById(userId, updateData) {
  const { full_name, email, phone, role_id } = updateData;

  // Kiểu tra xem người dùng có tồn tại chưa
  const [rows] = await pool.query("SELECT id FROM users WHERE id=?", [userId]);
  if (rows.length === 0) {
    throw new Error("Người dùng không tồn tại");
  }

  // Cập nhật thông tin người dùng
  await pool.query(
    "UPDATE users SET full_name=?, email=?, phone=?, role_id=? WHERE id=?",
    [full_name, email, phone, role_id, userId],
  );

  return true; // Trả về true nếu cập nhật thành công
}

// =====================================================================
//  CẬP NHẬT MẬT KHẨU NGƯỜI DÙNG (CÓ KIỂM TRA MẬT KHẨU CŨ BẢO MẬT)
// =====================================================================
async function updateUserPassword(userId, oldPassword, newPassword) {
  // 1. Kiểm tra xem người dùng có tồn tại không và lấy password_hash ra
  const [rows] = await pool.query(
    "SELECT id, password_hash FROM users WHERE id=?",
    [userId],
  );
  if (rows.length === 0) {
    throw new Error("Người dùng không tồn tại");
  }

  const user = rows[0];

  // 2. Dùng bcrypt.compare để so sánh mật khẩu cũ khách gõ với mật khẩu băm trong DB
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isPasswordValid) {
    throw new Error("Mật khẩu hiện tại không đúng");
  }

  // 3. Nếu đúng mật khẩu cũ thì mới cho băm mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 4. Lưu đè mật khẩu mới đã băm vào database
  await pool.query("UPDATE users SET password_hash=? WHERE id=?", [
    hashedPassword,
    userId,
  ]);

  return true; // Trả về true nếu cập nhật thành công
}

// CẬP NHẬT ẢNH ĐẠI DIỆN USER
async function updateUserAvatar(userId, avatarUrl) {
  // Kiểm tra xem người dùng có tồn tại chưa
  const [rows] = await pool.query("SELECT id FROM users WHERE id=?", [userId]);
  if (rows.length === 0) {
    throw new Error("Người dùng không tồn tại");
  }

  // Cập nhật đường dẫn ảnh đại diện mới vào database
  await pool.query("UPDATE users SET avatar_url=? WHERE id=?", [
    avatarUrl,
    userId,
  ]);

  return true; // Trả về true nếu cập nhật thành công
}

// =====================================================================
//  QUÊN MẬT KHẨU: TẠO OTP VÀ GỬI EMAIL
// =====================================================================
async function requestPasswordReset(email) {
  const cleanEmail = email.trim().toLowerCase();

  // Kiểm tra xem email có tồn tại trong DB không
  const [rows] = await pool.query(
    "SELECT id, full_name FROM users WHERE email = ?",
    [cleanEmail],
  );

  if (rows.length === 0) {
    throw new Error("Email này chưa được đăng ký trong hệ thống!");
  }

  const user = rows[0];

  // 2. Tạo mã opt ngẫu nhiên 6 chữ số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 3. Tính thời gian hết hạn (Hiện tại + 5 phút)
  // Tính theo múi giờ chuẩn, lấy mili-giây
  const expireTime = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

  // 4 Lưu OTP và hạn sử dụng và DB
  await pool.query(
    "UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE id = ?",
    [otp, expireTime, user.id],
  );

  // 5. Chuẩn bị nội dung Email cực xịn sò
  const subject = "Mã xác nhận khôi phục mật khẩu - HealthyGO";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #059669; text-align: center;">Khôi Phục Mật Khẩu</h2>
      <p>Chào <b>${user.full_name}</b>,</p>
      <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản HealthyGO của bạn.</p>
      <p>Mã xác nhận (OTP) của bạn là:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; background-color: #f1f5f9; padding: 15px 30px; border-radius: 8px;">${otp}</span>
      </div>
      <p style="color: #ef4444; font-size: 14px; text-align: center;"><i>Mã này sẽ hết hạn trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</i></p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="font-size: 12px; color: #64748b; text-align: center;">Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>
    </div>
  `;

  // 6. Ra lệnh gửi Email
  await sendMail(cleanEmail, subject, "Mã OTP của bạn là: " + otp, htmlContent);
  return true; // Trả về true nếu gửi email thành công
}

// =====================================================================
//  QUÊN MẬT KHẨU: XÁC THỰC OTP VÀ ĐẶT LẠI MẬT KHẨU
// =====================================================================
async function resetPasswordWithOTP(email, otp, newPassword) {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Tìm user bằng email
  const [rows] = await pool.query(
    "SELECT id, reset_otp, reset_otp_expires FROM users WHERE email = ?",
    [cleanEmail],
  );

  //  Đưa việc kiểm tra rỗng lên TRƯỚC khi lấy biến user ra
  if (rows.length === 0) {
    throw new Error("Email này chưa được đăng ký trong hệ thống!");
  }
  const user = rows[0];

  // 2. Kiểm tra xem user này có đang xin OTP không
  if (!user.reset_otp || !user.reset_otp_expires) {
    throw new Error("Mã xác nhận không hợp lệ hoặc bạn chưa yêu cầu cấp mã.");
  }

  // 3. So sánh mã OTP
  if (user.reset_otp !== otp.toString()) {
    throw new Error("Mã xác nhận (OTP) không chính xác.");
  }

  // 4. Kiểm tra thời hạn (5 phút)
  const currentTime = new Date();
  if (currentTime > user.reset_otp_expires) {
    // Nếu quá hạn thì dọn dẹp mã luôn cho rảnh nợ
    await pool.query(
      "UPDATE users SET reset_otp = NULL, reset_otp_expires = NULL WHERE id = ?",
      [user.id],
    );
    throw new Error("Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.");
  }

  // 5. Mọi thứ hợp lệ -> Tiến hành đổi mật khẩu
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 6. Cập nhật mật khẩu mới VÀ dọn sạch luôn mã OTP cũ (để không dùng lại được nữa)
  await pool.query(
    "UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE id = ?",
    [hashedPassword, user.id],
  );

  return true;
}

// Xoá người dùng hàng loạt (dành cho Admin)
async function deleteMultipleUsers(userIds) {
  // tạo ra list chọn userIds để tránh SQL Injection
  const placeholders = userIds.map(() => "?").join(",");
  const [result] = await pool.query(
    `DELETE FROM users WHERE id IN (${placeholders})`,
    userIds,
  );

  return result.affectedRows; // Trả về số lượng bản ghi bị xoá
}
module.exports = {
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
  requestPasswordReset,
  resetPasswordWithOTP,
  handleSocialUser, // Xuất ra hàm xử lý chung cho MXH
  deleteMultipleUsers,
};
