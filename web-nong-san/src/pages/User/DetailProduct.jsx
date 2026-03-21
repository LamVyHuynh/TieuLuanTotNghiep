import React, { useContext, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBasket } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { CheckoutContext } from "../../context/CheckoutContext";
import { ProductContext } from "../../context/ProductContext";

function DetailProduct() {
  const { productList } = useContext(ProductContext);
  const { addToCart } = useContext(CartContext);
  const { addToPayment } = useContext(CheckoutContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const product = productList.find((item) => item.id === Number(id));
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 text-center sm:px-6 lg:px-10">
        <h2 className="text-3xl font-black tracking-[-0.03em] text-rose-500">
          Không tìm thấy sản phẩm!
        </h2>
        <p className="mt-3 text-slate-500">
          Sản phẩm có thể đã bị xóa hoặc đổi đường dẫn.
        </p>
        <button
          className="mt-6 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          onClick={() => navigate("/")}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  const handleIncrease = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
      return;
    }
    alert("Hết hàng rồi mạy ơi! :(");
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-10">
      <button
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <div className="overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#fcfefc_45%,#f5fbf8_100%)] shadow-[0_26px_55px_rgba(15,23,42,0.08)]">
        <div className="grid gap-7 p-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-9 lg:p-8 xl:p-10">
          <div>
            <div className="relative overflow-hidden rounded-[22px] bg-slate-100">
              <img
                src={product.img}
                alt={product.name}
                className="h-[280px] w-full object-cover sm:h-[380px]"
              />
              <span className="absolute left-4 top-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold tracking-[0.14em] text-white uppercase backdrop-blur-sm">
                {product.category}
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-bold tracking-[0.18em] text-emerald-600 uppercase">
              Chi tiết sản phẩm
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.03em] text-slate-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-500">
              {product.desc}
            </p>

            <div className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-black tracking-[-0.04em] text-amber-500">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
              <span className="pb-1 text-base font-medium text-slate-400">
                / {product.unit}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/55 px-4 py-3">
              <p className="text-sm text-slate-600">
                Kho còn:{" "}
                <span className="font-bold text-slate-900">
                  {product.quantity}
                </span>{" "}
                {product.unit}
              </p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                Fresh daily
              </span>
            </div>

            <div className="my-6 h-px bg-slate-200" />

            <div className="mb-6 grid gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                >
                  <Minus size={16} />
                </button>
                <span className="min-w-12 text-center text-lg font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                  onClick={handleIncrease}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-left sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Tổng cộng
                </p>
                <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-900">
                  {totalPrice.toLocaleString("vi-VN")} VNĐ
                </p>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <button
                className={`flex-1 rounded-2xl border-2 px-5 py-3.5 text-base font-bold transition-all duration-300 ${
                  isAdded
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-emerald-500 bg-white text-emerald-600 hover:bg-emerald-50"
                }`}
                onClick={() => {
                  addToCart(product, quantity);
                  setIsAdded(true);
                  setTimeout(() => {
                    navigate("/cart");
                  }, 1000);
                }}
              >
                {isAdded ? (
                  "✓ Đã thêm"
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    <ShoppingBasket size={19} />
                    Thêm vào giỏ
                  </span>
                )}
              </button>

              <button
                className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3.5 text-base font-bold text-white shadow-[0_10px_20px_rgba(5,150,105,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
                onClick={() => {
                  const productWithQty = { ...product, quantity };
                  addToPayment(productWithQty);
                  navigate("/checkout");
                }}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;
