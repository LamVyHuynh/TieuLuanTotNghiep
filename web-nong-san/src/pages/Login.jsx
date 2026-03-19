import { Link } from "react-router-dom";
function Login() {
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

        <input style={styles.input} placeholder="Tên tài khoản" />
        <input style={styles.input} type="password" placeholder="Mật khẩu" />

        <button
          style={styles.loginBtn}
          onClick={() => alert("Đăng nhập thành công")}
        >
          Đăng nhập
        </button>

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
