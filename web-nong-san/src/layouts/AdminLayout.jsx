import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

const sidebarItems = [
  { label: "Tổng quan", icon: BarChart3, to: "/admin", end: true },
  { label: "Người dùng", icon: Users, to: "/admin/users" },
  { label: "Sản phẩm", icon: Package, to: "/admin/products" },
  { label: "Cửa hàng", icon: Store, to: "/admin/stores" },
  { label: "Đơn hàng", icon: ShoppingBag, to: "/admin/orders" },
  { label: "Báo cáo", icon: ClipboardList, to: "/admin/reports" },
];

const bottomSidebarItems = [
  { label: "Cài đặt", icon: Settings },
  { label: "Đăng xuất", icon: LogOut },
];

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-900 lg:flex">
      <aside className="border-b border-slate-200 bg-[#f1f2ee] p-4 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="mb-8 px-2 py-4">
          <h1 className="text-xl font-black tracking-[-0.05em] text-emerald-800">
            HealthyGO Admin
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Cổng quản trị
          </p>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-slate-200 pt-4">
          {bottomSidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
