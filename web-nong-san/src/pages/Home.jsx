import React from "react";
import { ArrowRight, ChevronRight, Eye, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { products } from "../database/data.js";

const nutritionArticles = [
  {
    title: "5 loại rau củ giúp tăng cường đề kháng",
    snippet:
      "Cùng tìm hiểu những lợi ích bất ngờ từ bông cải xanh, cà rốt và các loại rau củ sạch cho bữa ăn lành mạnh.",
    image: "https://picsum.photos/500/500?random=3",
    href: "https://suckhoe.vnexpress.net/bi-kip-tang-de-khang-tu-rau-cu-456789.html",
  },
  {
    title: "Cách chọn trái cây tươi ngon mỗi ngày",
    snippet:
      "Mẹo nhỏ để kiểm tra độ chín, độ ngọt và độ tươi của trái cây khi đi chợ hoặc đặt hàng online.",
    href: "https://vinmec.com/vi/tin-tuc/thong-tin-suc-khoe/cach-chon-trai-cay-tuoi-ngon/",
  },
];

const categories = [
  { icon: "🥕", label: "Rau củ sạch" },
  { icon: "🍎", label: "Trái cây tươi" },
  { icon: "🥩", label: "Combo sơ chế" },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <section className="overflow-hidden rounded-[32px] border border-emerald-100/70 bg-[linear-gradient(135deg,#f2fff8_0%,#ffffff_38%,#fff7e8_100%)] shadow-[0_24px_50px_rgba(15,23,42,0.06)]">
        <div className="grid items-center gap-8 px-6 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              <Sparkles size={16} />
              Healthy groceries cho bữa ăn ngon mỗi ngày
            </div>
            <h1 className="max-w-xl text-3xl font-black leading-tight tracking-[-0.04em] text-slate-900 sm:text-4xl lg:text-5xl">
              Chọn nguyên liệu tươi, đặt nhanh, ăn healthy mà vẫn tiện.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              HealthyGO giúp mày mua rau củ, trái cây và combo sơ chế gọn lẹ
              hơn, giao diện dễ dùng hơn và vẫn giữ vibe sạch, tươi, đáng tin.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(5,150,105,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-700"
                onClick={() => navigate("/cart")}
              >
                Xem giỏ hàng
                <ArrowRight size={16} />
              </button>
              <button
                className="cursor-pointer rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                onClick={() => navigate("/order")}
              >
                Xem đơn đang đặt
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-black text-emerald-600">100%</p>
                <p className="mt-1 text-sm text-slate-500">
                  Nguyên liệu tươi và dễ chọn
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-black text-amber-500">24h</p>
                <p className="mt-1 text-sm text-slate-500">
                  Gợi ý món ăn mỗi ngày
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-black text-slate-800">3 bước</p>
                <p className="mt-1 text-sm text-slate-500">
                  Tìm kiếm, chọn món, đặt ngay
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[28px] bg-slate-900 p-6 text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Healthy combo
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.03em]">
                Lên thực đơn nhanh cho tuần mới.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Gợi ý nguyên liệu cân bằng cho bữa sáng, ăn clean và bữa tối
                tiện hơn.
              </p>
            </div>
            <div className="rounded-[28px] border border-amber-100 bg-white/80 p-6 shadow-[0_18px_36px_rgba(245,158,11,0.10)] backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-500">
                Fresh pick
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.03em] text-slate-900">
                Rau củ, trái cây, combo gọn sẵn cho mày.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Thiết kế lại theo vibe nông sản sạch nhưng nhìn hiện đại và có
                điểm nhấn hơn.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="space-y-6 xl:sticky xl:top-36 xl:self-start">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-900">
                Danh mục
              </h3>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                3 nhóm chính
              </span>
            </div>

            <ul className="space-y-3">
              {categories.map((category) => (
                <li
                  key={category.label}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 transition group-hover:text-emerald-600"
                  />
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Sản phẩm nổi bật
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-900 sm:text-[2rem]">
                Nông sản tươi cho căn bếp gọn đẹp hơn.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              Card sản phẩm được làm lại theo hướng sáng, sạch, thoáng và nổi
              khối hơn để nhìn premium hơn bản cũ.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.10)]"
              >
                <div className="relative overflow-hidden bg-slate-100">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-[220px] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent" />
                  <span className="absolute top-4 left-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold tracking-[0.16em] text-white uppercase shadow-sm backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-[1.45rem] font-bold leading-tight tracking-[-0.03em] text-slate-900">
                      {product.name}
                    </h3>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      Còn {product.quantity}
                    </span>
                  </div>

                  <p className="min-h-[48px] text-sm leading-6 text-slate-500">
                    {product.desc}
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[1.85rem] font-black tracking-[-0.04em] text-amber-500">
                        {product.price.toLocaleString("vi-VN")}đ
                      </p>
                      <p className="text-sm font-medium text-slate-400">
                        / {product.unit}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                      Fresh daily
                    </div>
                  </div>

                  <button
                    className="cursor-pointer mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-[0_14px_24px_rgba(5,150,105,0.18)] transition-all duration-300 hover:bg-emerald-700"
                    onClick={() => navigate(`/detail-product/${product.id}`)}
                  >
                    <Eye size={17} />
                    Chi tiết
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="space-y-5 xl:sticky xl:top-36 xl:self-start">
          <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f5fff8_0%,#ffffff_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[1.7rem] font-black tracking-[-0.04em] text-slate-900">
                Góc dinh dưỡng
              </h3>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                Cập nhật mới
              </span>
            </div>

            <div className="space-y-4">
              {nutritionArticles.map((article, index) => (
                <a
                  key={article.title}
                  href={article.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-[24px] border border-white/80 bg-white p-4 no-underline shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.08)]"
                >
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="mb-4 h-[140px] w-full rounded-[18px] object-cover"
                    />
                  ) : null}
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500">
                    Bài viết {index + 1}
                  </p>
                  <h4 className="text-lg font-bold leading-7 text-slate-900 transition-colors group-hover:text-emerald-600">
                    {article.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {article.snippet}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Home;
