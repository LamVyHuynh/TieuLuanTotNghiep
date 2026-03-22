import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Filter,
  LogOut,
  MoreVertical,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store,
  UserPlus,
  Users,
} from "lucide-react";

const sidebarItems = [
  { label: "Tổng quan", icon: ClipboardList, active: false },
  { label: "Người dùng", icon: Users, active: true },
  { label: "Sản phẩm", icon: Package, active: false },
  { label: "Cửa hàng", icon: Store, active: false },
  { label: "Đơn hàng", icon: ShoppingBag, active: false },
  { label: "Báo cáo", icon: ClipboardList, active: false },
];

const bottomSidebarItems = [
  { label: "Cài đặt", icon: Settings },
  { label: "Đăng xuất", icon: LogOut },
];

const users = [
  {
    name: "Marcus Thorne",
    joined: "Joined 12 Oct 2023",
    email: "marcus.thorne@example.com",
    role: "Quản trị",
    roleClass: "bg-amber-100 text-amber-700",
    status: "Hoạt động",
    statusClass: "bg-emerald-500",
    lastLogin: "2 mins ago",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Sarah Jenkins",
    joined: "Joined 05 Nov 2023",
    email: "s.jenkins@provider.net",
    role: "Khách hàng",
    roleClass: "bg-lime-100 text-lime-700",
    status: "Hoạt động",
    statusClass: "bg-emerald-500",
    lastLogin: "14 hours ago",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Elias Vance",
    joined: "Joined 18 Nov 2023",
    email: "vance.elias@corp.com",
    role: "Khách hàng",
    roleClass: "bg-lime-100 text-lime-700",
    status: "Tạm khóa",
    statusClass: "bg-rose-500",
    lastLogin: "28 days ago",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Julian Smith",
    joined: "Joined 21 Nov 2023",
    email: "j.smith@webmail.com",
    role: "Khách hàng",
    roleClass: "bg-lime-100 text-lime-700",
    status: "Hoạt động",
    statusClass: "bg-emerald-500",
    lastLogin: "Yesterday",
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=120&q=80",
  },
];

const stats = [
  {
    label: "Tổng người dùng",
    value: "12,490",
    icon: Users,
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Quản trị viên",
    value: "14",
    icon: UserPlus,
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    label: "Chờ tạm khóa",
    value: "3",
    icon: Plus,
    iconClass: "bg-lime-100 text-lime-700",
  },
];

function UsersPage() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-900">
      <div className="lg:flex">
        <aside className="border-b border-slate-200 bg-[#f1f2ee] p-4 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="mb-8 px-2">
            <h1 className="text-xl font-black tracking-[-0.05em] text-emerald-800">
              HealthyGO Admin
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Cổng quản trị
            </p>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    item.active
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-slate-200 pt-4">
            {bottomSidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-screen flex-1 p-4 sm:p-6 lg:ml-64 lg:p-8">
          <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">
                Quản lý người dùng
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Xem và quản lý người dùng trong hệ thống. Theo dõi quyền, trạng
                thái tài khoản và hoạt động đăng nhập tại một nơi.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01]">
              <UserPlus size={18} />
              Thêm người dùng
            </button>
          </header>

          <section className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-[#eef2eb] p-4">
            <div className="relative max-w-md flex-1 min-w-[260px]">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                  placeholder="Tìm theo tên, email hoặc vai trò..."
                className="w-full rounded-lg border-none bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none ring-0 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
                <Filter size={16} />
                Bộ lọc
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
                <Download size={16} />
                Xuất CSV
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#eef2eb] text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                    <th className="px-6 py-4">Tên</th>
                    <th className="px-6 py-4">Địa chỉ email</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Lần đăng nhập cuối</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user, index) => (
                    <tr
                      key={user.email}
                      className={`group transition hover:bg-[#f7faf6] ${
                        index % 2 === 1 ? "bg-[#fbfcfa]" : ""
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">{user.joined}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${user.roleClass}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <span
                            className={`h-2 w-2 rounded-full ${user.statusClass}`}
                          />
                          {user.status}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm italic text-slate-500">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition group-hover:opacity-100">
                          <button className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 bg-[#f7faf6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-medium text-slate-500">
                Hiển thị 1 đến 4 trong tổng số 288 người dùng
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-lg bg-slate-200 p-2 text-slate-500 opacity-50"
                  disabled
                >
                  <ChevronLeft size={18} />
                </button>
                <button className="rounded-lg bg-emerald-700 px-3 py-1 text-sm font-bold text-white">
                  1
                </button>
                <button className="rounded-lg bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
                  2
                </button>
                <button className="rounded-lg bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
                  3
                </button>
                <button className="rounded-lg bg-slate-200 p-2 text-slate-700 transition hover:bg-slate-300">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>

          <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article
                  key={stat.label}
                  className="flex items-center gap-4 rounded-2xl bg-[#eef2eb] p-6"
                >
                  <div className={`rounded-xl p-3 ${stat.iconClass}`}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {stat.label}
                    </p>
                    <h4 className="text-2xl font-black tracking-[-0.03em] text-slate-900">
                      {stat.value}
                    </h4>
                  </div>
                </article>
              );
            })}
          </section>

          <footer className="mt-12 border-t border-slate-200 bg-slate-50 px-2 py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                © 2024 HealthyGO Organic. Đã đăng ký bản quyền.
              </div>
              <div className="flex flex-wrap gap-6">
                {[
                  "Liên hệ",
                  "Vận chuyển",
                  "Hoàn trả",
                  "Chính sách bảo mật",
                  "Điều khoản dịch vụ",
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-xs uppercase tracking-[0.18em] text-slate-400 transition hover:text-emerald-600"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default UsersPage;
