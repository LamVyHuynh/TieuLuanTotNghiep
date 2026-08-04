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
  History,
  Bell,
  Trash2,
  BellRing,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

// 🚀 HÀM PHỤ: Bỏ dấu tiếng Việt giúp tìm kiếm chuẩn xác
const removeVietnameseTones = (str) => {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.toLowerCase().trim();
};

function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, loading } = useAuth();
  const { cartItems, fetchCart, setCartItems } = useContext(CartContext);

  // =================================================================
  // 1. STATE QUẢN LÝ UI CHUNG
  // =================================================================
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const toastTimerRef = useRef(null);

  const [isExiting, setIsExiting] = useState(false);

  // =================================================================
  // 2. TÌM KIẾM, LỊCH SỬ & ĐỀ XUẤT SẢN PHẨM
  // =================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axiosClient.get("/products");
        const productsArray =
          res.data.products || res.data.data || res.data || [];
        setAllProducts(productsArray);
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
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

    loadHistory();

    const handleStorageChange = (e) => {
      if (currentUser && e.key === `search_history_${currentUser.id}`)
        loadHistory();
    };

    window.addEventListener("storage", handleStorageChange);
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

  const isSearching = searchTerm.trim() !== "";
  const normalizedSearchTerm = removeVietnameseTones(searchTerm);

  const displaySuggestions = isSearching
    ? allProducts
        .filter((p) => {
          if (!p || !p.name) return false;
          return removeVietnameseTones(p.name).includes(normalizedSearchTerm);
        })
        .slice(0, 4)
    : allProducts.slice(0, 4);

  const handleSearch = (term = searchTerm) => {
    const finalTerm =
      typeof term === "string" ? term.trim() : searchTerm.trim();
    if (!finalTerm) {
      showToast("error", "Nhập cái gì đó để tìm đi mạy!");
      return;
    }

    if (currentUser) {
      setSearchHistory((prev) => {
        const newHistory = [
          finalTerm,
          ...prev.filter((item) => item !== finalTerm),
        ].slice(0, 10);
        localStorage.setItem(
          `search_history_${currentUser.id}`,
          JSON.stringify(newHistory),
        );
        return newHistory;
      });
    }

    setSearchTerm(finalTerm);
    setIsSearchFocused(false);
    handleNavigate(`/search?q=${encodeURIComponent(finalTerm)}`);
  };

  const handleDeleteSearchHistory = (e, itemToRemove) => {
    e.stopPropagation();
    if (currentUser) {
      const newHistory = searchHistory.filter((item) => item !== itemToRemove);
      setSearchHistory(newHistory);
      localStorage.setItem(
        `search_history_${currentUser.id}`,
        JSON.stringify(newHistory),
      );
    }
  };

  const handleDeleteAllSearch = () => setSearchTerm("");

  // =================================================================
  // 3. THÔNG BÁO (NOTIFICATIONS)
  // =================================================================
  const [showNotiMenu, setShowNotiMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const notiMenuRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const res = await axiosClient.get("/notifications");
        if (res.data.success) {
          const list = res.data.data;
          setNotifications(list);
          setUnreadCount(list.filter((n) => Number(n.is_read) === 0).length);
        }
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalId);
  }, [currentUser]);

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

  const handleDeleteNotification = async (notiId) => {
    try {
      await axiosClient.delete(`/notifications/${notiId}`);
      setNotifications((prev) =>
        prev.filter((n) => n.id_notification !== notiId),
      );
      setUnreadCount((prev) => {
        const deletedNoti = notifications.find(
          (n) => n.id_notification === notiId,
        );
        if (deletedNoti && Number(deletedNoti.is_read) === 0)
          return Math.max(0, prev - 1);
        return prev;
      });
    } catch (error) {
      console.error("Lỗi khi xoá thông báo:", error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (notifications.length === 0) return;
    try {
      const oldNotifications = [...notifications];
      setNotifications([]);
      setUnreadCount(0);
      setShowNotiMenu(false);
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
  // 4. XỬ LÝ ĐĂNG XUẤT
  // =================================================================
  const handleLogout = async () => {
    await logout();
    if (setCartItems) setCartItems([]);
    setShowUserMenu(false);
    navigate("/");
  };

  // =================================================================
  // 5. CÁC HÀM TIỆN ÍCH (EFFECTS, TOAST, NAVIGATE)
  // =================================================================
  useEffect(() => {
    if (currentUser && fetchCart) fetchCart();
    if (!currentUser && setCartItems) setCartItems([]);
  }, [currentUser, fetchCart, setCartItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target))
        setShowUserMenu(false);
      if (notiMenuRef.current && !notiMenuRef.current.contains(event.target))
        setShowNotiMenu(false);
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      )
        setIsSearchFocused(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const resetAnimation = setTimeout(() => setIsExiting(false), 0);
    return () => clearTimeout(resetAnimation);
  }, [location.pathname, location.search]);

  const handleNavigate = (path) => {
    const currentPath = location.pathname + location.search;
    if (currentPath === path) return;
    if (location.pathname === "/search" && path.startsWith("/search")) {
      navigate(path);
      return;
    }
    setIsExiting(true);
    setTimeout(() => navigate(path), 400);
  };

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(
      () => setToast((prev) => ({ ...prev, show: false })),
      2500,
    );
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast((prev) => ({ ...prev, show: false }));
  };

  const totalItemsCart = cartItems
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-emerald-500/20 relative overflow-x-hidden">
      <style>{`
        .noti-scrollbar::-webkit-scrollbar { width: 6px; }
        .noti-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .noti-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        .noti-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
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

          {/* 🚀 KHUNG SEARCH */}
          <div
            className="hidden md:flex flex-1 max-w-xl mx-4 relative"
            ref={searchContainerRef}
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer hover:text-emerald-600 transition"
              onClick={() => handleSearch()}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tìm món ăn, nguyên liệu, combo..."
              className="w-full pl-11 pr-10 py-2 bg-zinc-100 border-transparent rounded-full text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />
            {searchTerm.length > 0 && (
              <button
                onClick={handleDeleteAllSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500 bg-zinc-200/50 hover:bg-rose-50 p-1 rounded-full transition-colors cursor-pointer"
                title="Xoá chữ"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}

            {/* DROPDOWN TÌM KIẾM */}
            {isSearchFocused && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 pb-2">
                {currentUser &&
                  searchHistory.length > 0 &&
                  searchTerm.trim() === "" && (
                    <>
                      <div className="flex justify-between items-center px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <History size={14} /> Tìm kiếm gần đây
                        </span>
                        <button
                          onClick={() => {
                            setIsSearchFocused(false);
                            handleNavigate("/search-history");
                          }}
                          className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer uppercase"
                        >
                          Xem tất cả
                        </button>
                      </div>
                      <ul className="flex flex-col">
                        {searchHistory.slice(0, 5).map((item, index) => (
                          <li
                            key={index}
                            onClick={() => handleSearch(item)}
                            className="flex items-center justify-between px-4 py-2 hover:bg-zinc-50 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <History size={14} className="text-zinc-300" />
                              <span className="text-sm font-medium text-zinc-700 group-hover:text-emerald-600 line-clamp-1">
                                {item}
                              </span>
                            </div>
                            <button
                              onClick={(e) =>
                                handleDeleteSearchHistory(e, item)
                              }
                              className="text-zinc-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-rose-50 cursor-pointer"
                            >
                              <X size={14} strokeWidth={2.5} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                {displaySuggestions.length > 0 && (
                  <div className="mt-1">
                    <div className="px-4 py-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      {searchTerm.trim() === "" ? (
                        <>
                          <BellRing size={14} className="text-orange-500" /> Món
                          ngon bán chạy
                        </>
                      ) : (
                        <>
                          <Search size={14} className="text-emerald-500" /> Kết
                          quả gợi ý
                        </>
                      )}
                    </div>
                    <ul className="flex flex-col">
                      {displaySuggestions.map((product) => (
                        <li
                          key={product.id_product}
                          onClick={() => {
                            setIsSearchFocused(false);
                            navigate(`/detail-product/${product.id_product}`);
                          }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-emerald-50/50 cursor-pointer group transition-colors"
                        >
                          <img
                            src={
                              product.image_url ||
                              "https://via.placeholder.com/40"
                            }
                            alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-100 group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-zinc-700 group-hover:text-emerald-700 line-clamp-1 transition-colors">
                              {product.name}
                            </h4>
                            <span className="text-xs font-black text-emerald-600">
                              {Number(
                                product.discount_price > 0
                                  ? product.discount_price
                                  : product.price,
                              ).toLocaleString("vi-VN")}
                              đ
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {searchTerm.trim() !== "" &&
                  displaySuggestions.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-zinc-500">
                      Không tìm thấy món nào với{" "}
                      <span className="font-bold text-zinc-700">
                        "{searchTerm}"
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>

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

            {/* CHUÔNG THÔNG BÁO */}
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
                  className={`absolute right-0 top-[calc(100%+10px)] w-80 origin-top-right overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] transition-all duration-300 ${showNotiMenu ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-4 scale-95 opacity-0"}`}
                >
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
                          className={`group relative flex items-center gap-3 p-4 border-b border-zinc-50 text-left transition-colors cursor-pointer pr-10 ${Number(noti.is_read) === 0 ? "bg-emerald-50/20 hover:bg-emerald-50/40" : "hover:bg-zinc-50"}`}
                        >
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(noti.id_notification);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
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

            {/* GIỎ HÀNG */}
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

            {/* 🚀 USER MENU */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu((prev) => !prev);
                    setShowNotiMenu(false);
                  }}
                  className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-full cursor-pointer text-zinc-700 font-semibold text-sm"
                >
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt="User"
                      className="w-7 h-7 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-black">
                      {currentUser.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span className="max-w-[100px] truncate">
                    {currentUser.full_name.split(" ").pop()}
                  </span>
                  <ChevronDown size={14} className="text-zinc-400" />
                </button>
                <div
                  className={`absolute right-0 top-[calc(100%+10px)] w-52 origin-top-right overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-200 ${showUserMenu ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`}
                >
                  {/* 🚀 BẤM NÚT NÀY ĐỂ CHUYỂN SANG TRANG CÁ NHÂN */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleNavigate("/profile");
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-emerald-600"
                  >
                    <UserRound size={16} className="text-zinc-400" /> Trang cá
                    nhân
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
        className={`pt-20 transform transition-all duration-500 ease-in-out ${isExiting ? "-translate-x-12 opacity-0" : "translate-x-0 opacity-100"}`}
      >
        <Outlet />
      </main>

      {/* FLOATING CART (MOBILE) */}
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

      {/* KHUNG THÔNG BÁO Ở GIỮA */}
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
