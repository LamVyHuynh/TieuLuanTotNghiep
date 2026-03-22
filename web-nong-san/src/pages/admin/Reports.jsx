import React, { useState } from "react";
import {
  BarChart3,
  ClipboardList,
  Coffee,
  Cookie,
  Egg,
  Leaf,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";

const revenueBars = [50, 75, 60, 82, 68, 86, 100];

const categoryData = [
  { name: "Thực phẩm tươi", percent: "42%", color: "bg-emerald-600" },
  { name: "Đồ khô", percent: "28%", color: "bg-amber-500" },
  { name: "Thực phẩm bổ sung", percent: "15%", color: "bg-lime-600" },
  { name: "Khác", percent: "15%", color: "bg-slate-300" },
];

const topProducts = [
  { name: "Trứng gà organic (12 quả)", category: "Sữa & trứng", orders: "1,240", revenue: "$14,880", icon: Egg },
  { name: "Mật ong hoa rừng 500g", category: "Đồ khô", orders: "982", revenue: "$12,766", icon: Package },
  { name: "Kale thủy canh mix", category: "Thực phẩm tươi", orders: "855", revenue: "$6,840", icon: Leaf },
  { name: "Cà phê rang vừa", category: "Đồ uống", orders: "720", revenue: "$18,000", icon: Coffee },
  { name: "Yến mạch không gluten 1kg", category: "Ngũ cốc", orders: "640", revenue: "$5,120", icon: Cookie },
];

function ReportsPage() {
  const [period, setPeriod] = useState("monthly");

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8">
          <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-black tracking-[-0.04em] text-slate-900">
                Báo cáo chiến lược
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-500">
                Phân tích hiệu suất HealthyGO, xu hướng tăng trưởng và hiệu quả
                tồn kho thông qua dữ liệu thời gian thực.
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-[#eef2eb] p-1">
              {[
                 { id: "daily", label: "Ngày" },
                 { id: "monthly", label: "Tháng" },
                 { id: "yearly", label: "Năm" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                    period === item.id
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:text-emerald-700"
                  }`}
                  onClick={() => setPeriod(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section className="rounded-xl border border-slate-200/70 bg-white p-8 xl:col-span-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                    Xu hướng doanh thu
                  </h3>
                  <p className="text-sm text-slate-500">
                    Hiệu suất doanh thu thuần trong giai đoạn đã chọn
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black tracking-[-0.03em] text-emerald-700">
                    $142,840.00
                  </span>
                  <div className="mt-1 inline-flex items-center text-xs font-bold text-lime-700">
                    <TrendingUp size={14} className="mr-1" />
                    +12.4% so với tháng trước
                  </div>
                </div>
              </div>

              <div className="relative flex h-64 items-end justify-between gap-2 px-2">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-2 opacity-20">
                  {[1, 2, 3, 4].map((line) => (
                    <div key={line} className="w-full border-b border-slate-300" />
                  ))}
                </div>

                {revenueBars.map((value, index) => (
                  <div
                    key={index}
                    className="relative h-full w-full rounded-t-lg bg-emerald-100/70"
                  >
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-emerald-600 transition-all hover:brightness-110"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7'].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200/70 bg-white p-8 xl:col-span-4">
              <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                Doanh thu theo danh mục
              </h3>
              <p className="mb-8 text-sm text-slate-500">
                Tỷ trọng doanh thu theo loại sản phẩm
              </p>

              <div className="relative mb-8 flex justify-center">
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[18px] border-emerald-600">
                  <div className="absolute inset-[-18px] rounded-full border-[18px] border-transparent border-r-lime-500 border-t-amber-500 rotate-45" />
                  <div className="text-center">
                    <span className="block text-2xl font-black tracking-[-0.03em] text-slate-900">
                      85%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Organic
                    </span>
                  </div>
                </div>
              </div>

              <ul className="space-y-3">
                {categoryData.map((item) => (
                  <li key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium text-slate-700">
                      <span className={`mr-2 h-3 w-3 rounded-full ${item.color}`} />
                      {item.name}
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {item.percent}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-200/70 bg-white p-8 xl:col-span-7">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                  Top 5 sản phẩm bán chạy nhất
                </h3>
                <button className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 transition hover:underline">
                  Xuất CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                      <th className="pb-4">Sản phẩm</th>
                      <th className="pb-4">Danh mục</th>
                      <th className="pb-4">Đơn hàng</th>
                      <th className="pb-4 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topProducts.map((product) => {
                      const Icon = product.icon;
                      return (
                        <tr key={product.name} className="transition hover:bg-[#f7faf6]">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef2eb] text-emerald-700">
                                <Icon size={18} />
                              </div>
                              <span className="text-sm font-semibold text-slate-900">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-slate-500">
                            {product.category}
                          </td>
                          <td className="py-4 text-sm font-bold text-slate-900">
                            {product.orders}
                          </td>
                          <td className="py-4 text-right text-sm font-bold text-slate-900">
                            {product.revenue}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="flex flex-col gap-6 xl:col-span-5">
              <article className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-xl bg-emerald-700 p-8 text-white">
                <div className="relative z-10">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                    Cộng đồng khách hàng
                  </span>
                  <h3 className="mb-4 text-3xl font-black tracking-[-0.04em]">
                    Tăng trưởng khách hàng
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-[-0.05em]">
                      24.8k
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-sm font-bold">
                      <TrendingUp size={14} className="mr-1" />
                      18%
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex h-24 items-end gap-1">
                  {[30, 45, 40, 60, 75, 90, 100].map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-sm bg-white/60"
                      style={{ height: `${value}%` }}
                    />
                  ))}
                </div>

                <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
              </article>

              <article className="rounded-xl border border-slate-200/70 bg-[#eef2eb] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Tỷ lệ giữ chân
                    </span>
                    <h4 className="text-2xl font-black tracking-[-0.03em] text-slate-900">
                      76.4%
                    </h4>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-100 text-lime-700">
                    <TrendingUp size={18} />
                  </div>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[76%] rounded-full bg-lime-600" />
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  +2.1% cải thiện trong quý này
                </p>
              </article>
            </section>
          </div>

          <footer className="mt-12 border-t border-slate-200 bg-slate-50 px-2 py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                © 2024 HealthyGO Organic. All rights reserved.
              </p>
              <div className="flex flex-wrap gap-6">
                {['Liên hệ', 'Vận chuyển', 'Hoàn trả', 'Chính sách bảo mật'].map((item) => (
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
    </div>
  );
}

export default ReportsPage;
