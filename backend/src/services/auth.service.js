function registerUser(userData) {
  if (!userData) {
    throw new Error("userData is undefined");
  }
  // Nhận dữ liệu người dùng từ controller (được gửi từ client)
  const { full_name, email, phone, password, confirm_password } = userData;
  console.log(
    "service userData controller gửi dữ liệu sai phía trước:",
    userData
  );

  if (!full_name || !email || !password || !confirm_password || !phone) {
    throw new Error("thiếu thông tin đăng ký");
  }

  if (password.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (password !== confirm_password) {
    throw new Error("Mật khẩu và xác nhận mật khẩu không khớp");
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

  console.log("userData:", userData);
  console.log("Full Name:", full_name);
  console.log("Email:", email);
  console.log("Phone:", phone);

  return { full_name, email, phone, password, confirm_password };
}

module.exports = { registerUser };
