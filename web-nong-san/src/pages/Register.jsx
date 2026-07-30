import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  Lock,
  Mail,
  Phone,
  Truck,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
// IMPORT: Lấy component GoogleLogin chính chủ
import { GoogleLogin } from "@react-oauth/google";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  // =================================================================
  // STATE TẠO HIỆU ỨNG TRƯỢT CHUYỂN TRANG
  // =================================================================
  const [isExiting, setIsExiting] = useState(true);
  const [slideDirection, setSlideDirection] = useState("-translate-x-12");

  useEffect(() => {
    const resetAnimation = setTimeout(() => {
      setIsExiting(false);
    }, 10);
    return () => clearTimeout(resetAnimation);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    if (location.pathname === path) return;

    if (path === "/" || path === "/login" || path === -1) {
      setSlideDirection("translate-x-12"); // Đăng nhập / Trang chủ -> Lướt qua Phải
    } else {
      setSlideDirection("-translate-x-12");
    }

    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 400);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleBlurEmail = () => {
    if (formData.email.trim() !== "") {
      const isValid = validateEmail(formData.email);
      setIsEmailValid(isValid);
    } else {
      setIsEmailValid(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!agreeTerms) {
      setErrorMessage("Bạn cần đồng ý điều khoản trước khi đăng ký.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      // BƯỚC 1: TẠO KIỆN HÀNG FORMDATA THỰC SỰ
      const submitData = new FormData();
      submitData.append("full_name", formData.full_name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("password", formData.password);

      // BƯỚC 2: GỬI KIỆN HÀNG VỚI ĐÚNG LOẠI CONTENT-TYPE
      const response = await axiosClient.post("/auth/register", submitData);
      const { user, token } = response.data;

      if (user && token) {
        login(user, token);
      }

      setSuccessMessage(response.data.message || "Đăng ký thành công");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        password: "",
      });
      setAgreeTerms(false);

      setTimeout(() => {
        setSlideDirection("translate-x-12");
        setIsExiting(true);
        setTimeout(() => navigate("/"), 400);
      }, 800);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Đăng ký thất bại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =================================================================
  // 🚀 XỬ LÝ ĐĂNG KÝ / ĐĂNG NHẬP BẰNG GOOGLE CHUẨN XÁC
  // =================================================================
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // Lấy id_token từ Google
      const googleIdToken = credentialResponse.credential;
      console.log("Token chuẩn lấy từ Google (Register):", googleIdToken);

      // Gửi xuống Backend
      const response = await axiosClient.post("/auth/google", {
        token: googleIdToken,
      });

      const { user, token } = response.data;
      if (user && token) {
        login(user, token);
      }

      setSuccessMessage("Đăng nhập Google thành công! 🥰");

      setTimeout(() => {
        setSlideDirection("translate-x-12");
        setIsExiting(true);
        setTimeout(() => {
          if (user.role_id === 1) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 400);
      }, 800);
    } catch (error) {
      console.error("Lỗi Google Auth:", error);
      setErrorMessage(
        error.response?.data?.message || "Lỗi xác thực Google từ máy chủ!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage("Đăng ký Google bị hủy hoặc thất bại!");
  };

  return (
    <div
      className={`min-h-screen bg-[#f9f9f9] px-4 py-8 text-slate-900 antialiased md:px-8 lg:flex lg:items-center lg:justify-center transform transition-all duration-500 ease-in-out ${
        isExiting ? `${slideDirection} opacity-0` : "translate-x-0 opacity-100"
      }`}
    >
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-12px_rgba(26,28,28,0.10)] lg:grid-cols-2">
        <div className="relative hidden min-h-[720px] overflow-hidden bg-[#f3f3f3] lg:block">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-emerald-900/45 to-transparent" />
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80"
            alt="Giỏ nông sản tươi sạch nhiều màu sắc"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute bottom-12 left-12 z-20 max-w-md">
            <h1 className="text-5xl font-black leading-tight tracking-[-0.06em] text-white">
              Bắt đầu hành trình sống sạch.
            </h1>
            <p className="mt-4 text-lg font-medium text-white/90">
              Tham gia cùng HealthyGO để trải nghiệm nguồn thực phẩm hữu cơ tinh
              tuyển mỗi ngày.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md">
                <CheckCircle2 size={16} className="text-white" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  100% Organic
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md">
                <Truck size={16} className="text-white" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Giao hàng nhanh
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <div className="mb-10">
            <div
              className="mb-8 flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavigate("/")}
            >
              <Leaf size={30} className="text-emerald-700" />
              <div className="leading-none">
                <span className="text-[2rem] font-black tracking-[-0.06em] text-emerald-600 sm:text-[2.35rem]">
                  Healthy
                </span>
                <span className="ml-1 text-[2rem] font-black tracking-[-0.06em] text-amber-500 sm:text-[2.35rem]">
                  GO
                </span>
              </div>
            </div>
            <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-900">
              Tạo tài khoản mới
            </h2>
            <p className="mt-2 text-slate-500">
              Điền thông tin bên dưới để bắt đầu mua sắm sản phẩm hữu cơ.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Họ và tên
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-lg border-none bg-[#e2e2e2] py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Địa chỉ email
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlurEmail}
                  placeholder="email@vi-du.com"
                  className="w-full rounded-lg border-none bg-[#e2e2e2] py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              {!isEmailValid && (
                <p className="mt-1 px-1 text-[11px] font-bold text-rose-500 uppercase tracking-wider">
                  Định dạng email không hợp lệ !
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="w-full rounded-lg border-none bg-[#e2e2e2] py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border-none bg-[#e2e2e2] py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <div className="flex h-5 items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-none bg-[#e2e2e2] text-emerald-700 focus:ring-emerald-300"
                />
              </div>
              <label
                htmlFor="terms"
                className="cursor-pointer text-sm leading-tight text-slate-500"
              >
                Tôi đồng ý với{" "}
                <span className="font-semibold text-emerald-700">
                  Điều khoản dịch vụ
                </span>{" "}
                và{" "}
                <span className="font-semibold text-emerald-700">
                  Chính sách bảo mật
                </span>{" "}
                của HealthyGO.
              </label>
            </div>

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

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-4 text-base font-black tracking-[-0.02em] text-white shadow-lg transition-all active:scale-[0.98] 
    ${
      isLoading
        ? "bg-gray-400 cursor-not-allowed opacity-70"
        : "bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] shadow-emerald-700/20 hover:opacity-95"
    }`}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* 🚀 ĐÃ SỬA: Chèn nút Google chính chủ và vạch phân cách giống trang Login */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 font-bold tracking-[0.2em] text-slate-400">
                Hoặc đăng ký bằng
              </span>
            </div>
          </div>

          <div className="flex w-full justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signup_with" /* 🚀 Thay chữ hiển thị thành "Đăng ký với Google" */
              shape="pill"
            />
          </div>

          <div className="mt-8 border-t border-slate-200 pt-8 text-center">
            <p className="text-sm text-slate-500">
              Bạn đã có tài khoản?
              <button
                type="button"
                onClick={() => handleNavigate("/login")}
                className="ml-1 font-bold text-emerald-700 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
