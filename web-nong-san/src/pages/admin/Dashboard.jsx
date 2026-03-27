import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  Box,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Leaf,
  ChevronDown,
  MoreVertical,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const kpis = [
  {
    label: "Tổng doanh thu",
    value: "$128,430.00",
    change: "+12.5%",
    icon: CircleDollarSign,
    accent: "emerald",
    width: "w-3/4",
  },
  {
    label: "Đơn hàng mới",
    value: "1,240",
    change: "+8.2%",
    icon: ShoppingBag,
    accent: "amber",
    width: "w-1/2",
  },
  {
    label: "Người dùng hoạt động",
    value: "45,892",
    change: "+4.1%",
    icon: Users,
    accent: "lime",
    width: "w-2/3",
  },
];

const chartHeights = [
  "h-[40%]",
  "h-[55%]",
  "h-[45%]",
  "h-[70%]",
  "h-[60%]",
  "h-[85%]",
  "h-[75%]",
  "h-[95%]",
  "h-[80%]",
  "h-[65%]",
  "h-[50%]",
  "h-[70%]",
];

const inventoryItems = [
  {
    name: "Cà rốt organic",
    note: "Chỉ còn 12 bó",
    status: "SẮP HẾT HÀNG",
    badge: "bg-amber-100 text-amber-700",
    image:
      "https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Bơ Hass",
    note: "Còn 450 đơn vị",
    status: "CÒN HÀNG",
    badge: "bg-lime-100 text-lime-700",
    image:
      "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Cà chua bi",
    note: "Danh sách chờ: 45 khách",
    status: "HẾT HÀNG",
    badge: "bg-rose-100 text-rose-700",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=200&q=80",
  },
];

const orders = [
  {
    id: "#HG-9842",
    customer: "Jane Doe",
    initials: "JD",
    date: "Oct 24, 2024",
    status: "ĐÃ GIAO",
    total: "$142.50",
    badge: "bg-lime-100 text-lime-700",
  },
  {
    id: "#HG-9841",
    customer: "Brian Smith",
    initials: "BS",
    date: "Oct 24, 2024",
    status: "ĐANG XỬ LÝ",
    total: "$89.00",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    id: "#HG-9840",
    customer: "Maria Lopez",
    initials: "ML",
    date: "Oct 23, 2024",
    status: "ĐÃ GIAO",
    total: "$210.30",
    badge: "bg-lime-100 text-lime-700",
  },
  {
    id: "#HG-9839",
    customer: "Tom Cook",
    initials: "TC",
    date: "Oct 23, 2024",
    status: "ĐÃ HỦY",
    total: "$45.10",
    badge: "bg-rose-100 text-rose-700",
  },
  {
    id: "#HG-9838",
    customer: "Elena Scott",
    initials: "ES",
    date: "Oct 22, 2024",
    status: "ĐÃ GIAO",
    total: "$125.00",
    badge: "bg-lime-100 text-lime-700",
  },
];

function Dashboard() {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const adminData = JSON.parse(localStorage.getItem("userDataLogin"));
  const navigate = useNavigate();
  const adminMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutAdmin = () => {
    localStorage.removeItem("userDataLogin");
    setShowAdminMenu(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8">
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-md sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex w-full max-w-md items-center rounded-xl bg-slate-100 px-4 py-2.5 ring-0 transition focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]">
          <Search size={18} className="mr-2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm analytics, đơn hàng hoặc sản phẩm..."
            className="w-full border-none bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center justify-between gap-4 lg:justify-end lg:gap-6">
          <button className="relative cursor-pointer rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div className="relative flex items-center gap-3 border-l border-slate-200 pl-4" ref={adminMenuRef}>
            <button
              type="button"
              onClick={() => setShowAdminMenu((prev) => !prev)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-slate-50"
            >
              <div className="text-right">
                {adminData ? (
                  <p className="text-sm font-bold text-slate-900">
                    {adminData.full_name}
                  </p>
                ) : (
                  <p className="text-sm font-bold text-slate-900">Admin</p>
                )}

                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Quản trị viên cấp cao
                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="Admin avatar"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-100"
              />
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            <div
              className={`absolute right-0 top-[calc(100%+10px)] z-50 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-200 ${
                showAdminMenu
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-2 scale-95 opacity-0"
              }`}
            >
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
                onClick={handleLogoutAdmin}
                className="flex w-full cursor-pointer items-center px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <section>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-900">
            Tổng quan hiệu suất
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu thời gian thực cho hệ sinh thái HealthyGO.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => {
            const Icon = item.icon;
            const accentClass =
              item.accent === "emerald"
                ? "bg-emerald-100 text-emerald-700"
                : item.accent === "amber"
                ? "bg-amber-100 text-amber-700"
                : "bg-lime-100 text-lime-700";
            const barClass =
              item.accent === "emerald"
                ? "bg-emerald-600"
                : item.accent === "amber"
                ? "bg-amber-500"
                : "bg-lime-600";

            return (
              <article
                key={item.label}
                className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-lg p-2 ${accentClass}`}>
                    <Icon size={20} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <TrendingUp size={12} />
                    {item.change}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-900">
                  {item.value}
                </h3>
                <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${barClass} ${item.width}`}
                  />
                </div>
              </article>
            );
          })}

          <article className="relative overflow-hidden rounded-xl bg-emerald-700 p-6 text-white shadow-sm">
            <div className="relative z-10">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg bg-white/20 p-2">
                  <Leaf size={20} />
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Bán chạy nhất
              </p>
              <h3 className="mt-1 text-xl font-black tracking-[-0.03em]">
                Organic Kale Mix
              </h3>
              <p className="mt-2 text-sm text-white/80">
                2.450 đơn vị trong tuần này
              </p>
            </div>
            <Leaf className="absolute -bottom-4 -right-4 h-24 w-24 text-white/20" />
          </article>
        </section>

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <article className="rounded-xl border border-slate-200/70 bg-white p-8 shadow-sm xl:col-span-2">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-lg font-black tracking-[-0.03em] text-slate-900">
                  Xu hướng doanh thu
                </h4>
                <p className="text-xs text-slate-500">
                  Doanh thu gộp theo tháng so với kỳ trước
                </p>
              </div>
              <select className="rounded-lg border-none bg-slate-100 py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-100">
                <option>12 tháng gần nhất</option>
                <option>6 tháng gần nhất</option>
                <option>Từ đầu năm đến nay</option>
              </select>
            </div>

            <div className="flex h-64 items-end justify-between gap-2 border-b border-slate-100 px-2 pb-2">
              {chartHeights.map((height, index) => (
                <div
                  key={index}
                  className={`w-full rounded-t-lg ${
                    index === 7
                      ? "bg-emerald-600"
                      : "bg-slate-100 hover:bg-emerald-200"
                  } ${height}`}
                />
              ))}
            </div>

            <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {[
                "Th1",
                "Th2",
                "Th3",
                "Th4",
                "Th5",
                "Th6",
                "Th7",
                "Th8",
                "Th9",
                "Th10",
                "Th11",
                "Th12",
              ].map((month) => (
                <span
                  key={month}
                  className={month === "Th8" ? "text-emerald-700" : ""}
                >
                  {month}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200/70 bg-white p-8 shadow-sm">
            <h4 className="mb-6 text-lg font-black tracking-[-0.03em] text-slate-900">
              Tình trạng tồn kho
            </h4>

            <div className="space-y-6">
              {inventoryItems.map((item) => (
                <div key={item.name} className="flex gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">
                        {item.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badge}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">
              Xem toàn bộ tồn kho
            </button>
          </article>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
            <div>
              <h4 className="text-lg font-black tracking-[-0.03em] text-slate-900">
                Đơn hàng gần đây
              </h4>
              <p className="text-xs text-slate-500">
                Nhật ký giao dịch thời gian thực từ mọi khu vực
              </p>
            </div>
            <button className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-slate-50">
              Xem tất cả
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50/70">
                <tr>
                  {[
                    "Mã đơn",
                    "Khách hàng",
                    "Ngày",
                    "Trạng thái",
                    "Tổng tiền",
                    "Thao tác",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-slate-50/50"
                  >
                    <td className="px-8 py-5 text-sm font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="px-8 py-5 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                          {order.initials}
                        </div>
                        <span>{order.customer}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {order.date}
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${order.badge}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-900">
                      {order.total}
                    </td>
                    <td className="px-8 py-5">
                      <button className="cursor-pointer text-slate-400 transition hover:text-emerald-700">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 bg-slate-50 px-4 py-8 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              © 2024 HealthyGO Organic. Đã đăng ký bản quyền.
            </p>
            <div className="flex gap-6">
              <a
                className="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition hover:text-emerald-600"
                href="#"
              >
                Chính sách bảo mật
              </a>
              <a
                className="text-[10px] uppercase tracking-[0.2em] text-slate-400 transition hover:text-emerald-600"
                href="#"
              >
                Điều khoản dịch vụ
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
