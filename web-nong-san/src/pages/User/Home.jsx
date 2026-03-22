import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Leaf,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { products } from "../../database/data.js";

const heroImage =
  "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=1600&q=80";

const categoryCards = [
  {
    title: "Rau củ tươi",
    description:
      "Nguồn vitamin dồi dào từ các loại rau lá xanh và củ quả được chọn mới mỗi ngày.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80",
    button: "Khám phá ngay",
  },
  {
    title: "Trái cây mùa vụ",
    description:
      "Tuyển chọn trái cây chín tự nhiên, dễ ăn, dễ lên bữa ăn healthy mỗi ngày.",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80",
    button: "Xem bộ sưu tập",
  },
  {
    title: "Combo sức khỏe",
    description:
      "Combo gợi ý cho bữa sáng, eat clean và meal prep nhanh gọn hơn.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    button: "Mua theo combo",
  },
];

const recommendationTabs = ["Giảm cân", "Tăng cơ", "Thải độc"];

const recommendationProducts = [
  {
    id: 1,
    title: "Salad cầu vồng",
    description:
      "Kết hợp rau củ hữu cơ nhiều chất xơ, phù hợp bữa trưa nhẹ và dễ tiêu hóa.",
    price: "85.000d",
    badges: ["120 Cal", "Fiber+"],
    highlight: "Đề xuất",
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 2,
    title: "Smoothie xanh",
    description:
      "Cần tây, táo và gừng tươi cho bữa phụ thanh mát và giảm ngấy nhanh hơn.",
    price: "45.000d",
    badges: ["Vit C++", "Detox"],
    image:
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    title: "Táo premium",
    description:
      "Trái cây giòn ngọt tự nhiên, hợp cho bữa phụ và chế độ ăn kiêng.",
    price: "120.000d",
    badges: ["High Fiber"],
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 4,
    title: "Yến mạch ngũ cốc",
    description:
      "Bữa sáng nhanh gọn, giàu năng lượng và dễ phối hợp với sữa chua trái cây.",
    price: "95.000d",
    badges: ["Protein 12g"],
    image:
      "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=700&q=80",
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Chứng nhận organic",
    description:
      "Nguồn hàng ưu tiên chất lượng sạch, rõ nguồn gốc và được kiểm tra định kỳ.",
  },
  {
    icon: Leaf,
    title: "Từ nông trại đến bàn ăn",
    description:
      "Sản phẩm được đóng gói nhanh, giữ độ tươi và dễ chọn cho bữa ăn gia đình.",
  },
  {
    icon: Truck,
    title: "Giao hàng nhanh",
    description:
      "Flow đặt hàng hướng đến tính tiện lợi, phù hợp với người bận rộn và sinh viên.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả danh mục");
  const [selectedTab, setSelectedTab] = useState(recommendationTabs[0]);

  const featuredProducts = useMemo(() => {
    return products.slice(0, 4);
  }, []);

  const handleFilter = () => {
    console.log("Lọc sản phẩm:", { keyword, selectedCategory });
  };

  return (
    <div className="bg-[#f6f8f4] text-slate-900">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Nông trại hữu cơ"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,56,24,0.92)_0%,rgba(18,97,44,0.82)_38%,rgba(61,154,87,0.54)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_30%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl items-center px-4 pb-28 pt-16 sm:px-6 lg:px-10">
          <div className="max-w-3xl py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md">
              <Sparkles size={14} />
              100% sống khỏe mỗi ngày
            </div>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              Sống khoẻ
              <span className="block text-[#b7ff8d]"> tươi sạch mỗi ngày</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 sm:text-lg md:text-xl">
              HealthyGO kết hợp mua sắm thực phẩm sạch, gợi ý bữa ăn và trải
              nghiệm đặt hàng hiện đại cho người bận rộn muốn ăn ngon và ăn lành
              mạnh hơn mỗi ngày.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-emerald-800 shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:bg-emerald-50"
                onClick={() => navigate("/cart")}
              >
                Mua sắm ngay
                <ArrowRight size={18} />
              </button>
              <button
                className="cursor-pointer rounded-2xl border border-white/35 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition hover:bg-white/16"
                onClick={() => navigate("/order")}
              >
                Xem câu chuyện
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-10">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.03em] text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] border border-slate-200/70 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Bạn muốn tìm thực phẩm gì cho hôm nay?"
                className="h-14 w-full rounded-2xl border border-transparent bg-slate-100 pl-13 pr-5 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="cursor-pointer h-14 min-w-[210px] rounded-2xl border border-transparent bg-slate-100 px-5 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              >
                <option>Tất cả danh mục</option>
                <option>Rau củ</option>
                <option>Trái cây</option>
                <option>Combo</option>
              </select>

              <button
                className="inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-[0_20px_40px_rgba(5,150,105,0.24)] transition hover:bg-emerald-800"
                onClick={handleFilter}
              >
                <Search size={18} />
                Lọc
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
              Bộ sưu tập
            </span>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
              Khám phá danh mục
            </h2>
          </div>

          <button
            className="cursor-pointer inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
            onClick={() => navigate("/cart")}
          >
            Tất cả sản phẩm
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {categoryCards.map((category) => (
            <article
              key={category.title}
              className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-200 shadow-[0_20px_45px_rgba(15,23,42,0.10)]"
            >
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="text-3xl font-black tracking-[-0.04em] text-white">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  {category.description}
                </p>
                <button className="mt-6 cursor-pointer rounded-xl border border-white/25 bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-900">
                  {category.button}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#eef2e8] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-700">
              <Sparkles size={14} />
              Gợi ý thông minh
            </div>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
              Gợi ý riêng cho bạn
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Hướng AI tư vấn của HealthyGO: dựa trên nhu cầu dinh dưỡng và mục
              tiêu sức khỏe để đề xuất những lựa chọn hợp lý hơn cho bữa ăn hằng
              ngày.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {recommendationTabs.map((tab) => (
                <button
                  key={tab}
                  className={`cursor-pointer rounded-full px-6 py-3 text-sm font-bold transition ${
                    selectedTab === tab
                      ? "bg-emerald-700 text-white shadow-[0_16px_30px_rgba(5,150,105,0.18)]"
                      : "border border-slate-200 bg-white text-slate-500 hover:text-emerald-700"
                  }`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {recommendationProducts.map((item) => (
              <article
                key={item.id}
                className="group rounded-[2.25rem] border border-transparent bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-2 hover:border-emerald-300"
              >
                <div className="relative mb-6 aspect-square overflow-hidden rounded-[1.75rem] bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  {item.highlight ? (
                    <span className="absolute left-4 top-4 rounded-full bg-lime-200 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-lime-900">
                      {item.highlight}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.badges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-900 transition group-hover:text-emerald-700">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-2xl font-black tracking-[-0.04em] text-emerald-700">
                    {item.price}
                  </span>
                  <button className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-[0_12px_24px_rgba(5,150,105,0.22)] transition hover:scale-105">
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10">
        <div className="mb-12 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-4xl">
              Sản phẩm tiêu biểu
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Khu vực này được rebuild theo hướng premium hơn: card rộng, ảnh
              lớn, nhãn trạng thái và nút thao tác rõ ràng để sau này dễ nối API
              thật.
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
              <ChevronLeft size={18} />
            </button>
            <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <article
              key={product.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/detail-product/${product.id}`)}
            >
              <div className="relative mb-5 aspect-[1/1.18] overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-7 shadow-sm transition duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_rgba(15,23,42,0.10)]">
                <img
                  src={product.img}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                {index === 0 ? (
                  <span className="absolute left-5 top-5 rounded-full bg-rose-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg">
                    Giảm 15%
                  </span>
                ) : null}

                {index === 1 ? (
                  <span className="absolute left-5 top-5 rounded-full bg-lime-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-lg">
                    Mới về
                  </span>
                ) : null}

                <button
                  className="absolute bottom-6 left-6 right-6 translate-y-20 cursor-pointer rounded-xl bg-emerald-700/95 py-3 text-sm font-bold text-white opacity-0 shadow-[0_18px_35px_rgba(5,150,105,0.22)] transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/detail-product/${product.id}`);
                  }}
                >
                  Xem nhanh
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900 transition group-hover:text-emerald-700">
                    {product.name}
                  </h3>
                  <span className="pt-1 text-xs font-medium text-slate-400">
                    {product.unit}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                    {product.category}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Tươi mới
                  </span>
                </div>

                <div className="flex items-end gap-2 pt-1">
                  <span className="text-2xl font-black tracking-[-0.04em] text-slate-900">
                    {product.price.toLocaleString("vi-VN")}d
                  </span>
                  {index === 0 ? (
                    <span className="pb-0.5 text-sm text-slate-400 line-through">
                      42.000d
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#f2f4ef]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-10">
          <div>
            <div className="text-3xl font-black tracking-[-0.06em] text-emerald-700">
              HealthyGO
            </div>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
              Nền tảng thương mại điện tử hướng đến bữa ăn lành mạnh, kết hợp
              mua sắm thực phẩm sạch, đặt món và hướng AI tư vấn dinh dưỡng
              trong tương lai.
            </p>

            <div className="mt-6 flex gap-3">
              <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-slate-200 text-slate-600 transition hover:bg-emerald-700 hover:text-white">
                <Leaf size={18} />
              </button>
              <button className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-slate-200 text-slate-600 transition hover:bg-emerald-700 hover:text-white">
                <CircleUserRound size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-900">
                Hỗ trợ khách hàng
              </h4>
              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <p>Contact</p>
                <p>Shipping</p>
                <p>Returns</p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-900">
                Chính sách
              </h4>
              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200 px-4 py-6 text-xs uppercase tracking-[0.22em] text-slate-400 sm:px-6 md:flex-row lg:px-10">
          <p>© 2026 HealthyGO. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <ShieldCheck size={16} />
            <Truck size={16} />
          </div>
        </div>
      </footer>

      <button
        className="fixed bottom-6 right-6 z-40 flex h-15 w-15 cursor-pointer items-center justify-center rounded-full bg-emerald-700 text-white shadow-[0_24px_50px_rgba(5,150,105,0.35)] transition hover:scale-105 md:hidden"
        onClick={() => navigate("/cart")}
      >
        <ShoppingBag size={24} />
      </button>
    </div>
  );
}

export default Home;
