import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import {
  Mail,
  Key,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { createPortal } from "react-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🚀 ĐIỀU KHIỂN HIỆU ỨNG CHUYỂN TRANG
  const [isExiting, setIsExiting] = useState(true);
  const [slideDirection, setSlideDirection] = useState("-translate-x-12");

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(false), 10);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    if (path === -1 || path === "/login") {
      setSlideDirection("translate-x-12");
    } else {
      setSlideDirection("-translate-x-12");
    }
    setIsExiting(true);
    setTimeout(() => {
      navigate(path === -1 ? -1 : path);
    }, 400);
  };

  // 🚀 STATE QUẢN LÝ QUY TRÌNH (BƯỚC 1 & BƯỚC 2)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Toast Thông báo
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, type: "success", message: "" });
    }, 3000);
  };

  // =====================================================================
  // BƯỚC 1: XỬ LÝ GỬI EMAIL XIN MÃ OTP
  // =====================================================================
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("error", "Vui lòng nhập địa chỉ email của bạn!");
      return;
    }

    setIsLoading(true);
    try {
      // Gọi API yêu cầu gửi mail (Mày đã code hàm này ở Backend rồi)
      const res = await axiosClient.post("/auth/forgot-password", { email });
      showToast(
        "success",
        res.data.message ||
          "Đã gửi mã OTP thành công! Vui lòng kiểm tra email.",
      );

      // Chuyển sang Bước 2
      setStep(2);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi khi gửi email. Vui lòng thử lại!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================================
  // BƯỚC 2: XỬ LÝ GỬI OTP VÀ MẬT KHẨU MỚI
  // =====================================================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword.trim()) {
      showToast("error", "Vui lòng nhập đầy đủ Mã OTP và Mật khẩu mới!");
      return;
    }
    if (newPassword.length < 8) {
      showToast("error", "Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosClient.post("/auth/reset-password", {
        email,
        otp,
        new_password: newPassword,
      });

      // 🚀 LƯU Ý ĐÃ SỬA: Lấy chữ res ra xài ở đây nè
      showToast(
        "success",
        res.data.message ||
          "Khôi phục mật khẩu thành công! Bạn có thể đăng nhập ngay.",
      );

      // Thành công thì đá về trang Login sau 2 giây
      setTimeout(() => {
        handleNavigate("/login");
      }, 2000);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          "Lỗi khôi phục mật khẩu. Vui lòng thử lại!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className={`min-h-screen bg-[#f9f9f9] p-4 text-slate-900 antialiased md:p-8 flex items-center justify-center transform transition-all duration-500 ease-in-out ${
        isExiting ? `${slideDirection} opacity-0` : "translate-x-0 opacity-100"
      }`}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-[0_24px_48px_-12px_rgba(26,28,28,0.08)]">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-900">
            Khôi phục mật khẩu
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {step === 1
              ? "Đừng lo lắng, hãy nhập email bạn đã đăng ký để chúng tôi gửi mã xác nhận."
              : "Vui lòng kiểm tra email và nhập mã OTP gồm 6 chữ số vào bên dưới."}
          </p>
        </div>

        {/* ================= BƯỚC 1: FORM NHẬP EMAIL ================= */}
        {step === 1 && (
          <form
            className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500"
            onSubmit={handleRequestOtp}
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Địa chỉ email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border-none bg-[#e2e2e2] py-4 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Gửi mã xác nhận <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= BƯỚC 2: FORM NHẬP OTP & MẬT KHẨU MỚI ================= */}
        {step === 2 && (
          <form
            className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500"
            onSubmit={handleResetPassword}
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Chỉ cho nhập số
                placeholder="123456"
                className="w-full rounded-xl border-none bg-[#e2e2e2] py-4 px-4 text-center text-2xl tracking-[0.5em] font-black text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Key
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập ít nhất 8 ký tự..."
                  className="w-full rounded-xl border-none bg-[#e2e2e2] py-4 pl-11 pr-12 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Đặt lại mật khẩu <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={() => handleNavigate("/login")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Quay lại trang Đăng nhập
          </button>
        </div>
      </div>

      {/* TOAST THÔNG BÁO */}
      {toast.show &&
        createPortal(
          <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-5 ${toast.type === "success" ? "bg-emerald-600" : "bg-rose-500"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <XCircle size={20} />
            )}
            {toast.message}
          </div>,
          document.body,
        )}
    </main>
  );
}

export default ForgotPassword;
