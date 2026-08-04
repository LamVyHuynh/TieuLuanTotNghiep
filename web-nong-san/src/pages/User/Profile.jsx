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

  // 🚀 STATE KIỂM SOÁT HIỆU ỨNG CHUYỂN TRANG
  const [isExiting, setIsExiting] = useState(true);

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
  const [pwdForm, setPwdForm] = useState({ new_password: "" });
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handleChangePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password.length < 8) {
      showToast("error", "Mật khẩu mới phải có ít nhất 8 ký tự!");
      return;
    }

    setIsChangingPwd(true);
    try {
      await axiosClient.put(`/auth/users/${currentUser.id}/change-password`, {
        new_password: pwdForm.new_password,
      });
      setPwdForm({ new_password: "" });
      showToast("success", "Đổi mật khẩu thành công! 🥰");

      // 🚀 Gọi hàm chuyển trang có hiệu ứng sau 1.5 giây
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
    // 🚀 THÊM HIỆU ỨNG TRƯỢT VÀ MỜ (isExiting) VÀO DIV BAO BỌC NGOÀI CÙNG
    <div
      className={`max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 transform transition-all duration-400 ease-in-out ${
        isExiting ? "translate-x-8 opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div className="mb-8 flex items-center gap-4">
        {/* 🚀 ĐỔI SANG DÙNG HÀM CÓ HIỆU ỨNG */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & AVATAR */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2">
              <User className="text-emerald-500" size={24} /> Hồ sơ cá nhân
            </h2>

            <form onSubmit={handleUpdateProfile}>
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Khu vực Chọn Ảnh */}
                <div className="flex flex-col items-center gap-4 shrink-0 mx-auto sm:mx-0">
                  <div className="relative w-32 h-32 rounded-full border-4 border-emerald-50 bg-zinc-100 flex items-center justify-center overflow-hidden group">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-black text-emerald-600">
                        {currentUser?.full_name?.charAt(0).toUpperCase() || (
                          <User size={40} />
                        )}
                      </span>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white" size={28} />
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
                <div className="flex-1 w-full space-y-4">
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

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
        </div>

        {/* CỘT PHẢI: BẢO MẬT & ĐỔI MẬT KHẨU */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 h-full">
            <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2">
              <ShieldCheck className="text-indigo-500" size={24} /> Bảo mật
            </h2>
            <form
              onSubmit={handleChangePwdSubmit}
              className="flex flex-col h-[calc(100%-3rem)]"
            >
              <div className="space-y-4 flex-1">
                <p className="text-sm text-zinc-500 mb-6">
                  Đổi mật khẩu thường xuyên giúp bảo vệ tài khoản của bạn tốt
                  hơn.
                </p>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">
                    Mật khẩu mới
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
                      onChange={(e) =>
                        setPwdForm({ new_password: e.target.value })
                      }
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
              </div>
              <div className="pt-6 mt-auto">
                <button
                  type="submit"
                  disabled={isChangingPwd}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isChangingPwd ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Key size={18} /> Đổi mật khẩu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* TOAST THÔNG BÁO DÀNH RIÊNG CHO TRANG PROFILE */}
      {toast.show &&
        createPortal(
          <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-5 ${
              toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
            }`}
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
