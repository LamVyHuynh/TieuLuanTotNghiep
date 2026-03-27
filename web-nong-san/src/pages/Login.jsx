import { Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
function Login() {
  const [frmDataLogin, setFrmDataLogin] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Dùng tạm navigate để mô phỏng chức năng điều hướng sau khi đăng nhập thành công,
  // ví dụ: navigate("/home") để chuyển đến trang home
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFrmDataLogin({ ...frmDataLogin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    //e.preventDefault không cho gửi form theo cách truyền thống - gửi và tải lại trang
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        frmDataLogin
      );

      setSuccessMessage(response.data.message || "Đăng nhập thành công");
      setFrmDataLogin({ email: "", password: "" });
      // setTimeout(() => navigate("/"), 1500); // Chuyển đến trang home sau 1.5 giây
      console.log("Login successful:", response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Đăng nhập thất bại"
      );
    }
  };
  return (
    <div style={styles.pageContainer}>
      <div style={styles.loginCard}>
        {/* Khối này sẽ căn giữa mọi thứ */}
        <div style={styles.brandContainer}>
          <h2 style={styles.title}>Đăng nhập</h2>
          <div style={styles.logoText}>
            <span style={styles.textGreen}>healthy</span>
            <span style={styles.textYellow}>GO</span>
          </div>
        </div>

        <p style={styles.subtitle}>👏 Chào mừng mạy trở lại! 😊</p>

        <form onSubmit={handleSubmit}>
          {errorMessage ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}
          <input
            style={styles.input}
            placeholder="Email của bạn"
            name="email"
            type="email"
            onChange={handleChange}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Mật khẩu"
            name="password"
            onChange={handleChange}
          />

          <button style={styles.loginBtn} type="submit">
            Đăng nhập
          </button>
        </form>

        <div style={styles.footerLink}>
          <Link to="/forgot-password" style={styles.link}>
            Quên mật khẩu?
          </Link>
          <span style={{ color: "#999", margin: "0 10px" }}>|</span>
          <Link to="/register" style={styles.link}>
            Chưa có tài khoản?
          </Link>
        </div>
      </div>
    </div>
  );
}

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
export default Login;
