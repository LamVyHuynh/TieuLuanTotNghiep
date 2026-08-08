import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Key,
  Eye,
  EyeOff,
  Save,
  Camera,
  CheckCircle2,
  XCircle,
  X,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { createPortal } from "react-dom";

function Profile() {
  const { currentUser, refetchUser } = useAuth();
  const navigate = useNavigate();

  // STATE KIỂM SOÁT HIỆU ỨNG CHUYỂN TRANG
  const [isExiting, setIsExiting] = useState(true);

  // CHUYỂN TRANG SANG TAB BẢO MẬT (SECURITY) ĐỂ CẬP NHẬT LẠI MẬT KHẨU MỚI
  const [activeTab, setActiveTab] = useState("profile"); // "profile" hoặc "security"
  // Hiệu ứng mượt mà khi vừa vào trang
  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(false), 10);
    return () => clearTimeout(timer);
  }, []);

  // 🚀 Hàm chuyển trang kèm hiệu ứng mượt mà
  const handleNavigateWithAnimation = (path) => {
    setIsExiting(true); // Bật hiệu ứng mờ đi
    setTimeout(() => {
      if (path === -1) {
        navigate(-1);
      } else {
        navigate(path);
      }
    }, 400); // Đợi 400ms cho CSS chạy xong mới chuyển trang
  };

  // =================================================================
  // 1. STATE QUẢN LÝ THÔNG TIN CÁ NHÂN
  // =================================================================
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Nạp dữ liệu user hiện tại vào form khi tải trang
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        full_name: currentUser.full_name || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
      });
      setPreviewUrl(currentUser.avatar_url || "");
    }
  }, [currentUser]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.full_name.trim() || !profileForm.phone.trim()) {
      showToast("error", "Vui lòng điền đầy đủ tên và số điện thoại!");
      return;
    }
    if (!/^\d{10,11}$/.test(profileForm.phone.trim())) {
      showToast("error", "Số điện thoại phải từ 10-11 chữ số!");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      // 1. Cập nhật thông tin chữ
      await axiosClient.put(`/auth/users/${currentUser.id}/update-user`, {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        email: currentUser.email,
        role_id: currentUser.role_id,
      });

      // 2. Cập nhật ảnh đại diện (nếu có chọn ảnh mới)
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar_file", avatarFile);
        await axiosClient.put(
          `/auth/users/${currentUser.id}/avatar`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      showToast("success", "Cập nhật hồ sơ thành công! 🥰");
      if (refetchUser) await refetchUser();

      // 🚀 Gọi hàm chuyển trang có hiệu ứng sau 1.5 giây
      setTimeout(() => {
        handleNavigateWithAnimation("/");
      }, 1500);
    } catch (error) {
      showToast("error", error.response?.data?.message || "Lỗi cập nhật 😥");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // =================================================================
  // 2. STATE QUẢN LÝ ĐỔI MẬT KHẨU
  // =================================================================
  const [pwdForm, setPwdForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Hàm xử lý khi người dùng nhập mật khẩu mới
  // Lấy giá trị từ input và cập nhật vào state pwdForm
  const handlePwdChange = (e) => {
    setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });
  };

  const handleChangePwdSubmit = async (e) => {
    e.preventDefault();

    if (!pwdForm.old_password) {
      showToast("error", "Vui lòng nhập mật khẩu hiện tại!");
      return;
    }
    if (pwdForm.new_password.length < 8) {
      showToast("error", "Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    if (pwdForm.new_password !== pwdForm.confirm_password) {
      showToast("error", "Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    setIsChangingPwd(true);
    try {
      await axiosClient.put(`/auth/users/${currentUser.id}/change-password`, {
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password,
      });
      setPwdForm({ old_password: "", new_password: "", confirm_password: "" });
      showToast(
        "success",
        "Đổi mật khẩu thành công! Hãy dùng mật khẩu mới cho lần đăng nhập sau. 🥰",
      );

      // Gọi hàm chuyển trang có hiệu ứng sau 1.5 giây
      setTimeout(() => {
        handleNavigateWithAnimation("/");
      }, 1500);
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi đổi mật khẩu 😥",
      );
    } finally {
      setIsChangingPwd(false);
    }
  };

  // =================================================================
  // 3. HỆ THỐNG THÔNG BÁO (TOAST)
  // =================================================================
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
    }, 2500);
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ ...toast, show: false });
  };

  return (
    <div
      className={`max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 transform transition-all duration-400 ease-in-out ${
        isExiting ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      {/* HEADER TRANG CÁ NHÂN */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => handleNavigateWithAnimation(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition shadow-sm cursor-pointer"
          title="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            Trang cá nhân
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Quản lý thông tin hồ sơ và bảo mật tài khoản của bạn.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 overflow-hidden">
        {/* 🚀 THANH MENU ĐIỀU HƯỚNG TAB */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-6 sm:px-8 pt-4 gap-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 pb-4 px-2 font-bold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === "profile"
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <User size={18} /> Hồ sơ của tôi
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 pb-4 px-2 font-bold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === "security"
                ? "border-indigo-500 text-indigo-700"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <ShieldCheck size={18} /> Bảo mật & Mật khẩu
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* ==================== TAB 1: HỒ SƠ ==================== */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <form onSubmit={handleUpdateProfile}>
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  {/* Khu vực Chọn Ảnh */}
                  <div className="flex flex-col items-center gap-4 shrink-0 mx-auto md:mx-0 pt-4">
                    <div className="relative w-40 h-40 rounded-full border-4 border-emerald-50 bg-zinc-100 flex items-center justify-center overflow-hidden group">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-black text-emerald-600">
                          {currentUser?.full_name?.charAt(0).toUpperCase() || (
                            <User size={48} />
                          )}
                        </span>
                      )}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="text-white" size={32} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                      Ảnh đại diện
                    </span>
                  </div>

                  {/* Khu vực Nhập Chữ */}
                  <div className="flex-1 w-full space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                        <input
                          type="email"
                          disabled
                          value={profileForm.email}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-100 py-3 pl-11 pr-4 text-sm text-zinc-500 outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                        <input
                          name="full_name"
                          type="text"
                          required
                          value={profileForm.full_name}
                          onChange={handleProfileChange}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="Nhập tên thật của bạn..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                        Số điện thoại <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                        />
                        <input
                          name="phone"
                          type="text"
                          required
                          value={profileForm.phone}
                          onChange={handleProfileChange}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="Ví dụ: 0901234567"
                        />
                      </div>
                    </div>

                    <div className="pt-6 flex justify-end border-t border-zinc-100">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex w-full md:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-10 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isUpdatingProfile ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Save size={18} /> Lưu thông tin
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ==================== TAB 2: BẢO MẬT & MẬT KHẨU ==================== */}
          {activeTab === "security" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-lg mx-auto py-4">
              <p className="text-sm text-zinc-500 mb-8 text-center">
                Để đảm bảo tính bảo mật, vui lòng nhập mật khẩu hiện tại trước
                khi thay đổi mật khẩu mới.
              </p>

              <form onSubmit={handleChangePwdSubmit} className="space-y-5">
                {/* Mật khẩu cũ */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                    Mật khẩu hiện tại <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="old_password"
                      type={showOldPwd ? "text" : "password"}
                      required
                      value={pwdForm.old_password}
                      onChange={handlePwdChange}
                      placeholder="Nhập mật khẩu đang dùng..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-12 text-sm outline-none transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPwd(!showOldPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                    >
                      {showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="w-full h-px bg-zinc-100 my-2"></div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="new_password"
                      type={showNewPwd ? "text" : "password"}
                      required
                      value={pwdForm.new_password}
                      onChange={handlePwdChange}
                      placeholder="Nhập ít nhất 8 ký tự..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-12 text-sm outline-none transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                    >
                      {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                    Xác nhận mật khẩu mới{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Key
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                    <input
                      name="confirm_password"
                      type={showConfirmPwd ? "text" : "password"}
                      required
                      value={pwdForm.confirm_password}
                      onChange={handlePwdChange}
                      placeholder="Nhập lại mật khẩu mới..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-12 text-sm outline-none transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                    >
                      {showConfirmPwd ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-6 mt-4">
                  <button
                    type="submit"
                    disabled={isChangingPwd}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isChangingPwd ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <ShieldCheck size={18} /> Cập nhật mật khẩu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* TOAST THÔNG BÁO DÀNH RIÊNG CHO TRANG PROFILE */}
      {toast.show &&
        createPortal(
          <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-5 ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} className="text-white" />
            ) : (
              <XCircle size={20} className="text-white" />
            )}
            {toast.message}
            <button
              onClick={closeToast}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Profile;
