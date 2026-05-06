import { useState, useEffect, createContext, useContext } from "react";
import axiosClient from "../api/axiosClient";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm fetchCurrentUser sẽ được gọi khi ứng dụng khởi động để kiểm tra xem người dùng đã đăng nhập hay chưa?
  const fetchCurrentUser = async () => {
    // đọc token từ localStorage
    const token = localStorage.getItem("auth_token");

    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    try {
      // Nếu thành công thì sẽ trả về thông tin người dùng
      // Gửi request tới backend để lấy thông tin người dùng hiện tại
      //   - URL là /auth/me vì route này đã được định nghĩa trong backend để trả về thông tin người dùng hiện tại
      const response = await axiosClient.get("/auth/me");
      const user = response.data.user;
      setCurrentUser(user);
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      localStorage.removeItem("auth_token");
      setCurrentUser(null);
    } finally {
      setTimeout(() => {
        setLoading(false); // cập nhật trạng thái loading sau khi hoàn thành việc lấy thông tin người dùng, bất kể thành công hay thất bại
      }, 2000); // Giả lập thời gian chờ để thấy được hiệu ứng loading
    }
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      setCurrentUser(null);
      // Chuyển hướng về trang login khi token hết hạn
      window.location.href = "/login";
    };
    // Lắng nghe sự kiện "auth-expired" để xử lý logout khi token hết hạn
    window.addEventListener("auth-expired", handleAuthExpired);

    // Gọi hàm fetchCurrentUser khi component AuthProvider được mount để kiểm tra trạng thái đăng nhập
    fetchCurrentUser();

    // dọn dẹp sự kiện khi component unmount
    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  //   Hàm login tại sao không gọi API axios
  // Vì Login.jsx đã gọi API axios để lấy token và thông tin người dùng rồi,
  // nên ở đây chỉ cần lưu token vào localStorage và cập nhật currentUser là được
  const login = (user, token) => {
    localStorage.setItem("auth_token", token);
    setCurrentUser(user);
    setLoading(false);
  };

  //   Hàm logout  - Xóa token khỏi localStorage
  const logout = async () => {
    try {
      // GỌI THÊM DÒNG NÀY: Để backend clear cái Cookie refreshToken
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      // Dù API có lỗi hay không thì vẫn xóa ở máy mình
      localStorage.removeItem("auth_token");
      setCurrentUser(null);
    }
  };
  return (
    <AuthContext.Provider
      value={{ currentUser, loading, fetchCurrentUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
