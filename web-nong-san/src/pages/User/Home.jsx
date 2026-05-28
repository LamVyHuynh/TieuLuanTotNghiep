import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  RefreshCcw,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../context/CartContext";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState("Tất Cả");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(8);

  const { addToCart, cartItems } = useContext(CartContext);

  const totalItemsCart = cartItems
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;

  // =================================================================
  // STATE TẠO HIỆU ỨNG TRƯỢT CHUYỂN TRANG THÔNG MINH
  // =================================================================
  const [isExiting, setIsExiting] = useState(true);
  const [slideDirection, setSlideDirection] = useState("-translate-x-12");

  useEffect(() => {
    const resetAnimation = setTimeout(() => {
      setIsExiting(false);
    }, 10);
    return () => clearTimeout(resetAnimation);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    if (location.pathname === path) return;

    // Xác định hướng trượt
    if (path === "/" || path === -1) {
      setSlideDirection("translate-x-12"); // Lùi về -> Trượt sang phải
    } else {
      setSlideDirection("-translate-x-12"); // Tiến tới -> Trượt sang trái
    }

    setIsExiting(true);
    setTimeout(() => {
      if (path === -1) navigate(-1);
      else navigate(path);
    }, 400);
  };

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

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

  useEffect(() => {
    setDisplayCount(8);
  }, [activeFilter]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        setDisplayCount((prev) => prev + 4);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getMasonryHeart = (index) => {
    const heightPattern = index % 3;
    if (heightPattern === 0) return "aspect-[3/4]";
    if (heightPattern === 1) return "aspect-square";
    return "aspect-[4/3]";
  };

  return (
    <>
      <style>{`
        .category-scroll::-webkit-scrollbar { display: none; }
        .category-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .masonry-grid { column-count: 2; column-gap: 1.5rem; }
        @media (min-width: 768px) { .masonry-grid { column-count: 3; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 4; } }
        .masonry-item { break-inside: avoid; margin-bottom: 1.5rem; }
      `}</style>

      <div
        className={`transform transition-all duration-500 ease-in-out ${
          isExiting
            ? `${slideDirection} opacity-0`
            : "translate-x-0 opacity-100"
        }`}
      >
        <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 min-h-screen relative">
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
                    className="masonry-item bg-white rounded-3xl p-3 shadow-sm border border-zinc-100 hover:shadow-xl hover:border-emerald-300 transition-all duration-500 ease-out group cursor-pointer relative"
                    onClick={() =>
                      handleNavigate(`/detail-product/${item.id_product}`)
                    }
                  >
                    <div
                      className={`overflow-hidden rounded-2xl relative ${getMasonryHeart(
                        index,
                      )}`}
                    >
                      <img
                        src={
                          item.image_url ||
                          "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=700&q=80"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 text-emerald-700 uppercase z-10">
                        {categoryMap[item.id_category] || "Món Ngon"}
                      </div>
                    </div>

                    <div className="px-2 pb-1 pt-3">
                      <h4 className="font-black text-base md:text-lg mb-1.5 text-zinc-800 leading-tight line-clamp-1">
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

                        <button
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const success = await addToCart(item.id_product, 1);
                            if (success) {
                              showToast(
                                `Đã thêm ${item.name} vào giỏ! 🥰`,
                                "success",
                              );
                              setTimeout(() => {
                                handleNavigate("/cart");
                              }, 1200);
                            } else {
                              showToast(
                                "Vui lòng đăng nhập để mua hàng! 😥",
                                "error",
                              );
                              setTimeout(() => handleNavigate("/login"), 1500);
                            }
                          }}
                        >
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

          {filteredProducts.length > displayCount && !isLoading && (
            <div className="mt-16 flex flex-col items-center justify-center gap-3 text-zinc-400 pb-10">
              <RefreshCcw size={24} className="animate-spin duration-1000" />
              <span className="text-sm font-medium tracking-wide">
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
      </div>

      <button
        onClick={() => handleNavigate("/cart")}
        className="md:hidden fixed bottom-6 right-6 bg-emerald-600 text-white w-14 h-14 rounded-full shadow-[0_10px_25px_rgba(5,150,105,0.3)] flex items-center justify-center z-50 hover:bg-emerald-700 transition-colors cursor-pointer border-none"
      >
        <ShoppingBag size={22} />
        {totalItemsCart > 0 && (
          <span className="absolute top-0 right-0 bg-white text-emerald-700 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-600 box-content shadow-sm">
            {totalItemsCart}
          </span>
        )}
      </button>

      {toast.show &&
        createPortal(
          <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl border animate-in slide-in-from-bottom-5 ${
              toast.type === "success"
                ? "bg-emerald-600 border-emerald-500/50"
                : "bg-rose-500 border-rose-400/50"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} className="text-emerald-100" />
            ) : (
              <XCircle size={20} className="text-rose-100" />
            )}
            <span className="truncate max-w-[250px] sm:max-w-md">
              {toast.message}
            </span>
          </div>,
          document.body,
        )}
    </>
  );
}

export default Home;
