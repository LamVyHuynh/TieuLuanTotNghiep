import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, Search, ShoppingBag } from "lucide-react";

function UserLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const userDataLogin = JSON.parse(localStorage.getItem("userDataLogin"));

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
    localStorage.removeItem("userDataLogin");
    setShowUserMenu(false);
    //  Sau khi đã xoá dữ liệu đăng nhập lưu trong storage thì điều hướng về trang chủ
    //  Nó sẽ check lại xem có dữ liệu ở userDataLogin hay không, nếu không có thì nó sẽ hiện nút đăng nhập và đăng kí
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
            {userDataLogin ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:px-5"
                >
                  <span>{userDataLogin.full_name}</span>
                  <ChevronDown size={16} />
                </button>

                {showUserMenu ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Cập nhật thông tin cá nhân
                    </button>
                    <button
                      type="button"
                      className="flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Đổi mật khẩu
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : null}
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
