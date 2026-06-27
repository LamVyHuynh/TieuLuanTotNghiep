import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Loader2, Frown, ArrowLeft } from "lucide-react"; // 🚀 Import thêm ArrowLeft
import axiosClient from "../../api/axiosClient";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axiosClient.get(`/products`);
        const allProducts = res.data.products || [];
        const filtered = allProducts.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        );

        setProducts(filtered);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[70vh]">
      {/* 🚀 NÚT QUAY LẠI TRANG CHỦ MỚI THÊM VÀO ĐÂY NÈ */}
      <button
        onClick={() => navigate("/")} // Bấm phát dắt về thẳng trang chủ
        className="flex items-center gap-2 text-zinc-500 hover:text-emerald-600 font-semibold mb-6 transition-colors w-fit cursor-pointer"
      >
        <ArrowLeft size={20} />
        Quay lại trang chủ
      </button>

      <h2 className="text-2xl font-black text-zinc-800 mb-6 flex items-center gap-2">
        <Search className="text-emerald-600" />
        Kết quả tìm kiếm cho:{" "}
        <span className="text-emerald-600">"{query}"</span>
      </h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div
              key={product.id_product}
              onClick={() => navigate(`/detail-product/${product.id_product}`)}
              className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 cursor-pointer hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group"
            >
              <div className="overflow-hidden rounded-2xl mb-3 aspect-square">
                <img
                  src={product.image_url || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-bold text-sm line-clamp-2 text-zinc-800 group-hover:text-emerald-700 transition-colors">
                {product.name}
              </h3>

              <div className="mt-2 flex items-end gap-1.5 flex-wrap">
                {product.discount_price &&
                Number(product.discount_price) > 0 ? (
                  <>
                    <span className="text-emerald-600 font-black text-base">
                      {Number(product.discount_price).toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold line-through mb-[2px]">
                      {Number(product.price).toLocaleString("vi-VN")}đ
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-600 font-black text-base">
                    {Number(product.price).toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-zinc-100 shadow-sm">
          <Frown size={60} className="mx-auto text-zinc-300 mb-4" />
          <h3 className="text-xl font-bold text-zinc-700">
            Khum tìm thấy món nào mạy ơi!
          </h3>
          <p className="text-zinc-500 mt-2">
            Thử gõ từ khóa khác xem sao (Ví dụ: Salad, Cơm gạo lứt...)
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
