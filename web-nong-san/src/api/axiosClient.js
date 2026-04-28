import axios from "axios";

// 1. Tạo instance của axios
const axiosClient = axios.create({
  baseURL: "http://localhost: 500", // URL của backend
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request interceptor: Tự động gắn token vào mỗi request gửi đi
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token"); // Lấy token từ localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Response Interceptor: "Đánh chặn" kết quả trả về để check lỗi 401
axiosClient.interceptors.response.use(
  (response) => response, // Nếu thành công thì cho qua
  (error) => {
    // Nếu gặp lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      const errorType = error.response.data.type;

      // Nếu đúng là lỗi token hết hạn hoặc thiếu token
      if (errorType === "TOKEN_EXPIRED" || errorType === "TOKEN_MISSING") {
        console.warn("Phiên đăng nhập hết hạn, đang tự động logout...");

        // Xóa dữ liệu cũ
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");

        // Chuyển hướng về trang login (Dùng window.location vì đây không phải React Component)
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
