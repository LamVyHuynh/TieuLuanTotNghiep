import { useEffect, useRef, useState, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
  Bell,
  Trash2,
  BellRing, // Icon cái chuông lúc trống
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

function UserLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 🚀 STATE QUẢN LÝ MENU THÔNG BÁO
  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser, logout, loading, refetchUser } = useAuth();
  const userMenuRef = useRef(null);
  const notiMenuRef = useRef(null);

  const { cartItems, fetchCart, setCartItems } = useContext(CartContext);

  // Lịch sử tìm kiếm
  const [searchHistory, setSearchHistory] = useState([]); // Chứa mảng từ khoá
  // Quản lí khách hàng có bấm vào ô tìm kiếm không -> bấm là sổ list tìm kiếm ra, rời khỏi là ẩn đi
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Ref để quản lý click ra ngoài khung tìm kiếm
  const searchContainerRef = useRef(null);
  // Tự động load lịch  sử tìm kiếm của riêng từng user
  // Tự động load lịch sử tìm kiếm & Lắng nghe đồng bộ
  useEffect(() => {
    // 1. Hàm dùng chung để load data
    const loadHistory = () => {
      if (currentUser) {
        const history = localStorage.getItem(
          `search_history_${currentUser.id}`,
        );
        setSearchHistory(history ? JSON.parse(history) : []);
      } else {
        setSearchHistory([]);
      }
    };

    // Chạy lần đầu tiên
    loadHistory();

    // 2. 🚀 Gắn tai nghe: Cứ LocalStorage thay đổi là tao tự load lại!
    const handleStorageChange = (e) => {
      // Chỉ lắng nghe đúng cái chìa khoá của thằng user đang đăng nhập
      if (currentUser && e.key === `search_history_${currentUser.id}`) {
        loadHistory();
      }
    };

    // Đăng ký bắt sự kiện (Hoạt động ngon nhất khi 2 component nằm khác tab, nhưng trong React đôi khi phải dùng Custom Event)
    window.addEventListener("storage", handleStorageChange);

    // ⚠️ ĐẶC TRỊ CHO SINGLE PAGE APP (React): Bắn Custom Event để báo cho nhau
    const handleCustomStorageChange = () => loadHistory();
    window.addEventListener("custom_storage_change", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "custom_storage_change",
        handleCustomStorageChange,
      );
    };
  }, [currentUser]);

  // Khi click ra ngoài khung tìm kiếm thì ẩn khung lịch sử tìm kiếm đi
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notiMenuRef.current && !notiMenuRef.current.contains(event.target)) {
        setShowNotiMenu(false);
      }

      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      )
        setIsSearchFocused(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚀 Hàm xử lý khi bấm tìm kiếm
  const handleSearch = (term = searchTerm) => {
    const finalTerm =
      typeof term === "string" ? term.trim() : searchTerm.trim();

    if (!finalTerm) {
      showToast("error", "Nhập cái gì đó để tìm đi mạy!");
      return;
    }

    // 1. Nếu đã đăng nhập thì nhét từ khoá vào localStorage của user đó
    if (currentUser) {
      setSearchHistory((prev) => {
        const newHistory = [
          finalTerm,
          ...prev.filter((item) => item !== finalTerm),
        ].slice(0, 10); // Giữ tối đa 10 từ khoá
        localStorage.setItem(
          `search_history_${currentUser.id}`,
          JSON.stringify(newHistory),
        );
        return newHistory;
      });
    }

    setSearchTerm(finalTerm);

    // Chuyển hướng sang trang search kèm theo từ khóa trên URL
    handleNavigate(`/search?q=${encodeURIComponent(finalTerm)}`);
  };

  // Hàm xoá lịch sử tìm kiếm của user hiện tại
  const handleDeleteSearchHistory = (e, itemToRemove) => {
    e.stopPropagation(); // ⚠️ Chặn không cho nó tự động kích hoạt tìm kiếm khi bấm nút X
    if (currentUser) {
      const newHistory = searchHistory.filter((item) => item !== itemToRemove);
      setSearchHistory(newHistory);
      localStorage.setItem(
        `search_history_${currentUser.id}`,
        JSON.stringify(newHistory),
      );
      return newHistory;
    }
  };

  const handleDeleteAllSearch = () => {
    setSearchTerm("");
  };

  // =================================================================
  // ĐỒNG BỘ GIỎ HÀNG KHI LOGIN / LOGOUT
  // =================================================================
  useEffect(() => {
    if (currentUser && fetchCart) {
      fetchCart();
    }
    if (!currentUser && setCartItems) {
      setCartItems([]);
    }
  }, [currentUser, fetchCart, setCartItems]);

  // =================================================================
  // 🚀 FAKE REAL-TIME LẤY THÔNG BÁO
  // =================================================================
  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const res = await axiosClient.get("/notifications");
        if (res.data.success) {
          const list = res.data.data;
          setNotifications(list);
          const unread = list.filter((n) => Number(n.is_read) === 0).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [currentUser]);

  // Hàm khi bấm vào một thông báo cụ thể (Đọc + Chuyển hướng)
  const handleReadNotification = async (notiId) => {
    try {
      await axiosClient.put(`/notifications/${notiId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notification === notiId ? { ...n, is_read: 1 } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setShowNotiMenu(false);
      handleNavigate("/order");
    } catch (error) {
      console.error(error);
    }
  };

  // Hàm xoá 1 thông báo
  const handleDeleteNotification = async (notiId) => {
    try {
      await axiosClient.delete(`/notifications/${notiId}`);
      setNotifications((prev) =>
        prev.filter((n) => n.id_notification !== notiId),
      );
      // Cập nhật lại số lượng chưa đọc nếu cái vừa bị xoá là cái chưa đọc
      setUnreadCount((prev) => {
        const deletedNoti = notifications.find(
          (n) => n.id_notification === notiId,
        );
        if (deletedNoti && Number(deletedNoti.is_read) === 0) {
          return Math.max(0, prev - 1);
        }
        return prev;
      });
    } catch (error) {
      console.error("Lỗi khi xoá thông báo:", error);
    }
  };

  // 🚀 HÀM XOÁ TẤT CẢ THÔNG BÁO (MỚI)
  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;
    try {
      // Ép giao diện giấu đi trước cho mượt (Optimistic UI Update)
      const oldNotifications = [...notifications];
      setNotifications([]);
      setUnreadCount(0);
      setShowNotiMenu(false);

      // Gọi API xóa toàn bộ ngầm (Dùng vòng lặp gọi API đơn)
      await Promise.all(
        oldNotifications.map((noti) =>
          axiosClient.delete(`/notifications/${noti.id_notification}`),
        ),
      );
    } catch (error) {
      console.error("Lỗi khi xoá tất cả thông báo:", error);
    }
  };

  // =================================================================
  // STATE TẠO HIỆU ỨNG TRƯỢT CHUYỂN TRANG
  // =================================================================
  const [isExiting, setIsExiting] = useState(false);

  // location.pathname là /search
  // location.search là ?q=salad
  // lấy cả 2 chỉ số này thứ nhất giải quyết được việc khi tìm kiếm tại trang kết quả không chuyển trang kết quả được nữa
  // thứ 2 là giải quyết được việc là trải nghiệm người dùng của khách hàng tìm kiếm tại trang đó
  useEffect(
    () => {
      const resetAnimation = setTimeout(() => {
        setIsExiting(false);
      }, 0);
      return () => clearTimeout(resetAnimation);
    },
    [location.pathname],
    [location.search],
  );

  const handleNavigate = (path) => {
    // Nếu bấm đúng cái đường dẫn hiện tại (cả pathname lẫn search) thì bỏ qua
    const currentPath = location.pathname + location.search;
    if (currentPath === path) return;

    // ĐẶC BIỆT: Nếu đang ở trang Search và lại tiếp tục Search
    // -> Không cần hiệu ứng trượt rườm rà, nhảy luôn cho kết quả cập nhật mượt mà!
    // location.pathname là /search
    // startsWith là kiểm tra xem path có bắt đầu bằng /search hay không
    if (location.pathname === "/search" && path.startsWith("/search")) {
      navigate(path);
      return;
    }
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
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
  // CẬP NHẬT THÔNG TIN CÁ NHÂN & ĐỔI MK (GIỮ NGUYÊN)
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

  const handleEditChange = (e) =>
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

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
      if (refetchUser) await refetchUser();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi hệ thống khi cập nhật 😥",
      );
    } finally {
      setIsEditing(false);
    }
  };

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
      if (refetchUser) await refetchUser();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi hệ thống khi đổi mật khẩu 😥",
      );
    } finally {
      setIsChangingPwd(false);
    }
  };

  // CÁC EFFECT & HÀM KHÁC

  const handleLogout = async () => {
    await logout();
    if (setCartItems) setCartItems([]);
    setShowUserMenu(false);
    navigate("/");
  };

  const totalItemsCart = cartItems
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-emerald-500/20 relative overflow-x-hidden">
      {/* 🚀 CSS THANH CUỘN CHO DROPDOWN THÔNG BÁO */}
      <style>{`
        .noti-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .noti-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .noti-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .noti-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>

      {/* HEADER */}
      <nav className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-100 shadow-sm transition-all h-16 flex items-center">
        <div className="flex justify-between items-center px-4 w-full max-w-7xl mx-auto gap-4">
          <button
            onClick={() => handleNavigate("/")}
            className="text-xl font-black tracking-tighter text-emerald-600 shrink-0 no-underline cursor-pointer"
          >
            HealthyGO
          </button>

          <div
            className="hidden md:flex flex-1 max-w-xl mx-4 relative"
            ref={searchContainerRef}
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer hover:text-emerald-600 transition"
              onClick={() => handleSearch()} // Click icon kính lúp
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setIsSearchFocused(true)} // 🚀 CLICK VÔ Ô NÀY LÀ HIỆN KHUNG LỊCH SỬ
              placeholder="Tìm món ăn, nguyên liệu, combo..."
              className="w-full pl-11 pr-10 py-2 bg-zinc-100 border-transparent rounded-full text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />

            {/* NÚT XOÁ CHỮ TRONG Ô TÌM KIẾM */}
            {searchTerm.length > 0 && (
              <button
                onClick={handleDeleteAllSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500 bg-zinc-200/50 hover:bg-rose-50 p-1 rounded-full transition-colors cursor-pointer"
                title="Xoá chữ"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}

            {/* 🚀 KHUNG DROPDOWN LỊCH SỬ TÌM KIẾM */}
            {isSearchFocused && currentUser && searchHistory.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header của khung */}
                <div className="flex justify-between items-center px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <History size={14} /> Tìm kiếm gần đây
                  </span>
                  <button
                    onClick={() => {
                      setIsSearchFocused(false);
                      handleNavigate("/search-history"); // Chút mình tạo trang này sau
                    }}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors uppercase"
                  >
                    Xem tất cả
                  </button>
                </div>

                {/* Danh sách 5 từ khoá */}
                <ul className="flex flex-col">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSearch(item)} // 🚀 Bấm vô chữ là tự tìm luôn
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 cursor-pointer group transition-colors"
                    >
                      <span className="text-sm font-medium text-zinc-700 group-hover:text-emerald-600 line-clamp-1 pr-4">
                        {item}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSearchHistory(e, item)} // 🚀 Bấm X để xoá
                        className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-full hover:bg-rose-50 cursor-pointer shrink-0"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* NÚT XOÁ TẤT CẢ TRONG KHUNG TÌM KIẾM */}
          {searchTerm.length > 0 && (
            <button
              onClick={handleDeleteAllSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500 bg-zinc-200/50 hover:bg-rose-50 p-1 rounded-full transition-colors cursor-pointer"
              title="Xoá tìm kiếm"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          )}
          <div className="flex items-center gap-2 md:gap-4 text-sm font-medium tracking-tight">
            <button
              onClick={() => handleNavigate("/order")}
              className="hidden lg:flex text-zinc-500 hover:text-emerald-600 transition-colors items-center gap-1.5 no-underline cursor-pointer"
            >
              <History size={18} /> Lịch sử mua hàng
            </button>

            <button className="md:hidden p-2 text-zinc-600 cursor-pointer">
              <Search size={20} />
            </button>

            {/* 🚀 CHUÔNG THÔNG BÁO VỚI GIAO DIỆN MỚI */}
            {currentUser && (
              <div className="relative" ref={notiMenuRef}>
                <button
                  onClick={() => {
                    setShowNotiMenu(!showNotiMenu);
                    setShowUserMenu(false);
                  }}
                  className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors rounded-full relative flex items-center cursor-pointer"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border border-white"></span>
                    </span>
                  )}
                </button>

                <div
                  className={`absolute right-0 top-[calc(100%+10px)] w-80 origin-top-right overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] transition-all duration-300 ${
                    showNotiMenu
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-4 scale-95 opacity-0"
                  }`}
                >
                  {/* Header Thông báo */}
                  <div className="px-5 py-4 border-b border-zinc-100/80 bg-zinc-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                    <h3 className="font-black text-zinc-800 tracking-tight">
                      Thông báo
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {unreadCount} chưa đọc
                      </span>
                    )}
                  </div>

                  {/* List Thông báo */}
                  <div className="max-h-[320px] overflow-y-auto noti-scrollbar flex flex-col bg-white">
                    {notifications.length === 0 ? (
                      <div className="p-10 flex flex-col items-center text-center text-zinc-400">
                        <div className="w-14 h-14 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                          <BellRing size={24} className="text-zinc-300" />
                        </div>
                        <p className="text-sm font-medium">
                          Bạn chưa có thông báo nào.
                        </p>
                      </div>
                    ) : (
                      notifications.map((noti) => (
                        <div
                          key={noti.id_notification}
                          onClick={() =>
                            handleReadNotification(noti.id_notification)
                          }
                          className={`group relative flex items-center gap-3 p-4 border-b border-zinc-50 text-left transition-colors cursor-pointer pr-10 ${
                            Number(noti.is_read) === 0
                              ? "bg-emerald-50/20 hover:bg-emerald-50/40"
                              : "hover:bg-zinc-50"
                          }`}
                        >
                          {/* Dấu chấm xanh nếu chưa đọc */}
                          <div className="w-2 shrink-0 flex justify-center">
                            {Number(noti.is_read) === 0 && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                            )}
                          </div>

                          <div className="flex-1">
                            <h4
                              className={`text-sm mb-0.5 line-clamp-1 pr-2 ${Number(noti.is_read) === 0 ? "font-bold text-emerald-800" : "font-semibold text-zinc-700"}`}
                            >
                              {noti.title}
                            </h4>
                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed pr-2">
                              {noti.message}
                            </p>
                            <span className="block text-[10px] text-zinc-400 font-medium mt-1.5">
                              {new Date(noti.created_at).toLocaleString(
                                "vi-VN",
                              )}
                            </span>
                          </div>

                          {/* 🚀 NÚT X (XOÁ 1 ITEM) NẰM GIỮA MÀN HÌNH */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(noti.id_notification);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Xoá thông báo"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 🚀 Nút Xoá Tất Cả (Nằm dưới cùng) */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-zinc-100 bg-white sticky bottom-0 z-10">
                      <button
                        onClick={handleDeleteAllNotifications}
                        className="w-full py-2.5 text-[11px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={14} /> Xóa tất cả
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Giỏ hàng */}
            <button
              onClick={() => handleNavigate("/cart")}
              className="p-2 hover:bg-zinc-100 text-zinc-700 transition-colors rounded-full relative flex items-center cursor-pointer no-underline"
            >
              <ShoppingBag size={20} />
              {totalItemsCart > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white box-content">
                  {totalItemsCart}
                </span>
              )}
            </button>

            {/* User Menu */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu((prev) => !prev);
                    setShowNotiMenu(false);
                  }}
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
                <button
                  onClick={() => handleNavigate("/login")}
                  className="px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-full transition no-underline cursor-pointer"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => handleNavigate("/register")}
                  className="hidden sm:block px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition shadow-sm no-underline cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* BODY CHÍNH */}
      <main
        className={`pt-20 transform transition-all duration-500 ease-in-out ${
          isExiting ? "-translate-x-12 opacity-0" : "translate-x-0 opacity-100"
        }`}
      >
        <Outlet />
      </main>

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

      {/* MODAL CẬP NHẬT THÔNG TIN */}
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
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                      isEditing
                        ? "bg-zinc-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700"
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

      {/* MODAL ĐỔI MẬT KHẨU */}
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
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                      isChangingPwd
                        ? "bg-zinc-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
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

      {/* KHUNG THÔNG BÁO Ở GIỮA */}
      {toast.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm cursor-pointer"
            onClick={closeToast}
          ></div>
          <div
            className={`relative w-full max-w-sm rounded-[2.5rem] bg-white overflow-hidden shadow-2xl border-2 ${
              toast.type === "success"
                ? "border-emerald-500"
                : "border-rose-400"
            }`}
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
