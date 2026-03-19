import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react"; // Icon cho xịn

function Register() {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.loginCard}>
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

        <input style={styles.input} placeholder="Họ và tên" />
        <input style={styles.input} placeholder="Email hoặc số điện thoại" />
        <input style={styles.input} type="password" placeholder="Mật khẩu" />
        <input
          style={styles.input}
          type="password"
          placeholder="Xác nhận mật khẩu"
        />

        <button
          style={styles.loginBtn}
          onClick={() =>
            alert("Đăng ký thành công! Chào mừng mạy đến với healthyGO")
          }
        >
          Đăng ký tài khoản
        </button>

        <div style={styles.footerLink}>
          <span>Đã có tài khoản? </span>
          <Link to="/login" style={styles.link}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
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
