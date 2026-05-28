import { useEffect, useRef, useState, useContext } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  History,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
// Vỏ hàng
import { CartContext } from "../context/CartContext";

function UserLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Dùng cái này để theo dõi chuyển trang

  const { currentUser, logout, loading, refetchUser } = useAuth();
  const userMenuRef = useRef(null);

  // =================================================================
  // STATE TẠO HIỆU ỨNG TRƯỢT CHUYỂN TRANG
  // =================================================================
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Mỗi lần URL thay đổi (vào trang mới) -> Reset lại cờ trượt để hiện nội dung
    const resetAnimation = setTimeout(() => {
      setIsExiting(false);
    }, 0);
    return () => clearTimeout(resetAnimation);
  }, [location.pathname]);

  // Hàm chuyển trang mượt mà
  const handleNavigate = (path) => {
    // Nếu đang ở đúng trang đó rồi thì không trượt làm gì
    if (location.pathname === path) return;

    setIsExiting(true); // Bật cờ trượt đi
    setTimeout(() => {
      navigate(path); // Chuyển trang sau khi trượt xong (400ms)
    }, 400);
  };

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
      email: currentUser?.email || "",
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
        email: currentUser.email,
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

  // Lấy danh sách đồ ăn từ giỏ hàng
  const { cartItems } = useContext(CartContext);

  //  Tính tổng số lượng sản phẩm trong giỏ hàng
  const totalItemsCart = cartItems
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-emerald-500/20 relative overflow-x-hidden">
      {/* HEADER THEO THIẾT KẾ MỚI (Tối giản, trong suốt, gộp chung) */}
      <nav className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-100 shadow-sm transition-all h-16 flex items-center">
        <div className="flex justify-between items-center px-4 w-full max-w-7xl mx-auto gap-4">
          {/* Logo - Bấm vào thì về Home mượt mà */}
          <button
            onClick={() => handleNavigate("/")}
            className="text-xl font-black tracking-tighter text-emerald-600 shrink-0 no-underline cursor-pointer"
          >
            HealthyGO
          </button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer"
              onClick={handleSearch}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm món ăn, nguyên liệu, combo..."
              className="w-full pl-11 pr-4 py-2 bg-zinc-100 border-transparent rounded-full text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Các nút Menu bên phải */}
          <div className="flex items-center gap-2 md:gap-4 text-sm font-medium tracking-tight">
            {/* Lịch sử mua hàng */}
            <button
              onClick={() => handleNavigate("/order")}
              className="hidden lg:flex text-zinc-500 hover:text-emerald-600 transition-colors items-center gap-1.5 no-underline cursor-pointer"
            >
              <History size={18} /> Lịch sử mua hàng
            </button>

            <button className="md:hidden p-2 text-zinc-600 cursor-pointer">
              <Search size={20} />
            </button>

            {/* Giỏ hàng */}
            <button
              onClick={() => handleNavigate("/cart")}
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors rounded-full relative flex items-center cursor-pointer no-underline"
            >
              <ShoppingBag size={20} />
              {/* Số lượng sản phẩm trong giỏ hàng */}
              {totalItemsCart > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white box-content">
                  {totalItemsCart}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1 pl-3 pr-2 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-full cursor-pointer text-zinc-700 font-semibold text-sm"
                >
                  <span className="max-w-[100px] truncate">
                    {currentUser.full_name.split(" ").pop()}
                  </span>
                  <ChevronDown size={14} className="text-zinc-400" />
                </button>

                <div
                  className={`absolute right-0 top-[calc(100%+10px)] w-52 origin-top-right overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-200 ${
                    showUserMenu
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={openEditProfile}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-emerald-600"
                  >
                    <UserRound size={16} className="text-zinc-400" /> Cập nhật
                    thông tin
                  </button>
                  <button
                    type="button"
                    onClick={openChangePwd}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-emerald-600"
                  >
                    <KeyRound size={16} className="text-zinc-400" /> Đổi mật
                    khẩu
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <LogOut size={16} className="text-rose-500" /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-full transition no-underline"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:block px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition shadow-sm no-underline"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* BODY CHÍNH - GẮN HIỆU ỨNG TRƯỢT VÀO ĐÂY */}
      {/* Cái Navbar ở trên sẽ đứng yên, chỉ có phần nội dung bên dưới là trượt đi */}
      <main
        className={`pt-20 transform transition-all duration-500 ease-in-out ${
          isExiting ? "-translate-x-12 opacity-0" : "translate-x-0 opacity-100"
        }`}
      >
        <Outlet />
      </main>

      {/* ================= NÚT GIỎ HÀNG NỔI MOBILE ================= */}
      <button
        onClick={() => handleNavigate("/cart")}
        className="md:hidden fixed bottom-6 right-6 bg-emerald-600 text-white w-14 h-14 rounded-full shadow-[0_10px_25px_rgba(5,150,105,0.3)] flex items-center justify-center z-50 hover:bg-emerald-700 transition-colors cursor-pointer"
      >
        <ShoppingBag size={22} />
        {totalItemsCart > 0 && (
          <span className="absolute top-0 right-0 bg-white text-emerald-700 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-600 box-content shadow-sm">
            {totalItemsCart}
          </span>
        )}
      </button>

      {/* ================= MODAL CẬP NHẬT THÔNG TIN CÁ NHÂN ================= */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-zinc-800">
                Thông tin cá nhân
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="cursor-pointer rounded-full p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
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
                      value={editFormData.email}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-100 py-3 pl-11 pr-4 text-sm text-zinc-500 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
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
                      value={editFormData.full_name}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Số điện thoại
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
                      value={editFormData.phone}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsEditProfileOpen(false)}
                    className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition ${isEditing ? "bg-zinc-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-zinc-800">Đổi mật khẩu</h3>
              <button
                onClick={() => setIsChangePwdOpen(false)}
                className="cursor-pointer rounded-full p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleChangePwdSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Key
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
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
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-10 text-sm outline-none transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPwd(!showNewPwd)}
                      className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-500">
                    * Mật khẩu mới nên có ít nhất 8 ký tự.
                  </p>
                </div>
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsChangePwdOpen(false)}
                    className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-200"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPwd}
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition ${isChangingPwd ? "bg-zinc-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
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
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm cursor-pointer"
            onClick={closeToast}
          ></div>
          <div
            className={`relative w-full max-w-sm rounded-[2.5rem] bg-white overflow-hidden shadow-2xl border-2 ${toast.type === "success" ? "border-emerald-500" : "border-rose-400"}`}
          >
            <div
              className={`p-8 flex flex-col items-center text-center relative ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`}
            >
              <button
                onClick={closeToast}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/30 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              <span className="text-[60px] drop-shadow-md mb-2">
                {toast.type === "success" ? "🥰" : "😥"}
              </span>
              <h3 className="text-2xl font-black text-white tracking-wide uppercase">
                {toast.type === "success" ? "Thành công" : "Thất bại"}
              </h3>
            </div>
            <div className="p-8 bg-white flex flex-col items-center text-center">
              <p className="text-zinc-600 font-medium text-lg leading-relaxed">
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
