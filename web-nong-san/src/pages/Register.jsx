import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react"; // Icon cho xịn
import { useState } from "react";
import axios from "axios";
function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/register",
        formData
      );
      console.log("Đăng ký thành công:", response.data);
      // Có thể thêm thông báo thành công hoặc chuyển hướng sau khi đăng ký
      setSuccessMessage(response.data.message || "Đăng ký thành công");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
      });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Đăng ký thất bại"
      );
    }
  };

  return (
    <div style={styles.pageContainer}>
      <form style={styles.loginCard} onSubmit={handleSubmit}>
        <div style={styles.brandContainer}>
          <h2 style={styles.title}>Đăng ký</h2>
          <div style={styles.logoText}>
            <span style={styles.textGreen}>healthy</span>
            <span style={styles.textYellow}>GO</span>
          </div>
        </div>

        <p style={styles.subtitle}>
          <UserPlus
            size={18}
            style={{ marginRight: "8px", color: "#27ae60" }}
          />
          Tạo tài khoản mới để bắt đầu!
        </p>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        <input
          name="full_name"
          style={styles.input}
          onChange={handleChange}
          placeholder="Họ và tên"
        />
        <input
          name="email"
          style={styles.input}
          placeholder="Email của bạn"
          onChange={handleChange}
        />
        <input
          name="phone"
          style={styles.input}
          placeholder="Phone của bạn"
          onChange={handleChange}
        />
        <input
          name="password"
          style={styles.input}
          type="password"
          placeholder="Mật khẩu"
          onChange={handleChange}
        />

        <button style={styles.loginBtn} type="submit">
          Đăng ký tài khoản
        </button>

        <div style={styles.footerLink}>
          <span>Đã có tài khoản? </span>
          <Link to="/login" style={styles.link}>
            Đăng nhập ngay
          </Link>
        </div>
      </form>
    </div>
  );
}

// Mạy có thể dùng chung style với Login để web đồng bộ
const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    backgroundColor: "#f4f7f6",
  },
  loginCard: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    width: "350px",
    textAlign: "center",
  },
  brandContainer: {
    display: "flex", // Kích hoạt flexbox
    flexDirection: "row", // Nằm ngang
    justifyContent: "center", // Căn giữa nội dung
    alignItems: "baseline", // Căn các chữ thẳng hàng theo chân chữ
    marginBottom: "25px",
    gap: "10px",
  },
  title: {
    color: "#2c3e50",
    margin: 0, // Xóa margin để nó không đẩy logo xuống
    fontSize: "1.4rem",
  },
  logoText: {
    fontSize: "1.6rem", // Chỉnh lại size cho cân với chữ "Đăng nhập"
    fontWeight: "900",
    letterSpacing: "-1px",
  },
  textGreen: {
    color: "#27ae60",
  },
  textYellow: {
    color: "#f39c12",
    marginLeft: "2px",
  },
  subtitle: {
    color: "#7f8c8d",
    marginBottom: "25px",
    fontSize: "0.95rem",
    display: "flex", // Căn chỉnh icon và chữ
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
  },
  loginBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#27ae60",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    marginTop: "10px",
  },
  footerLink: {
    marginTop: "20px",
    fontSize: "0.85rem",
    color: "#7f8c8d",
  },
  link: {
    color: "#27ae60",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;
