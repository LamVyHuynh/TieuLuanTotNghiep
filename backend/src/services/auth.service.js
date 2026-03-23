function registerUser(userData) {
  // Nhận dữ liệu người dùng từ controller (được gửi từ client)
  const { full_name, email, password, confirm_password } = userData;
  console.log(
    "service userData controller gửi dữ liệu sai phía trước:",
    userData
  );
  if (!userData) {
    throw new Error("userData is undefined");
  }
  if (!full_name || !email || !password || !confirm_password) {
    throw new Error("thiếu thông tin đăng ký");
  }

  if (password.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }

  if (password !== confirm_password) {
    throw new Error("Mật khẩu và xác nhận mật khẩu không khớp");
  }
  console.log("userData:", userData);
  console.log("Full Name:", full_name);
  console.log("Email:", email);

  return { full_name, email, password, confirm_password };
}

module.exports = { registerUser };
