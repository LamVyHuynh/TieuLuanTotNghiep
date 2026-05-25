import React, { useState, useEffect, useMemo } from "react";
import { Plus, RefreshCcw, Sparkles, ShoppingBag } from "lucide-react";
import axiosClient from "../../api/axiosClient";

function Home() {
  const [activeFilter, setActiveFilter] = useState("Tất Cả");

  // Dữ liệu useState của sản phẩm và danh mục
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // Số lượng sản phẩm hiển thị trên màn hình
  const [displayCount, setDisplayCount] = useState(8);

  // STATE MỚI: Dùng để điều khiển cái cục xoay xoay dưới đáy
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // API lấy dữ liệu sản phẩm và danh mục từ backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          axiosClient.get("categories"),
          axiosClient.get("products"),
        ]);

        const activeCategories = (catRes.data.categories || []).filter(
          (c) => c.status === 1,
        );

        setCategories(activeCategories);
        setProducts(prodRes.data.products || []);
      } catch (error) {
        console.log("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id_category] = cat.name;
    });
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "Tất Cả") return products;
    return products.filter((p) => categoryMap[p.id_category] === activeFilter);
  }, [products, activeFilter, categoryMap]);

  // Reset về 8 món mỗi khi đổi danh mục
  useEffect(() => {
    setDisplayCount(8);
  }, [activeFilter]);

  // ========================================================
  // LOGIC CUỘN + HIỆU ỨNG TẢI (FAKE DELAY)
  // ========================================================
  useEffect(() => {
    const handleScroll = () => {
      // Nếu đang trong lúc xoay xoay, hoặc đã hiện hết sạch đồ ăn rồi thì KHÔNG làm gì cả
      if (isFetchingMore || displayCount >= filteredProducts.length) return;

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        // 1. Bật cục xoay xoay lên
        setIsFetchingMore(true);

        // 2. Chờ 0.8 giây (800ms) rồi mới bung đồ ăn ra cho đẹp
        setTimeout(() => {
          setDisplayCount((prev) => prev + 4);
          setIsFetchingMore(false); // Tắt cục xoay
        }, 800);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayCount, filteredProducts.length, isFetchingMore]);
  // Phải có 3 cái dependency này để scroll luôn lấy đúng giá trị mới nhất

  return (
    <>
      <style>{`
        /* Ẩn thanh cuộn của phần filter */
        .category-scroll::-webkit-scrollbar { display: none; }
        .category-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* CSS cho cột Masonry bất đối xứng */
        .masonry-grid {
          column-count: 2;
          column-gap: 1.5rem;
        }
        @media (min-width: 768px) { .masonry-grid { column-count: 3; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 4; } }
        
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.5rem;
        }
      `}</style>

      <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 min-h-screen">
        {/* ===================== THANH FILTER ===================== */}
        <div className="flex gap-3 overflow-x-auto category-scroll pb-4 mb-6 pt-4">
          <button
            onClick={() => setActiveFilter("Tất Cả")}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer ${
              activeFilter === "Tất Cả"
                ? "bg-zinc-900 text-white shadow-sm"
                : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
            }`}
          >
            Tất Cả
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id_category}
              onClick={() => setActiveFilter(cat.name)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeFilter === cat.name
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ===================== LOADING LÚC MỚI VÀO ===================== */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
            <RefreshCcw size={32} className="animate-spin mb-4" />
            <p className="font-bold tracking-wide">Đang dọn lên mâm...</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredProducts.slice(0, displayCount).map((item, index) => {
              const aiCard =
                index === 2 && activeFilter === "Tất Cả" ? (
                  <div
                    key="ai-recommendation"
                    className="masonry-item bg-gradient-to-br from-emerald-50 to-lime-50 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-center shadow-sm"
                  >
                    <div className="flex items-center gap-1.5 mb-3 text-emerald-700">
                      <Sparkles size={16} />
                      <span className="font-bold text-xs tracking-wide uppercase">
                        Gợi ý hôm nay
                      </span>
                    </div>
                    <h3 className="font-black text-2xl text-zinc-900 mb-2 leading-tight">
                      Combo Tiết Kiệm
                    </h3>
                    <p className="text-sm text-zinc-600 mb-6 font-medium">
                      Mua theo combo để có đầy đủ dinh dưỡng và tiết kiệm 15%
                      hóa đơn.
                    </p>
                    <button className="bg-emerald-600 text-white w-full py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md cursor-pointer">
                      Khám phá ngay
                    </button>
                  </div>
                ) : null;

              const productCard = (
                <div
                  key={item.id_product}
                  className="masonry-item bg-white rounded-3xl p-3 shadow-sm border border-zinc-100 hover:shadow-xl hover:border-emerald-300 transition-all duration-500 ease-out group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={
                        item.image_url ||
                        "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=700&q=80"
                      }
                      alt={item.name}
                      className="group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 text-emerald-700 uppercase">
                      {categoryMap[item.id_category] || "Món Ngon"}
                    </div>
                  </div>

                  <div className="px-2 pb-1">
                    <h4 className="font-black text-base md:text-lg mb-1.5 text-zinc-800 leading-tight">
                      {item.name}
                    </h4>

                    <p className="text-zinc-500 text-xs mb-3 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold px-1.5 py-0.5 bg-slate-100 rounded-md">
                        {item.unit || "Phần"}
                      </span>
                      {item.calories && (
                        <span className="font-semibold px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded-md">
                          {item.calories} Cal
                        </span>
                      )}
                    </p>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-zinc-900 font-black text-lg">
                        {Number(item.price).toLocaleString("vi-VN")}đ
                      </span>
                      <button className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              );

              return (
                <React.Fragment key={`frag-${item.id_product}`}>
                  {aiCard}
                  {productCard}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <h3 className="text-xl font-bold mb-2">Chưa có món ăn nào</h3>
            <p>Danh mục này đang trống, bạn thử chọn mục khác nhé!</p>
          </div>
        )}

        {/* ===================== CỤC LOAD DƯỚI ĐÁY MÀ MÀY KẾT ===================== */}
        {isFetchingMore && (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 text-emerald-600 pb-10">
            <RefreshCcw size={26} className="animate-spin duration-700" />
            <span className="text-sm font-semibold tracking-wide">
              Đang tải thêm món ngon...
            </span>
          </div>
        )}
      </div>

      <footer className="bg-white py-8 border-t border-zinc-100 text-center">
        <div className="text-2xl font-black tracking-tighter text-zinc-300 mb-2">
          HealthyGO
        </div>
        <p className="text-xs font-medium text-zinc-400">
          © 2026 HealthyGO. All rights reserved.
        </p>
      </footer>

      <button className="md:hidden fixed bottom-6 right-6 bg-emerald-600 text-white w-14 h-14 rounded-full shadow-[0_10px_25px_rgba(5,150,105,0.3)] flex items-center justify-center z-50 hover:bg-emerald-700 transition-colors cursor-pointer">
        <ShoppingBag size={22} />
        <span className="absolute top-0 right-0 bg-white text-emerald-700 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-600 box-content shadow-sm">
          2
        </span>
      </button>
    </>
  );
}

export default Home;
