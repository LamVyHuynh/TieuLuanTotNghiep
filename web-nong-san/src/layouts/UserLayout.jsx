import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  KeyRound,
  Search,
  ShoppingBag,
  UserRound,
  LogOut,
} from "lucide-react";
function UserLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  // tạo ra thêm 1 state để lưu thông tin người dùng hiện tại và ban đầu nó bằng null
  const [currentUser, setCurrentUser] = useState(null);

  // dùng useEffect để theo dõi token
  // hàm fechCurrentUser sẽ được gọi khi component được render lần đầu tiên và mỗi khi token thay đổi
  // nó sẽ gửi request đến server để lấy thông tin người dùng hiện tại dựa trên token và cập nhật state currentUser
  // dùng useEffect để gọi hàm fetchCurrentUser khi component được render lần đầu tiên khi token thay đổi
  // để hiện lên thông tin người dùng khi lần đầu header vào hiện ra luôn thì cần phải tạo ra đánh dấu sự kiện thay đổi
  // dùng useEffect thứ 2, khi thấy nó thì nó sẽ gọi hàm fetchCurrentUser để cập nhật thông tin người dùng hiện tại

  const fetchCurrentUser = async () => {
    // Lấy dữ liệu đã được lưu trong localStorage ở key "accessToken"
    const token = localStorage.getItem("accessToken");
    console.log("Token từ localStorage:", token);

    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        localStorage.removeItem("accessToken");
        setCurrentUser(null);
        return;
      }
      // Chuyển dữ liệu lấy về từ API auth/me thành JSON và lưu vào biến data
      // Lý do chuyển thành dạng JSON là vì API trả về dạng JSON
      const data = await response.json();

      // cập nhật thông tin user vào state currentUser
      setCurrentUser(data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setCurrentUser(null);
    }
  };
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Tạo ra 1 useEffect để biết event có thay đổi bên login
  useEffect(() => {
    const handleAuthChange = () => {
      fetchCurrentUser();
    };
    window.addEventListener("authChange", handleAuthChange);
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

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

  // Hàm xử lý khi người dùng nhấn nút tìm kiếm
  const handleSearch = () => {
    console.log("Tìm kiếm với từ khóa:", searchTerm);
  };

  // Làm logout xoá dữ liệu được lưu trong Storage
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setShowUserMenu(false);
    //  Sau khi đã xoá dữ liệu đăng nhập lưu trong storage thì điều hướng về trang chủ
    //  Nó sẽ check lại xem có dữ liệu ở accessToken hay không, nếu không có thì nó sẽ hiện nút đăng nhập và đăng kí

    setCurrentUser(null);
    // Cho token về null
    // setAccessToken(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbf7_0%,#fdfdf8_45%,#f7faf8_100%)] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/85 shadow-[0_10px_40px_rgba(17,24,39,0.06)] backdrop-blur-xl">
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
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserRound size={16} className="text-slate-400" />
                    Cập nhật thông tin
                  </button>
                  <button
                    type="button"
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

        <div className="border-t border-emerald-50 bg-white/80 px-4 py-3 md:hidden">
          <div className="relative mx-auto max-w-[1400px]">
            <input
              className="h-12 w-full rounded-full border border-emerald-100 bg-slate-50 py-3 pl-5 pr-14 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
              placeholder="Hôm nay mạy muốn nấu món gì?..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_18px_rgba(5,150,105,0.25)] transition hover:bg-emerald-700"
              onClick={handleSearch}
            >
              <Search size={17} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;
