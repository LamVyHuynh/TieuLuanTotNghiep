import axios from "axios";

// 1. Tạo instance của axios
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // URL của backend
  withCredentials: true, // Cho phép gửi cookie (refresh token) cùng request
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
  async (error) => {
    const originalRequest = error.config; // Lấy config gốc của request bị lỗi
    // Nếu gặp lỗi 401 (Unauthorized) và request này chưa từng được retry (để tránh lặp vô hạn)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Đánh dấu request này đang được xử lý thử lại

      try {
        console.warn(
          "Access token có thể đã hết hạn, đang tự động làm mới ngầm...",
        );

        // 1. Gọi API  /auth/refresh-token để lấy access token mới
        // Dùng chính axios gốc chứ không dùng axiosClient để tránh bị lặp vô hạn interceptor
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }, // gửi kèm cookie refreshToken
        );

        const newAccessToken = response.data.token; // Giả sử backend trả về access token mới trong trường accessToken

        //2. Lưu access token mới vào localStorage hoặc bộ nhớ tạm
        localStorage.setItem("auth_token", newAccessToken);

        // 3. Cập nhật header Authorization của request của bằng Token mới vừa lấy được
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // 4. Thực thi lại request  bị xịt lúc nãy với Token mới. Đảm bảo user không phát hiện ra điều gì và không bị gián đoạn trải nghiệm
        return axiosClient(originalRequest); // Gọi lại request ban đầu với token mới
      } catch (refreshError) {
        // Nếu đến cả việc gọi API /refresh cũng thất bại (tức là Refresh Token 7 ngày cũng chết luôn)
        console.error("Refresh Token cũng hết hạn! Đang tự động đăng xuất...");
        // Nếu làm mới token cũng thất bại (ví dụ refresh token hết hạn) thì xóa token cũ và chuyển hướng về trang đăng nhập
        localStorage.removeItem("auth_token");

        // Phát sự kiện bắt văng ra trang Login (y hệt Phase 1 mạy đã làm xịn xò)
        window.dispatchEvent(new Event("auth-expired"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error); // Nếu lỗi không phải 401 hoặc đã retry rồi thì trả về lỗi gốc
  },
);

export default axiosClient;
