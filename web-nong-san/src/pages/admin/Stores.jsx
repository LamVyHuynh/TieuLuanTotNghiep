import React, { useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LogOut,
  Map,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  {
    label: "Tổng cửa hàng",
    value: "142",
    tag: "+12%",
    icon: Store,
    iconClass: "bg-emerald-100 text-emerald-700",
    tagClass: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Đơn đang hoạt động",
    value: "1,892",
    tag: "Đang chạy",
    icon: TrendingUp,
    iconClass: "bg-amber-100 text-amber-700",
    tagClass: "bg-amber-100 text-amber-700",
  },
  {
    label: "Điểm đối tác TB",
    value: "4.8",
    tag: "Toàn hệ thống",
    icon: Star,
    iconClass: "bg-lime-100 text-lime-700",
    tagClass: "bg-lime-100 text-lime-700",
  },
  {
    label: "Cảnh báo nhập hàng",
    value: "8",
    tag: "Khẩn cấp",
    icon: ClipboardList,
    iconClass: "bg-rose-100 text-rose-700",
    tagClass: "bg-rose-100 text-rose-700",
  },
];

const stores = [
  {
    name: "Green Life Market",
    badge: "Chủ lực",
    badgeClass: "bg-emerald-100 text-emerald-700",
    location: "Seattle, WA",
    address: "425 Pine St, Downtown",
    contactInitials: "ED",
    contactName: "Elena Davila",
    contactClass: "bg-lime-100 text-lime-700",
    orders: "42 đơn",
    capacity: "88% công suất",
    capacityWidth: "w-[88%]",
    capacityBar: "bg-emerald-600",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "The Pantry Co.",
    badge: "Boutique",
    badgeClass: "bg-lime-100 text-lime-700",
    location: "Portland, OR",
    address: "812 SE Division St",
    contactInitials: "MW",
    contactName: "Marcus Webb",
    contactClass: "bg-amber-100 text-amber-700",
    orders: "18 đơn",
    capacity: "32% công suất",
    capacityWidth: "w-[32%]",
    capacityBar: "bg-lime-500",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Organic Roots",
    badge: "Cảnh báo",
    badgeClass: "bg-rose-100 text-rose-700",
    location: "San Francisco, CA",
    address: "2180 Mission St",
    contactInitials: "SC",
    contactName: "Sarah Chen",
    contactClass: "bg-emerald-100 text-emerald-700",
    orders: "56 đơn",
    capacity: "112% công suất",
    capacityWidth: "w-full",
    capacityBar: "bg-rose-500",
    rating: "4.2",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=200&q=80",
  },
];

function StoresPage() {
  const [viewMode, setViewMode] = useState("table");

  return (
    <div className="min-h-screen bg-[#f7f8f5] p-4 text-slate-900 sm:p-6 lg:p-8">
          <header className="mb-12 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-900">
                Cửa hàng đối tác
              </h2>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <span>Quản trị</span>
                <ChevronRight size={14} />
                <span className="font-bold text-emerald-700">Quản lý cửa hàng</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex rounded-xl bg-[#eef2eb] p-1">
                <button
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
                    viewMode === "table"
                      ? "bg-white font-bold text-slate-900 shadow-sm"
                      : "font-medium text-slate-500 hover:text-slate-900"
                  }`}
                  onClick={() => setViewMode("table")}
                >
                  <ClipboardList size={16} />
                  Bảng
                </button>
                <button
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
                    viewMode === "map"
                      ? "bg-white font-bold text-slate-900 shadow-sm"
                      : "font-medium text-slate-500 hover:text-slate-900"
                  }`}
                  onClick={() => setViewMode("map")}
                >
                  <Map size={16} />
                  Bản đồ
                </button>
              </div>

              <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90">
                <Plus size={18} />
                Thêm cửa hàng mới
              </button>
            </div>
          </header>

          <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article
                  key={stat.label}
                  className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className={`rounded-xl p-3 ${stat.iconClass}`}>
                      <Icon size={20} />
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${stat.tagClass}`}>
                      {stat.tag}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <h4 className="text-2xl font-black tracking-[-0.03em] text-slate-900">
                    {stat.value}
                  </h4>
                </article>
              );
            })}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex flex-col gap-4 bg-[#f7faf6] px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                 Danh sách cửa hàng
              </h3>
              <div className="relative w-full max-w-sm">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm cửa hàng, địa điểm..."
                  className="w-full rounded-xl border-none bg-[#eef2eb] py-2.5 pl-10 pr-4 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                     <th className="px-8 py-4">Chi tiết cửa hàng</th>
                     <th className="px-8 py-4">Địa điểm</th>
                     <th className="px-8 py-4">Người liên hệ</th>
                     <th className="px-8 py-4">Đơn đang hoạt động</th>
                     <th className="px-8 py-4 text-center">Đánh giá</th>
                     <th className="px-8 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.map((store) => (
                    <tr key={store.name} className="transition hover:bg-[#f7faf6]">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                            <img
                              src={store.image}
                              alt={store.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{store.name}</p>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${store.badgeClass}`}>
                              {store.badge}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-500">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{store.location}</span>
                          <span className="text-xs">{store.address}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${store.contactClass}`}>
                            {store.contactInitials}
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {store.contactName}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{store.orders}</span>
                            <span className={`font-medium ${store.capacity.includes("112") ? "text-rose-600" : "text-slate-500"}`}>
                              {store.capacity}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div className={`h-full ${store.capacityBar} ${store.capacityWidth}`} />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-700">
                          <Star size={14} fill="currentColor" />
                          {store.rating}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700">
                          <ClipboardList size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 px-8 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-slate-500">
                 Hiển thị <span className="font-bold text-slate-900">3</span> trong tổng số <span className="font-bold text-slate-900">142</span> cửa hàng
              </p>
              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#eef2eb] transition hover:bg-slate-200">
                  <ChevronLeft size={18} />
                </button>
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-emerald-700 font-bold text-white">
                  1
                </button>
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#eef2eb] font-bold transition hover:bg-slate-200">
                  2
                </button>
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#eef2eb] font-bold transition hover:bg-slate-200">
                  3
                </button>
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#eef2eb] transition hover:bg-slate-200">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>

          <section className="mt-12 grid grid-cols-1 gap-8 xl:grid-cols-3">
            <article className="relative h-[450px] overflow-hidden rounded-3xl shadow-sm xl:col-span-2">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                alt="Bản đồ vị trí cửa hàng"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              <div className="absolute left-6 top-6 flex flex-col gap-2">
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white text-slate-900 shadow-lg transition hover:text-emerald-700">
                  <Plus size={18} />
                </button>
                <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white text-slate-900 shadow-lg transition hover:text-emerald-700">
                  <ChevronLeft size={18} />
                </button>
              </div>

              <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="group cursor-pointer">
                  <div className="flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white shadow-xl transition group-hover:scale-110">
                    <Store size={14} />
                    Green Life Market
                  </div>
                  <div className="mx-auto h-4 w-0.5 bg-emerald-700" />
                </div>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-3xl bg-[#eef2eb] p-8">
              <div>
                <h4 className="mb-4 text-2xl font-black tracking-[-0.04em] text-emerald-700">
                  Chỉ số mở rộng
                </h4>
                <p className="mb-8 text-sm leading-7 text-slate-500">
                  Phần lớn tăng trưởng hiện tập trung ở khu vực <span className="font-bold text-slate-900">Pacific Northwest</span>. Có thể cân nhắc mở rộng thêm các hub phía nam cho Q4.
                </p>

                <ul className="space-y-4">
                  <li className="flex items-center justify-between rounded-xl bg-white p-3">
                    <span className="text-sm font-semibold text-slate-900">Portland Hub</span>
                    <span className="text-xs font-bold text-lime-700">+24% tăng trưởng</span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-white p-3">
                    <span className="text-sm font-semibold text-slate-900">Seattle Central</span>
                    <span className="text-xs font-bold text-emerald-700">Ổn định</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 border-t border-slate-300/60 pt-8">
                <div className="mb-4 flex items-center gap-4">
                  <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Dự báo tăng trưởng
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      Tìm thấy 12 đối tác tiềm năng
                    </p>
                  </div>
                </div>
                <button className="w-full cursor-pointer rounded-xl bg-slate-200 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-300">
                  Xem pipeline đối tác
                </button>
              </div>
            </article>
          </section>

          <footer className="mt-12 border-t border-slate-200 bg-slate-50 px-2 py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                  © 2024 HealthyGO Organic. Đã đăng ký bản quyền.
                </p>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {['Liên hệ', 'Vận chuyển', 'Hoàn trả'].map((item) => (
                    <a key={item} href="#" className="text-xs uppercase tracking-[0.18em] text-slate-400 transition hover:text-emerald-600">
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex gap-x-8">
                {['Chính sách bảo mật', 'Điều khoản dịch vụ'].map((item) => (
                  <a key={item} href="#" className="text-xs uppercase tracking-[0.18em] text-slate-400 transition hover:text-emerald-600">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </footer>
    </div>
  );
}

export default StoresPage;
