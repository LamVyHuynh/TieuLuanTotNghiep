import React, { useState, useEffect, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { CartContext } from "../../context/CartContext";
import { CheckoutContext } from "../../context/CheckoutContext";

// Import component đánh giá sản phẩm
import ProductReviews from "../../components/ProductReviews";

function DetailProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

    if (path === "/" || path === -1) {
      setSlideDirection("translate-x-12");
    } else {
      setSlideDirection("-translate-x-12");
    }

    setIsExiting(true);
    setTimeout(() => {
      if (path === -1) navigate(-1);
      else navigate(path);
    }, 400);
  };

  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);
  const { addToPayment } = useContext(CheckoutContext);

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
    const fetchProductDetail = async () => {
      setIsLoading(true);
      try {
        // 🚀 ĐÃ SỬA: Ép kiểu 'id' sang Number để đảm bảo Backend hiểu
        const numericId = Number(id);

        // Nếu ID không phải là số hợp lệ thì dừng luôn
        if (isNaN(numericId)) throw new Error("ID sản phẩm không hợp lệ");

        const res = await axiosClient.get(`/products/${numericId}`);
        const currentItem = res.data.product;
        setProduct(currentItem);

        const allRes = await axiosClient.get("/products");
        let others = allRes.data.products.filter(
          (p) => Number(p.id_product) !== numericId, // 🚀 Đổi ở đây luôn cho đồng bộ
        );

        others = others.sort(() => 0.5 - Math.random()).slice(0, 4);
        setSimilarProducts(others);
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
    window.scrollTo(0, 0);
    setQuantity(1);
  }, [id]); // Vẫn giữ nguyên [id] ở đây
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-emerald-600 bg-[#f6f8f4]">
        <RefreshCcw size={40} className="animate-spin mb-4" />
        <p className="font-bold tracking-wide">Đang nấu món ngon...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-32 text-center sm:px-6 lg:px-10 bg-[#f6f8f4] min-h-screen">
        <h2 className="text-3xl font-black tracking-[-0.03em] text-rose-500">
          Không tìm thấy sản phẩm!
        </h2>
        <button
          className="mt-6 cursor-pointer rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 shadow-lg"
          onClick={() => handleNavigate("/")}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // 🚀 LOGIC CHỐT GIÁ THỰC TẾ (Lấy giá giảm nếu có, không thì lấy giá gốc)
  const activePrice =
    product.discount_price && Number(product.discount_price) > 0
      ? Number(product.discount_price)
      : Number(product.price);

  const totalPrice = activePrice * quantity; // Tạm tính bằng giá thực tế x số lượng

  const handleIncrease = () => {
    if (quantity < (product.stock || 50)) {
      setQuantity((prev) => prev + 1);
    } else {
      showToast("Hết hàng trong kho rồi bạn ơi! 😥", "error");
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <>
      <div
        className={`bg-[#f6f8f4] pb-20 pt-8 text-slate-900 min-h-screen relative transform transition-all duration-500 ease-in-out ${
          isExiting
            ? `${slideDirection} opacity-0`
            : "translate-x-0 opacity-100"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 mt-16">
          <button
            className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            onClick={() => handleNavigate(-1)}
          >
            <ArrowLeft size={18} /> Quay lại
          </button>

          <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="relative lg:col-span-7">
              <div className="aspect-square overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
                <img
                  src={
                    product.image_url ||
                    "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=700&q=80"
                  }
                  alt={product.name}
                  className="h-full w-full rounded-[1.25rem] object-cover transition duration-500 hover:scale-[1.03]"
                />
              </div>
              <div className="absolute -right-2 -top-2 rounded-full bg-lime-200 px-5 py-3 text-sm font-bold text-lime-950 shadow-[0_16px_30px_rgba(101,163,13,0.18)] sm:-right-4 sm:-top-4">
                Best Seller 🔥
              </div>
            </div>

            <div className="space-y-7 lg:col-span-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                  <Sparkles size={14} /> Tươi ngon mỗi ngày
                </div>

                <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl leading-tight">
                  {product.name}
                </h1>

                <p className="mt-4 text-base leading-7 text-slate-500 font-medium">
                  {product.description ||
                    "Món ăn thanh đạm, giàu dinh dưỡng, phù hợp cho mọi chế độ ăn kiêng. Nguyên liệu chuẩn Organic 100%."}
                </p>

                {/* KHU VỰC HIỆN GIÁ CỦA SẢN PHẨM CHÍNH */}
                <div className="mt-5 flex flex-wrap items-end gap-3">
                  {product.discount_price &&
                  Number(product.discount_price) > 0 ? (
                    <>
                      <span className="text-4xl font-black tracking-[-0.04em] text-emerald-700 sm:text-5xl leading-none">
                        {Number(product.discount_price).toLocaleString("vi-VN")}
                        đ
                        <span className="ml-2 text-base font-medium text-slate-400 normal-case tracking-normal">
                          / {product.unit || "Phần"}
                        </span>
                      </span>
                      <span className="text-xl font-bold text-slate-400 line-through mb-1">
                        {Number(product.price).toLocaleString("vi-VN")}đ
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-black tracking-[-0.04em] text-emerald-700 sm:text-5xl leading-none">
                      {Number(product.price).toLocaleString("vi-VN")}đ
                      <span className="ml-2 text-base font-medium text-slate-400 normal-case tracking-normal">
                        / {product.unit || "Phần"}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <section className="rounded-[1.5rem] bg-[#eef3ea] p-5 shadow-inner sm:p-6 border border-lime-100">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                    Dinh dưỡng
                  </h2>
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    1 {product.unit || "Phần"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-white/70 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Calo
                    </p>
                    <p className="mt-1 text-base font-black text-emerald-700">
                      {product.calories || "--"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Đạm
                    </p>
                    <p className="mt-1 text-base font-black text-emerald-700">
                      {product.protein || "--"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Carbs
                    </p>
                    <p className="mt-1 text-base font-black text-emerald-700">
                      {product.carbs || "--"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/70 bg-white p-3 text-center shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Béo
                    </p>
                    <p className="mt-1 text-base font-black text-emerald-700">
                      {product.fat || "--"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-5 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between rounded-[1.35rem] bg-[#e4e8e1] p-4 sm:p-5">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white px-2 py-2 shadow-sm">
                    <button
                      onClick={handleDecrease}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="min-w-8 text-center text-xl font-black text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Tạm tính
                    </p>
                    <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-900">
                      {totalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    className="cursor-pointer rounded-xl px-5 py-4 text-base font-bold text-white shadow-lg transition bg-emerald-500 hover:bg-emerald-600"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const success = await addToCart(
                        product.id_product,
                        quantity,
                      );
                      if (success) {
                        showToast(
                          `Đã thêm ${quantity} ${product.unit || "phần"} ${product.name} vào giỏ! 🥰`,
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
                    Thêm vào giỏ
                  </button>

                  <button
                    onClick={(e) => {
                      const token = localStorage.getItem("auth_token");
                      if (!token) {
                        showToast(
                          "Vui lòng đăng nhập để mua hàng! 😥",
                          "error",
                        );
                        setTimeout(() => handleNavigate("/login"), 1500);
                        return;
                      }
                      e.stopPropagation();

                      addToPayment([
                        {
                          ...product,
                          price: activePrice,
                          quantity,
                        },
                      ]);

                      handleNavigate("/checkout");
                    }}
                    className="cursor-pointer rounded-xl bg-[#dfe4dc] px-5 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-[#d4dad1]"
                  >
                    Mua ngay
                  </button>
                </div>
              </section>
            </div>
          </section>

          {/* ================================================================= */}
          {/* 🚀 KHU VỰC HIỂN THỊ ĐÁNH GIÁ (TRUYỀN ID SẢN PHẨM VÀO ĐỂ FETCH DATA) */}
          {/* ================================================================= */}
          <div className="mt-16">
            <ProductReviews productId={id} />
          </div>

          <section className="mt-16 border-t border-slate-200 pt-16">
            <h2 className="mb-8 text-3xl font-black tracking-[-0.04em] text-slate-950">
              Có thể bạn sẽ thích
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((item) => (
                <article
                  key={item.id_product}
                  className="group cursor-pointer bg-white p-3 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                  onClick={() =>
                    handleNavigate(`/detail-product/${item.id_product}`)
                  }
                >
                  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-2xl bg-slate-50">
                    <img
                      src={
                        item.image_url ||
                        "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=700&q=80"
                      }
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-2">
                    <h3 className="text-lg font-black tracking-[-0.03em] text-slate-900 line-clamp-1 mb-1">
                      {item.name}
                    </h3>

                    {/* KHU VỰC HIỆN GIÁ CỦA SẢN PHẨM GỢI Ý */}
                    <div className="flex items-end gap-1.5 flex-wrap mt-1">
                      {item.discount_price &&
                      Number(item.discount_price) > 0 ? (
                        <>
                          <span className="text-emerald-700 font-black text-lg leading-none">
                            {Number(item.discount_price).toLocaleString(
                              "vi-VN",
                            )}
                            đ
                          </span>
                          <span className="text-xs text-slate-400 font-semibold line-through mb-[2px]">
                            {Number(item.price).toLocaleString("vi-VN")}đ
                          </span>
                        </>
                      ) : (
                        <span className="text-emerald-700 font-black text-lg leading-none">
                          {Number(item.price).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

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

export default DetailProduct;
