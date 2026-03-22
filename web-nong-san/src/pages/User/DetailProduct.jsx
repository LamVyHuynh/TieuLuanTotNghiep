import React, { useContext, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  Minus,
  Plus,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { CheckoutContext } from "../../context/CheckoutContext";
import { ProductContext } from "../../context/ProductContext";

const nutritionFacts = [
  { label: "Energy", value: "49 kcal" },
  { label: "Protein", value: "4.3g" },
  { label: "Carbs", value: "8.8g" },
  { label: "Fiber", value: "3.6g" },
  { label: "Fat", value: "0.9g" },
];

function DetailProduct() {
  const { productList } = useContext(ProductContext);
  const { addToCart } = useContext(CartContext);
  const { addToPayment } = useContext(CheckoutContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const product = productList.find((item) => item.id === Number(id));
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const similarProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return productList.filter((item) => item.id !== product.id).slice(0, 4);
  }, [product, productList]);

  if (!product) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-20 text-center sm:px-6 lg:px-10">
        <h2 className="text-3xl font-black tracking-[-0.03em] text-rose-500">
          Khong tim thay san pham!
        </h2>
        <p className="mt-3 text-slate-500">
          San pham co the da bi xoa hoac doi duong dan.
        </p>
        <button
          className="mt-6 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
          onClick={() => navigate("/")}
        >
          Ve trang chu
        </button>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  const handleIncrease = () => {
    if (quantity < product.quantity) {
      setQuantity((prev) => prev + 1);
      return;
    }

    alert("Het hang roi may oi! :(");
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);

    setTimeout(() => {
      navigate("/cart");
    }, 1000);
  };

  const handleBuyNow = () => {
    addToPayment({ ...product, quantity });
    navigate("/checkout");
  };

  return (
    <div className="bg-[#f6f8f4] pb-20 pt-8 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <button
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Quay lai
        </button>

        <nav className="mb-8 flex flex-wrap text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          <button
            className="transition hover:text-emerald-700"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <span className="mx-2">/</span>
          <span>{product.category}</span>
          <span className="mx-2">/</span>
          <span className="text-slate-500">{product.name}</span>
        </nav>

        <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="relative lg:col-span-7">
            <div className="aspect-square overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6">
              <img
                src={product.img}
                alt={product.name}
                className="h-full w-full rounded-[1.25rem] object-cover transition duration-500 hover:scale-[1.03]"
              />
            </div>

            <div className="absolute -right-2 -top-2 rounded-full bg-lime-200 px-5 py-3 text-sm font-bold text-lime-950 shadow-[0_16px_30px_rgba(101,163,13,0.18)] sm:-right-4 sm:-top-4">
              Certified Organic
            </div>
          </div>

          <div className="space-y-7 lg:col-span-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                <Sparkles size={14} />
                Chi tiet san pham
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                {product.name}
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-500">
                {product.desc} HealthyGO uu tien trinh bay ro thong tin san pham
                de user de dang quyet dinh mua hang va noi them AI tu van dinh
                duong ve sau.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-black tracking-[-0.04em] text-emerald-700 sm:text-4xl">
                  {product.price.toLocaleString("vi-VN")}d
                  <span className="ml-1 text-base font-medium text-slate-400">
                    / {product.unit}
                  </span>
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  Con hang
                </span>
              </div>
            </div>

            <section className="rounded-[1.5rem] bg-[#eef3ea] p-5 shadow-inner sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                  Nutritional facts
                </h2>
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  per 100g
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {nutritionFacts.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/70 bg-white p-4 text-center shadow-sm"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-black tracking-[-0.03em] text-emerald-700">
                      {item.value}
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-center rounded-xl border border-white/70 bg-white p-4 shadow-sm">
                  <Leaf size={28} className="text-lime-600" />
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="flex items-center justify-between rounded-[1.35rem] bg-[#e4e8e1] p-4 sm:p-5">
                <div className="inline-flex items-center gap-3 rounded-full bg-white px-2 py-2 shadow-sm">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    onClick={handleDecrease}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-8 text-center text-xl font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    onClick={handleIncrease}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Tong tam tinh
                  </p>
                  <p className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-900">
                    {totalPrice.toLocaleString("vi-VN")}d
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  className={`rounded-xl px-5 py-4 text-base font-bold text-white shadow-[0_18px_35px_rgba(5,150,105,0.18)] transition ${
                    isAdded
                      ? "bg-emerald-500"
                      : "bg-gradient-to-br from-emerald-700 to-emerald-500 hover:-translate-y-0.5"
                  }`}
                  onClick={handleAddToCart}
                >
                  {isAdded ? "Da them vao gio" : "Them vao gio"}
                </button>

                <button
                  className="rounded-xl bg-[#dfe4dc] px-5 py-4 text-base font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-[#d4dad1]"
                  onClick={handleBuyNow}
                >
                  Mua ngay
                </button>
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-200 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Origin
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Da Lat, Viet Nam
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Method
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Organic Farming (VIETGAP)
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[#eef3ea] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Storage instructions
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Bao quan lanh tu 4-6°C, tranh rua truoc khi luu tru de giu do
                  gion va nen su dung trong 5-7 ngay de dam bao chat luong tot
                  nhat.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Kho hien tai: <strong>{product.quantity}</strong> {product.unit}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-24">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950">
                San pham co the may se thich
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Section nay giu tinh than cua file HTML mau va tan dung data
                that trong project de sau nay noi API de hon.
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
              onClick={() => navigate("/")}
            >
              Ve catalog
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <article
                key={item.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/detail-product/${item.id}`)}
              >
                <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition duration-300 group-hover:bg-slate-100 group-hover:shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-4 top-4 rounded-full bg-lime-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-lime-950">
                    {item.category}
                  </span>
                </div>

                <h3 className="text-lg font-black tracking-[-0.03em] text-slate-900">
                  {item.name}
                </h3>
                <p className="mt-1 text-emerald-700 font-bold">
                  {item.price.toLocaleString("vi-VN")}d
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    / {item.unit}
                  </span>
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DetailProduct;
