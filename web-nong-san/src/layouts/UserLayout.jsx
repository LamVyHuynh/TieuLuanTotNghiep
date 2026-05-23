import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  KeyRound,
  Search,
  ShoppingBag,
  UserRound,
  LogOut,
  X,
  User,
  Phone,
  Mail,
  Key,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

function UserLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const { currentUser, logout, loading, refetchUser } = useAuth();
  const userMenuRef = useRef(null);

  // =================================================================
  // TOAST THÔNG BÁO
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
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast((prev) => ({ ...prev, show: false }));
  };

  // =================================================================
  // CẬP NHẬT THÔNG TIN CÁ NHÂN (EMAIL CHỈ ĐỌC)
  // =================================================================
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
  });

  const openEditProfile = () => {
    setEditFormData({
      full_name: currentUser?.full_name || "",
      phone: currentUser?.phone || "",
      email: currentUser?.email || "", // Lấy email để hiển thị thôi
    });
    setShowUserMenu(false);
    setIsEditProfileOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      await axiosClient.put(`/auth/users/${currentUser.id}/update-user`, {
        full_name: editFormData.full_name,
        phone: editFormData.phone,
        email: currentUser.email, // Gửi lại email gốc cho chắc cốp
        role_id: currentUser.role_id,
      });
      setIsEditProfileOpen(false);
      showToast("success", "Cập nhật thông tin thành công! 🥰");

      if (refetchUser) {
        await refetchUser();
      }
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi hệ thống khi cập nhật 😥",
      );
    } finally {
      setIsEditing(false);
    }
  };

  // =================================================================
  // ĐỔI MẬT KHẨU
  // =================================================================
  const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const [pwdData, setPwdData] = useState({ new_password: "" });

  const openChangePwd = () => {
    setPwdData({ new_password: "" });
    setShowNewPwd(false);
    setShowUserMenu(false);
    setIsChangePwdOpen(true);
  };

  const handleChangePwdSubmit = async (e) => {
    e.preventDefault();
    setIsChangingPwd(true);
    try {
      await axiosClient.put(`/auth/users/${currentUser.id}/change-password`, {
        new_password: pwdData.new_password,
      });
      setIsChangePwdOpen(false);
      showToast("success", "Đổi mật khẩu thành công! 🥰");

      if (refetchUser) {
        await refetchUser();
      }
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi hệ thống khi đổi mật khẩu 😥",
      );
    } finally {
      setIsChangingPwd(false);
    }
  };

  // =================================================================
  // CÁC EFFECT & HÀM KHÁC
  // =================================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    console.log("Tìm kiếm với từ khóa:", searchTerm);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/");
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbf7_0%,#fdfdf8_45%,#f7faf8_100%)] text-slate-800 relative">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 shadow-[0_10px_40px_rgba(17,24,39,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 p-[15px] px-10">
          <Link to="/" className="shrink-0 no-underline">
            <div className="leading-none">
              <span className="text-[2rem] font-black tracking-[-0.06em] text-emerald-600 sm:text-[2.35rem]">
                Healthy
              </span>
              <span className="ml-1 text-[2rem] font-black tracking-[-0.06em] text-amber-500 sm:text-[2.35rem]">
                GO
              </span>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 md:block">
            <div className="relative mx-auto max-w-2xl">
              <input
                className="h-13 w-full rounded-full border border-emerald-100 bg-slate-50/90 py-3 pl-6 pr-16 text-sm text-slate-700 shadow-inner shadow-emerald-50 outline-none ring-0 transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
                placeholder="Hôm nay mạy muốn nấu món gì?..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_18px_rgba(5,150,105,0.25)] transition-all duration-300 hover:scale-[1.03] hover:bg-emerald-700 active:scale-95"
                onClick={handleSearch}
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/cart"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
            >
              <ShoppingBag size={18} />
            </Link>
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:px-5"
                >
                  <span>{currentUser.full_name}</span>
                  <ChevronDown size={16} />
                </button>

                <div
                  className={`absolute right-0 top-[calc(100%+10px)] z-50 w-52 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-200 ${
                    showUserMenu
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={openEditProfile}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserRound size={16} className="text-slate-400" />
                    Cập nhật thông tin
                  </button>
                  <button
                    type="button"
                    onClick={openChangePwd}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <KeyRound size={16} className="text-slate-400" />
                    Đổi mật khẩu
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={16} className="text-rose-500" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 no-underline transition hover:bg-emerald-50 sm:px-5"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-[0_10px_18px_rgba(5,150,105,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:px-5"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-emerald-50 bg-[linear-gradient(90deg,#1f9d68_0%,#23b26d_50%,#1f9d68_100%)] text-white">
          <nav className="mx-auto flex max-w-[1400px] items-center gap-6 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm font-semibold sm:px-6 lg:px-10">
            <Link
              to="/"
              className="rounded-full px-3 py-1 text-white/95 no-underline transition hover:bg-white/15"
            >
              Trang chủ
            </Link>
            <Link
              to="/order"
              className="rounded-full px-3 py-1 text-white/95 no-underline transition hover:bg-white/15"
            >
              Đơn hàng
            </Link>
            <Link
              to="/cart"
              className="rounded-full px-3 py-1 text-white/95 no-underline transition hover:bg-white/15"
            >
              Giỏ hàng
            </Link>
            <Link
              to="/tracking"
              className="rounded-full px-3 py-1 text-white/95 no-underline transition hover:bg-white/15"
            >
              Theo dõi đơn
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* ================= MODAL CẬP NHẬT THÔNG TIN CÁ NHÂN ================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                Thông tin cá nhân
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="cursor-pointer rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Ô EMAIL BỊ KHOÁ (READ-ONLY) */}
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="email"
                      type="email"
                      disabled
                      value={editFormData.email}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-sm text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="full_name"
                      type="text"
                      required
                      value={editFormData.full_name}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="phone"
                      type="text"
                      required
                      value={editFormData.phone}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={isEditing}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] ${
                      isEditing
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
                    }`}
                  >
                    {isEditing ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Save size={16} /> Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ĐỔI MẬT KHẨU CÁ NHÂN ================= */}
      {isChangePwdOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Đổi mật khẩu</h3>
              <button
                onClick={() => setIsChangePwdOpen(false)}
                className="cursor-pointer rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleChangePwdSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Key
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="new_password"
                      required
                      type={showNewPwd ? "text" : "password"}
                      value={pwdData.new_password}
                      onChange={(e) =>
                        setPwdData({ new_password: e.target.value })
                      }
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    * Mật khẩu mới nên có ít nhất 8 ký tự để bảo mật.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsChangePwdOpen(false)}
                    className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={isChangingPwd}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] ${
                      isChangingPwd
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700"
                    }`}
                  >
                    {isChangingPwd ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Save size={16} /> Lưu mật khẩu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= KHUNG THÔNG BÁO Ở GIỮA ================= */}
      {toast.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            onClick={closeToast}
          ></div>
          <div
            className={`relative w-full max-w-sm rounded-[2.5rem] bg-white overflow-hidden shadow-2xl border-2 ${toast.type === "success" ? "border-emerald-500" : "border-rose-400"}`}
          >
            <div
              className={`p-8 flex flex-col items-center text-center relative ${
                toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
              }`}
            >
              <button
                onClick={closeToast}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              {toast.type === "success" ? (
                <span className="text-[60px] drop-shadow-md mb-2">🥰</span>
              ) : (
                <span className="text-[60px] drop-shadow-md mb-2">😥</span>
              )}
              <h3 className="text-2xl font-black text-white tracking-wide uppercase">
                {toast.type === "success" ? "Thành công" : "Thất bại"}
              </h3>
            </div>
            <div className="p-8 bg-white flex flex-col items-center text-center">
              <p className="text-slate-600 font-medium text-lg leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserLayout;
