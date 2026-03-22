import React, { useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Truck,
  Users,
} from "lucide-react";

const statusTabs = ["Tất cả", "Chờ xử lý", "Đã xác nhận", "Đang giao", "Đã giao"];

const orders = [
  {
    id: "#HG-82910",
    customer: "Elena Rodriguez",
    email: "elena.r@email.com",
    date: "Oct 24, 2023",
    amount: "$142.50",
    payment: "Credit Card (**** 4291)",
    status: "Đã giao",
    statusClass: "bg-lime-100 text-lime-700",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "#HG-82911",
    customer: "Marcus Thorne",
    email: "marcus.t@web.dev",
    date: "Oct 24, 2023",
    amount: "$89.99",
    payment: "Apple Pay",
    status: "Đang giao",
    statusClass: "bg-amber-100 text-amber-700",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "#HG-82912",
    customer: "Sarah Jenkins",
    email: "s.jenkins@provider.com",
    date: "Oct 23, 2023",
    amount: "$210.00",
    payment: "PayPal",
    status: "Đã xác nhận",
    statusClass: "bg-slate-200 text-slate-600",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "#HG-82913",
    customer: "Lila Chen",
    email: "lila.chen@social.io",
    date: "Oct 23, 2023",
    amount: "$56.25",
    payment: "Credit Card (**** 9002)",
    status: "Chờ xử lý",
    statusClass: "bg-rose-100 text-rose-700",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=120&q=80",
  },
];

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
                <h3 className="text-lg font-bold text-slate-900">Bộ lọc trạng thái đơn</h3>
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
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã đơn hoặc khách hàng..."
                    className="w-full rounded-lg border-none bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
                  />
                </div>
                <button className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
                  <Search size={16} />
                  Thêm bộ lọc
                </button>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-xl bg-emerald-700 p-6 text-white xl:col-span-4">
              <div className="relative z-10">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-lime-100">
                  Doanh thu hôm nay
                </p>
                <h4 className="mb-4 text-4xl font-black tracking-[-0.04em]">
                  $12,482.90
                </h4>
                <div className="flex items-center gap-2 text-sm font-semibold text-lime-100">
                  <BarChart3 size={16} />
                  <span>+14.2% so với hôm qua</span>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            </article>
          </section>

          <section className="overflow-hidden rounded-2xl bg-[#eef2eb] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-200/70 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                     <th className="px-6 py-4">Mã đơn</th>
                     <th className="px-6 py-4">Tên khách hàng</th>
                     <th className="px-6 py-4">Ngày</th>
                     <th className="px-6 py-4">Tổng tiền</th>
                     <th className="px-6 py-4">Thanh toán</th>
                     <th className="px-6 py-4">Trạng thái</th>
                     <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-[#f8faf7]"} transition hover:bg-[#f2f6f0]`}
                    >
                      <td className="px-6 py-5 font-mono text-xs font-bold text-emerald-700">
                        {order.id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={order.avatar}
                            alt={order.customer}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {order.customer}
                            </p>
                            <p className="text-xs text-slate-500">{order.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">{order.date}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-900">{order.amount}</td>
                      <td className="px-6 py-5 text-xs font-medium text-slate-500">{order.payment}</td>
                      <td className="px-6 py-5">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${order.statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="cursor-pointer text-sm font-bold text-emerald-700 transition hover:underline">
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 bg-slate-200/50 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <div>Hiển thị 1 - 10 trong tổng số 248 đơn</div>
              <div className="flex gap-2">
                <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white text-slate-500 transition hover:bg-slate-100">
                  <ChevronLeft size={16} />
                </button>
                <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-emerald-700 text-white">1</button>
                <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white text-slate-700 transition hover:bg-slate-100">2</button>
                <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white text-slate-700 transition hover:bg-slate-100">3</button>
                <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-white text-slate-500 transition hover:bg-slate-100">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {insights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-xl bg-[#eef2eb] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${item.iconWrap}`}>
                      <Icon size={18} />
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">{item.title}</h5>
                  </div>
                  {item.title === "Customer Rating" ? (
                    <div className="flex items-end gap-1">
                      <span className="text-xl font-bold text-slate-900">{item.value}</span>
                      <span className="text-xs text-slate-500">/ 5.0</span>
                    </div>
                  ) : (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-full ${item.bar} ${item.width}`} />
                    </div>
                  )}
                  <p className="mt-2 text-xs font-medium text-slate-500">{item.note}</p>
                </article>
              );
            })}
          </section>
    </div>
  );
}

export default OrdersPage;
