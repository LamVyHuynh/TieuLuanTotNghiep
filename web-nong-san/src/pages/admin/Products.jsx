import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  LogOut,
  MoreVertical,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Users,
} from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: ClipboardList, active: false },
  { label: "Users", icon: Users, active: false },
  { label: "Products", icon: Package, active: true },
  { label: "Stores", icon: Store, active: false },
  { label: "Orders", icon: ShoppingBag, active: false },
  { label: "Reports", icon: ClipboardList, active: false },
];

const bottomSidebarItems = [
  { label: "Settings", icon: Settings },
  { label: "Logout", icon: LogOut },
];

const stats = [
  { label: "Total SKU", value: "1,248", valueClass: "text-slate-900" },
  { label: "Out of Stock", value: "12", valueClass: "text-rose-600" },
  { label: "Avg. Performance", value: "94.2%", valueClass: "text-lime-700" },
  { label: "Categories", value: "Organic", valueClass: "text-slate-900" },
];

const products = [
  {
    name: "Organic Broccoli",
    sku: "SKU: VEG-204-BR",
    category: "Vegetables",
    categoryClass: "bg-lime-100 text-lime-700",
    stock: "85 Units",
    stockWidth: "w-3/4",
    stockBar: "bg-emerald-600",
    stockText: "text-slate-900",
    price: "$4.50",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusText: "text-emerald-700",
    image:
      "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Seasonal Fruit Box",
    sku: "SKU: CMB-102-FR",
    category: "Combo",
    categoryClass: "bg-amber-100 text-amber-700",
    stock: "12 Units",
    stockWidth: "w-1/5",
    stockBar: "bg-amber-500",
    stockText: "text-amber-700",
    price: "$29.99",
    status: "Low Stock",
    statusDot: "bg-amber-500",
    statusText: "text-amber-700",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Honeycrisp Apples",
    sku: "SKU: FRT-009-AP",
    category: "Fruits",
    categoryClass: "bg-emerald-100 text-emerald-700",
    stock: "240 Units",
    stockWidth: "w-full",
    stockBar: "bg-emerald-600",
    stockText: "text-slate-900",
    price: "$1.20/lb",
    status: "Active",
    statusDot: "bg-emerald-500",
    statusText: "text-emerald-700",
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Baby Carrots",
    sku: "SKU: VEG-301-CA",
    category: "Vegetables",
    categoryClass: "bg-slate-200 text-slate-600",
    stock: "0 Units",
    stockWidth: "w-0",
    stockBar: "bg-rose-500",
    stockText: "text-rose-600",
    price: "$2.00",
    status: "Archived",
    statusDot: "bg-slate-400",
    statusText: "text-slate-500",
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=200&q=80",
    muted: true,
  },
];

function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-900">
      <div className="lg:flex">
        <aside className="border-b border-slate-200 bg-[#f1f2ee] p-4 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="mb-8 px-2">
            <h1 className="text-xl font-black tracking-[-0.05em] text-emerald-800">
              HealthyGO Admin
            </h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Management Portal
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
                  {item.label}
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
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-screen flex-1 p-4 sm:p-6 lg:ml-64 lg:p-8">
          <header className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">
                Product Management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage your inventory, pricing, and product status.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-sm transition hover:opacity-90">
              <Plus size={18} />
              Add Product
            </button>
          </header>

          <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#eef2eb] p-4">
            <div className="flex max-w-2xl flex-1 flex-wrap items-center gap-4">
              <div className="relative min-w-[260px] flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  className="w-full rounded-lg border-none bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none ring-0 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300">
                  <Filter size={16} />
                  Category
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300">
                  <SlidersHorizontal size={16} />
                  Stock
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-300/70 pl-4">
              <span className="mr-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Bulk actions:
              </span>
              <button className="rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                Delete
              </button>
              <button className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                Edit Status
              </button>
            </div>
          </section>

          <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-xl border border-slate-200/70 bg-white p-6"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-black tracking-[-0.03em] ${stat.valueClass}`}
                >
                  {stat.value}
                </p>
              </article>
            ))}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#eef2eb]">
                    <th className="w-12 p-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
                      />
                    </th>
                    {[
                      "Image",
                      "Product Name",
                      "Category",
                      "Stock Level",
                      "Price",
                      "Status",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`p-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ${
                          index === 6 ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr
                      key={product.sku}
                      className="group transition hover:bg-[#f8fbf7]"
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-200"
                        />
                      </td>
                      <td className="p-4">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className={`h-full w-full object-cover ${
                              product.muted ? "grayscale opacity-50" : ""
                            }`}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold ${
                              product.muted
                                ? "text-slate-500"
                                : "text-slate-900"
                            }`}
                          >
                            {product.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {product.sku}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${product.categoryClass}`}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div
                          className={`flex items-center gap-2 ${product.stockText}`}
                        >
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full ${product.stockBar} ${product.stockWidth}`}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-900">
                        {product.price}
                      </td>
                      <td className="p-4">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-bold ${product.statusText}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${product.statusDot}`}
                          />
                          {product.status}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-slate-400 transition hover:text-emerald-700">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 bg-[#f7faf6] p-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Showing 1-4 of 1,248 products
              </span>

              <div className="flex items-center gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200">
                  <ChevronLeft size={18} />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white">
                  1
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                  2
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                  3
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                  312
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ProductsPage;
