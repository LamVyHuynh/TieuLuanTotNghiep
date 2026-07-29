import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronRight,
  KeyRound,
  CircleDollarSign,
  Leaf,
  ChevronDown,
  MoreVertical,
  Search,
  ShoppingBag,
  TrendingUp,
  UserRound,
  Users,
  LogOut,
  RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import axiosClient from "../../api/axiosClient";

const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
      return { text: "CHỜ XỬ LÝ", badge: "bg-slate-100 text-slate-600" };
    case "processing":
      return { text: "XÁC NHẬN", badge: "bg-blue-100 text-blue-700" };
    case "shipping":
      return { text: "ĐANG GIAO", badge: "bg-amber-100 text-amber-700" };
    case "completed":
      return { text: "ĐÃ GIAO", badge: "bg-emerald-100 text-emerald-700" };
    case "cancelled":
      return { text: "ĐÃ HỦY", badge: "bg-rose-100 text-rose-700" };
    default:
      return { text: status, badge: "bg-gray-100 text-gray-700" };
  }
};

function Dashboard() {
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const navigate = useNavigate();
  const adminMenuRef = useRef(null);
  const { currentUser, logout, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    recentOrders: [],
    bestSellingProducts: [],
    monthlyRevenue: Array(12).fill({ revenue: 0, orders: 0 }), // Mảng object
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target)
      ) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosClient.get("/orders/admin/dashboard");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const handleLogoutAdmin = () => {
    logout();
    setShowAdminMenu(false);
    navigate("/login");
  };

  if (authLoading)
    return (
      <p className="p-10 text-center font-bold text-emerald-600">
        Đang kiểm tra...
      </p>
    );

  // 🚀 TÍNH TOÁN ĐỈNH CỘT: Trích xuất mảng tiền ra để tìm Max
  const monthlyDataArray =
    stats.monthlyRevenue || Array(12).fill({ revenue: 0, orders: 0 });
  const maxMonthlyRevenue = Math.max(...monthlyDataArray.map((m) => m.revenue));
  const currentMonthIndex = new Date().getMonth();

  const kpis = [
    {
      label: "Tổng doanh thu",
      value: `${Number(stats.totalRevenue).toLocaleString("vi-VN")}đ`,
      change: "+Thực tế",
      icon: CircleDollarSign,
      accent: "emerald",
      width: "w-full",
    },
    {
      label: "Tổng đơn hàng",
      value: Number(stats.totalOrders).toLocaleString("vi-VN"),
      change: "+Thực tế",
      icon: ShoppingBag,
      accent: "amber",
      width: "w-[80%]",
    },
    {
      label: "Người dùng đăng ký",
      value: Number(stats.totalUsers).toLocaleString("vi-VN"),
      change: "+Thực tế",
      icon: Users,
      accent: "lime",
      width: "w-[60%]",
    },
  ];

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-md sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex w-full max-w-md items-center rounded-xl bg-slate-100 px-4 py-2.5 ring-0 transition focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]">
          <Search size={18} className="mr-2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm analytics, đơn hàng hoặc sản phẩm..."
            className="w-full border-none bg-transparent p-0 text-sm text-slate-700 focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center justify-between gap-4 lg:justify-end lg:gap-6">
          <button className="relative cursor-pointer rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <div
            className="relative flex items-center gap-3 border-l border-slate-200 pl-4"
            ref={adminMenuRef}
          >
            <button
              onClick={() => setShowAdminMenu((prev) => !prev)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-slate-50"
            >
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">
                  {currentUser ? currentUser.full_name : "Admin"}
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Quản trị viên
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                {currentUser?.full_name?.charAt(0) || "A"}
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </button>
            <div
              className={`absolute right-0 top-[calc(100%+10px)] z-50 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition-all duration-200 ${showAdminMenu ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-2 scale-95 opacity-0"}`}
            >
              <button className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <UserRound size={16} className="text-slate-400" /> Cập nhật
                thông tin
              </button>
              <button className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <KeyRound size={16} className="text-slate-400" /> Đổi mật khẩu
              </button>
              <button
                onClick={handleLogoutAdmin}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} className="text-rose-500" /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {isLoadingStats ? (
        <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
          <RefreshCcw size={40} className="animate-spin mb-4" />
          <p className="font-bold text-lg">Đang tổng hợp dữ liệu hệ thống...</p>
        </div>
      ) : (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
          <section>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-900">
              Tổng quan hiệu suất
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Báo cáo tổng hợp doanh thu, đơn hàng và người dùng đăng ký trong
              năm
            </p>
          </section>

          {/* KPI CARDS */}
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
                      <TrendingUp size={12} /> {item.change}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {item.label}
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-900 line-clamp-1">
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

            {/* TOP 1 SẢN PHẨM BÁN CHẠY */}
            <article className="relative overflow-hidden rounded-xl bg-emerald-700 p-6 text-white shadow-sm flex flex-col justify-center">
              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Leaf size={20} />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                  Sản phẩm Bán chạy nhất
                </p>
                <h3 className="mt-1 text-xl font-black tracking-[-0.03em] line-clamp-1">
                  {stats.bestSellingProducts?.length > 0
                    ? stats.bestSellingProducts[0].product_name
                    : "Chưa có dữ liệu"}
                </h3>
                <p className="mt-2 text-sm text-white/80 font-semibold">
                  {stats.bestSellingProducts?.length > 0
                    ? `Đã bán ${stats.bestSellingProducts[0].total_sold} phần`
                    : "---"}
                </p>
              </div>
              <Leaf className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10" />
            </article>
          </section>

          <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            {/* 🚀 CHART ĐỘNG VỚI CUSTOM TOOLTIP */}
            <article className="rounded-xl border border-slate-200/70 bg-white p-8 shadow-sm xl:col-span-2">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-lg font-black tracking-[-0.03em] text-slate-900">
                    Xu hướng doanh thu {new Date().getFullYear()}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Doanh thu gộp theo từng tháng
                  </p>
                </div>
              </div>

              <div className="flex h-64 items-end justify-between gap-3 border-b border-slate-100 px-2 pb-2">
                {monthlyDataArray.map((data, index) => {
                  const heightPercent =
                    maxMonthlyRevenue > 0
                      ? Math.max((data.revenue / maxMonthlyRevenue) * 100, 2)
                      : 2;
                  const isCurrentMonth = currentMonthIndex === index;

                  return (
                    <div
                      key={index}
                      className="group relative w-full h-full flex items-end justify-center"
                    >
                      {/* Tooltip hiển thị khi Hover */}
                      <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs rounded-lg py-2 px-3 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        <p className="font-bold mb-1 text-emerald-400">
                          Tháng {index + 1}
                        </p>
                        <p>
                          Doanh thu: {data.revenue.toLocaleString("vi-VN")}đ
                        </p>
                        <p className="text-slate-300">
                          Đơn hàng: {data.orders} đơn
                        </p>
                        {/* Mũi tên trỏ xuống của Tooltip */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                      </div>

                      {/* Cột Biểu Đồ */}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ease-out cursor-pointer ${
                          isCurrentMonth
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-slate-200 hover:bg-emerald-300"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
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
                ].map((month, idx) => (
                  <span
                    key={month}
                    className={
                      currentMonthIndex === idx ? "text-emerald-700" : ""
                    }
                  >
                    {month}
                  </span>
                ))}
              </div>
            </article>

            {/* DANH SÁCH BÁN CHẠY */}
            <article className="rounded-xl border border-slate-200/70 bg-white p-8 shadow-sm">
              <h4 className="mb-6 text-lg font-black tracking-[-0.03em] text-slate-900">
                Top 5 Bán Chạy Nhất
              </h4>
              <div className="space-y-6">
                {stats.bestSellingProducts?.length > 0 ? (
                  stats.bestSellingProducts.map((item, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">
                            {item.product_name}
                          </p>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                            HOT
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 font-semibold">
                          Đã bán: {item.total_sold} phần
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Chưa có dữ liệu bán hàng.
                  </p>
                )}
              </div>
            </article>
          </section>

          {/* BẢNG ĐƠN HÀNG GẦN ĐÂY */}
          <section className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <div>
                <h4 className="text-lg font-black tracking-[-0.03em] text-slate-900">
                  5 Đơn hàng mới nhất
                </h4>
                <p className="text-xs text-slate-500">
                  Cập nhật theo thời gian thực
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/orders")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-slate-50"
              >
                Xem tất cả <ChevronRight size={16} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-50/70">
                  <tr>
                    {[
                      "Mã đơn",
                      "Khách hàng",
                      "Ngày tạo",
                      "Trạng thái",
                      "Tổng tiền",
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
                  {stats.recentOrders?.length > 0 ? (
                    stats.recentOrders.map((order) => {
                      const statusConf = getStatusConfig(order.status);
                      return (
                        <tr
                          key={order.id_order}
                          className="transition hover:bg-slate-50/50"
                        >
                          <td className="px-8 py-5 text-sm font-bold text-emerald-600">
                            #{order.id_order}
                          </td>
                          <td className="px-8 py-5 text-sm">
                            <div className="flex items-center gap-3">
                              {/* 🚀 ĐÃ CẬP NHẬT LOGIC AVATAR VÀO ĐÂY */}
                              {order.avatar_url ? (
                                <img
                                  src={order.avatar_url}
                                  alt={order.full_name}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-sm"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500 uppercase">
                                  {order.full_name?.charAt(0) || "U"}
                                </div>
                              )}
                              <span className="font-semibold text-slate-800">
                                {order.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                            {new Date(order.created_at).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>
                          <td className="px-8 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-[10px] font-bold ${statusConf.badge}`}
                            >
                              {statusConf.text}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm font-black text-slate-900">
                            {Number(order.total_amount).toLocaleString("vi-VN")}
                            đ
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-8 py-10 text-center text-sm text-slate-500"
                      >
                        Chưa có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
