import React, { useState } from "react";
import { Plus, RefreshCcw, Sparkles, ShoppingBag } from "lucide-react";

// Fake Data cho Masonry Grid
const feedItems = [
  {
    id: 1,
    type: "meal",
    category: "Món Nấu Sẵn",
    name: "Poke Bowl Cá Hồi Na-uy",
    img: "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=700&q=80",
    time: "15'",
    calories: "450 Cal",
    price: "145.000đ",
  },
  {
    id: 2,
    type: "ingredient",
    category: "Nguyên liệu",
    name: "Dầu Olive Hy Lạp Extra Virgin",
    img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=700&q=80",
    unit: "Chai 250ml",
    price: "185.000đ",
  },
  {
    id: 3,
    type: "recommendation",
    title: "Gợi ý hôm nay",
    name: "Salad Cá Hồi Dầu Olive",
    desc: "Mua combo để có đầy đủ dinh dưỡng và tiết kiệm 15%",
    price: "Thêm Combo (310.000đ)",
  },
  {
    id: 4,
    type: "meal",
    category: "Món Nấu Sẵn",
    name: "Salad Ức Gà Áp Chảo",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
    time: "10'",
    calories: "380 Cal",
    price: "95.000đ",
  },
  {
    id: 5,
    type: "ingredient",
    category: "Rau Tươi",
    name: "Lá Húng Tây (Basil)",
    img: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=700&q=80",
    unit: "Túi 50g",
    price: "15.000đ",
  },
  {
    id: 6,
    type: "meal",
    category: "Món Nấu Sẵn",
    name: "Steak Thăn Bò Úc Sốt Tiêu",
    img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=700&q=80",
    time: "20'",
    calories: "620 Cal",
    price: "210.000đ",
  },
  {
    id: 7,
    type: "ingredient",
    category: "Gia vị",
    name: "Muối Hồng Himalaya",
    img: "https://images.unsplash.com/photo-1628268909376-e8c44bb3153f?auto=format&fit=crop&w=700&q=80",
    unit: "Túi 500g",
    price: "45.000đ",
  },
  {
    id: 8,
    type: "ingredient",
    category: "Tự nhiên",
    name: "Mật Ong Hoa Nhãn",
    img: "https://images.unsplash.com/photo-1587049352847-81a56d773cac?auto=format&fit=crop&w=700&q=80",
    unit: "Chai 500ml",
    price: "220.000đ",
  },
];

function Home() {
  const [activeFilter, setActiveFilter] = useState("Tất Cả");

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

      <div className="pb-24 max-w-7xl mx-auto px-4 sm:px-6">
        {/* ===================== THANH FILTER NGANG TRÊN CÙNG ===================== */}
        <div className="flex gap-3 overflow-x-auto category-scroll pb-4 mb-6 pt-4">
          {[
            "Tất Cả",
            "Món Nấu Sẵn",
            "Rau Tươi",
            "Gia Vị & Dầu",
            "Combo Thông Minh",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeFilter === filter
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* ===================== LƯỚI SẢN PHẨM VÔ TẬN (MASONRY GRID) ===================== */}
        <div className="masonry-grid">
          {feedItems.map((item) => {
            // CARD KIỂU MÓN ĂN / NGUYÊN LIỆU THƯỜNG
            if (item.type === "meal" || item.type === "ingredient") {
              return (
                <div
                  key={item.id}
                  className="masonry-item bg-white rounded-3xl p-3 shadow-sm border border-zinc-100 hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div
                    className={`relative rounded-2xl overflow-hidden mb-4 ${item.type === "ingredient" ? "bg-zinc-50 aspect-square flex items-center justify-center" : ""}`}
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className={`${item.type === "ingredient" ? "w-3/4 object-contain mix-blend-multiply" : "w-full h-auto object-cover"}`}
                    />
                    <div
                      className={`absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 ${item.type === "meal" ? "text-emerald-700" : "text-lime-700"}`}
                    >
                      {item.category}
                    </div>
                  </div>

                  <div className="px-2 pb-1">
                    <h4 className="font-black text-base md:text-lg mb-1.5 text-zinc-800 leading-tight">
                      {item.name}
                    </h4>

                    {/* Info text phụ (Thời gian/Calo cho Meal, Khối lượng cho Ingredient) */}
                    <p className="text-zinc-500 text-xs mb-3 flex items-center gap-2">
                      {item.type === "meal" ? (
                        <>
                          <span className="font-semibold px-1.5 py-0.5 bg-slate-100 rounded-md">
                            {item.time}
                          </span>
                          <span className="font-semibold px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded-md">
                            {item.calories}
                          </span>
                        </>
                      ) : (
                        <span>{item.unit}</span>
                      )}
                    </p>

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-zinc-900 font-black text-lg">
                        {item.price}
                      </span>
                      <button className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                        <Plus size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // CARD KIỂU AI GỢI Ý (Màu xanh nổi bật nằm đan xen)
            if (item.type === "recommendation") {
              return (
                <div
                  key={item.id}
                  className="masonry-item bg-gradient-to-br from-emerald-50 to-lime-50 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-center shadow-sm"
                >
                  <div className="flex items-center gap-1.5 mb-3 text-emerald-700">
                    <Sparkles size={16} />
                    <span className="font-bold text-xs tracking-wide uppercase">
                      {item.title}
                    </span>
                  </div>
                  <h3 className="font-black text-2xl text-zinc-900 mb-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-sm text-zinc-600 mb-6 font-medium">
                    {item.desc}
                  </p>
                  <button className="bg-emerald-600 text-white w-full py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md cursor-pointer">
                    {item.price}
                  </button>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* ===================== LOADING SPINNER Ở ĐÁY VÔ TẬN ===================== */}
        <div className="mt-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <RefreshCcw size={24} className="animate-spin duration-1000" />
          <span className="text-sm font-medium tracking-wide">
            Đang tải thêm món ngon...
          </span>
        </div>
      </div>

      {/* FOOTER TỐI GIẢN THEO DESIGN.MD */}
      <footer className="bg-white py-8 border-t border-zinc-100 text-center">
        <div className="text-2xl font-black tracking-tighter text-zinc-300 mb-2">
          HealthyGO
        </div>
        <p className="text-xs font-medium text-zinc-400">
          © 2026 HealthyGO. All rights reserved.
        </p>
      </footer>

      {/* NÚT GIỎ HÀNG NỔI CHO MOBILE */}
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
