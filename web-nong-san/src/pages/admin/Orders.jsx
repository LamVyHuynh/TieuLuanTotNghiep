import React, { useState, useEffect } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Star,
  Truck,
  ShoppingBag,
  RefreshCcw,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

const statusTabs = [
  "Tất cả",
  "Chờ xử lý",
  "Đã xác nhận",
  "Đang giao",
  "Đã giao",
  "Đã hủy",
];

// Hàm tiện ích để dịch trạng thái và lấy màu Badge tương ứng
const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
      return { text: "Chờ xử lý", className: "bg-rose-100 text-rose-700" };
    case "processing":
      return { text: "Đã xác nhận", className: "bg-slate-200 text-slate-700" };
    case "shipping":
      return { text: "Đang giao", className: "bg-amber-100 text-amber-700" };
    case "completed":
      return { text: "Đã giao", className: "bg-lime-100 text-lime-700" };
    case "cancelled":
      return { text: "Đã hủy", className: "bg-red-100 text-red-700" };
    default:
      return { text: status, className: "bg-gray-100 text-gray-700" };
  }
};

// Hàm dịch phương thức thanh toán
const getPaymentMethod = (method) => {
  if (method === "cod") return "Tiền mặt (COD)";
  if (method === "momo") return "Ví MoMo";
  if (method === "bank") return "Chuyển khoản";
  return method;
};

// --- Dummy data cho Insights (Có thể làm API sau) ---
const insights = [
  {
    title: "Hiệu quả giao hàng",
    note: "92% giao đúng hẹn trong tuần này.",
    value: "92%",
    width: "w-[92%]",
    bar: "bg-lime-600",
    icon: Truck,
    iconWrap: "bg-lime-100 text-lime-700",
  },
  {
    title: "Giỏ hàng bị bỏ quên",
    note: "Tỷ lệ 18% - giảm 4% so với kỳ trước.",
    value: "18%",
    width: "w-[18%]",
    bar: "bg-amber-500",
    icon: ShoppingBag,
    iconWrap: "bg-amber-100 text-amber-700",
  },
  {
    title: "Đánh giá khách hàng",
    note: "Dựa trên 1.2k lượt đánh giá của khách.",
    value: "4.9",
    width: "w-full",
    bar: "bg-emerald-600",
    icon: Star,
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
];

function OrdersPage() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  // State chứa Data thật từ API
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy toàn bộ đơn hàng
  useEffect(() => {
    const fetchAdminOrders = async () => {
      try {
        const res = await axiosClient.get("/orders/admin/all");
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error("Lỗi tải đơn hàng admin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminOrders();
  }, []);

  // Xử lý Lọc và Tìm kiếm (Filter & Search Frontend)
  const filteredOrders = orders.filter((order) => {
    const statusConfig = getStatusConfig(order.status);

    // 1. Lọc theo Tab trạng thái
    const matchesTab =
      activeTab === "Tất cả" || statusConfig.text === activeTab;

    // 2. Lọc theo Search (Mã đơn hoặc Tên khách)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (order.id_order && order.id_order.toLowerCase().includes(searchLower)) ||
      (order.full_name && order.full_name.toLowerCase().includes(searchLower));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8">
      <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-black tracking-[-0.04em] text-slate-900">
            Quản lý đơn hàng
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Theo dõi và xử lý các đơn hàng thực phẩm organic trong hệ thống.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="cursor-pointer rounded-lg bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300">
            <span className="inline-flex items-center gap-2">
              <Download size={16} />
              Xuất CSV
            </span>
          </button>
          <button className="cursor-pointer rounded-lg bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
            Tạo đơn thủ công
          </button>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="rounded-xl bg-[#eef2eb] p-6 xl:col-span-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Bộ lọc trạng thái đơn
            </h3>
            <div className="flex flex-wrap gap-1 rounded-full bg-slate-200 p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    activeTab === tab
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                className="w-full rounded-lg border-none bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
              />
            </div>
            <button className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
              <Search size={16} />
              Thêm bộ lọc
            </button>
          </div>
        </article>

        {/* Tạm thời tính tổng doanh thu từ mảng orders. Nếu cần chính xác phải tính từ API */}
        <article className="relative overflow-hidden rounded-xl bg-emerald-700 p-6 text-white xl:col-span-4">
          <div className="relative z-10">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-lime-100">
              Tổng doanh thu hệ thống
            </p>
            <h4 className="mb-4 text-4xl font-black tracking-[-0.04em]">
              {orders
                .filter((o) => o.status !== "cancelled")
                .reduce((sum, o) => sum + Number(o.total_amount), 0)
                .toLocaleString("vi-VN")}
              đ
            </h4>
            <div className="flex items-center gap-2 text-sm font-semibold text-lime-100">
              <BarChart3 size={16} />
              <span>Chỉ tính các đơn chưa hủy</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </article>
      </section>

      {/* BẢNG QUẢN LÝ ĐƠN HÀNG */}
      <section className="overflow-hidden rounded-2xl bg-[#eef2eb] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-200/70 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 w-[250px]">Sản phẩm</th>
                <th className="px-6 py-4">Ngày đặt</th>
                <th className="px-6 py-4">Tổng tiền</th>
                <th className="px-6 py-4">Thanh toán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="py-20 text-center text-emerald-600"
                  >
                    <RefreshCcw
                      size={32}
                      className="animate-spin mx-auto mb-3"
                    />
                    <p className="font-bold">Đang tải danh sách đơn hàng...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center text-slate-500">
                    Không tìm thấy đơn hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const statusConf = getStatusConfig(order.status);

                  return (
                    <tr
                      key={order.id_order}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-[#f8faf7]"
                      } transition hover:bg-[#f2f6f0]`}
                    >
                      {/* Mã đơn */}
                      <td className="px-6 py-5 font-mono text-xs font-bold text-emerald-700">
                        #{order.id_order}
                      </td>

                      {/* Khách hàng */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs uppercase shrink-0">
                            {order.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">
                              {order.full_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, i) => (
                              <p
                                key={i}
                                className="line-clamp-1 text-xs font-medium"
                              >
                                • {item.product_name}{" "}
                                <span className="text-slate-400">
                                  (x{item.quantity})
                                </span>
                              </p>
                            ))
                          ) : (
                            <span className="italic text-slate-400">
                              Không có dữ liệu món
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ngày đặt */}
                      <td className="px-6 py-5 text-sm text-slate-500 font-medium">
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

                      {/* Tổng tiền */}
                      <td className="px-6 py-5 text-sm font-black text-amber-600">
                        {Number(order.total_amount).toLocaleString("vi-VN")}đ
                      </td>

                      {/* Phương thức thanh toán */}
                      <td className="px-6 py-5 text-xs font-bold text-slate-500">
                        {getPaymentMethod(order.payment_method)}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${statusConf.className}`}
                        >
                          {statusConf.text}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-5 text-right">
                        <button className="cursor-pointer rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100">
                          Duyệt đơn
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang (Mock) */}
        {!loading && filteredOrders.length > 0 && (
          <div className="flex flex-col gap-4 bg-slate-200/50 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div>Đang hiển thị {filteredOrders.length} đơn hàng</div>
            <div className="flex gap-2">
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white text-slate-500 transition hover:bg-slate-100">
                <ChevronLeft size={16} />
              </button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-emerald-700 text-white">
                1
              </button>
              <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white text-slate-500 transition hover:bg-slate-100">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* INSIGHTS (Giữ lại giao diện cho đẹp) */}
      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-xl bg-[#eef2eb] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${item.iconWrap}`}>
                  <Icon size={18} />
                </div>
                <h5 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h5>
              </div>
              {item.title === "Đánh giá khách hàng" ? (
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-slate-900">
                    {item.value}
                  </span>
                  <span className="text-xs text-slate-500">/ 5.0</span>
                </div>
              ) : (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full ${item.bar} ${item.width}`} />
                </div>
              )}
              <p className="mt-2 text-xs font-medium text-slate-500">
                {item.note}
              </p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default OrdersPage;
