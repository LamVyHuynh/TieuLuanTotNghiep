import { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //   Hàm fetchCurrentUser sẽ được gọi khi ứng dụng khởi động để kiểm tra xem người dùng đã đăng nhập hay chưa?
  const fetchCurrentUser = async () => {
    // đọc token từ localStorage
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    try {
      // Nếu thành công thì sẽ trả về thông tin người dùng
      // Gửi request tới backend để lấy thông tin người dùng hiện tại
      //   - URL là /auth/me vì route này đã được định nghĩa trong backend để trả về thông tin người dùng hiện tại
      const response = await axios.get("http://localhost:5000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data.user;
      setCurrentUser(user);
      setLoading(false);
    } catch (error) {
      localStorage.removeItem("accessToken");
      setCurrentUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  //   Hàm login tại sao không gọi API axios
  // Vì Login.jsx đã gọi API axios để lấy token và thông tin người dùng rồi,
  // nên ở đây chỉ cần lưu token vào localStorage và cập nhật currentUser là được
  const login = (user, token) => {
    localStorage.setItem("accessToken", token);
    setCurrentUser(user);
    setLoading(false);
  };

  //   Hàm logout  - Xóa token khỏi localStorage
  const logout = () => {
    localStorage.removeItem("accessToken");
    setCurrentUser(null);
  };
  return (
    <AuthContext.Provider
      value={{ currentUser, loading, fetchCurrentUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

export { AuthContext, AuthProvider, useAuth };
