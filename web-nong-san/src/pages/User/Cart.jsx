import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { CartContext } from "../../context/CartContext.jsx";
import { CheckoutContext } from "../../context/CheckoutContext.jsx";

const recommendations = [
  {
    id: "rec-1",
    name: "Banh mi nguyen cam",
    desc: "It calo, giau chat xo",
    price: "55.000d",
    badge: "Ban chay",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "rec-2",
    name: "Granola hat va trai cay",
    desc: "Mon an vat tot cho suc khoe",
    price: "120.000d",
    image:
      "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "rec-3",
    name: "Sua hat dieu lanh",
    desc: "Nguyen chat khong duong",
    price: "65.000d",
    badge: "Moi",
    image:
      "https://images.unsplash.com/photo-1553531889-56cc480ac5cb?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "rec-4",
    name: "Khay trai cay nhiet doi",
    desc: "Tuoi moi moi ngay",
    price: "95.000d",
    image:
      "https://images.unsplash.com/photo-1467453678174-768ec283a940?auto=format&fit=crop&w=700&q=80",
  },
];

function Cart() {
  const { cartItems, removeProductCart, updateCartQuantity } =
    useContext(CartContext);
  const { addToPayment } = useContext(CheckoutContext);
  const navigate = useNavigate();

  const [selectIdItem, setSelectIdItem] = useState([]);
  const [showError, setShowError] = useState(false);

  const handleSelectProduct = (id) => {
    setSelectIdItem((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectIdItem.length === cartItems.length) {
      setSelectIdItem([]);
      return;
    }

    setSelectIdItem(cartItems.map((item) => item.id));
  };

  const selectedProducts = useMemo(
    () => cartItems.filter((item) => selectIdItem.includes(item.id)),
    [cartItems, selectIdItem]
  );

  const subtotal = selectedProducts.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discount = selectedProducts.length > 0 ? 15000 : 0;
  const shippingFee = selectedProducts.length > 0 ? 20000 : 0;
  const finalTotal = Math.max(subtotal - discount + shippingFee, 0);

  const handleCheckout = () => {
    if (selectedProducts.length === 0) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    addToPayment(selectedProducts);
    navigate("/checkout");
  };

  const allSelected =
    cartItems.length > 0 && selectIdItem.length === cartItems.length;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-[980px] px-4 py-16 sm:px-6 lg:px-8">
        <button
          className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Quay lai
        </button>

        <div className="rounded-[2rem] border border-slate-100 bg-white px-6 py-14 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ShoppingBasket size={30} />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-slate-900">
            Gio hang dang trong
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-500">
            Ban chua chon san pham nao ca. Quay lai cua hang de them rau cu,
            trai cay hoac combo healthy nhe.
          </p>
          <button
            className="mt-8 cursor-pointer rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-[0_18px_35px_rgba(5,150,105,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-800"
            onClick={() => navigate("/")}
          >
            Mua sam ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f8f4] pb-20 pt-8 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <button
          className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Quay lai
        </button>

        <h1 className="mb-8 text-4xl font-black tracking-[-0.05em] text-slate-950">
          Gio hang cua ban
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <div className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <button
                className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border transition ${
                  allSelected
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white text-transparent"
                }`}
                onClick={handleSelectAll}
              >
                ✓
              </button>
              <span>
                Chon tat ca ({selectIdItem.length}/{cartItems.length})
              </span>
            </div>

            {cartItems.map((item) => {
              const selected = selectIdItem.includes(item.id);

              return (
                <article
                  key={item.id}
                  className="group flex flex-col gap-5 rounded-[1.5rem] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:bg-[#f0f4ee] sm:flex-row sm:items-center sm:p-6"
                >
                  <button
                    className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition ${
                      selected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                    onClick={() => handleSelectProduct(item.id)}
                  >
                    ✓
                  </button>

                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-32">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.category} • {item.unit}
                        </p>
                      </div>

                      <button
                        className="cursor-pointer text-slate-400 transition hover:text-rose-500"
                        onClick={() => removeProductCart(item.id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="inline-flex items-center rounded-full border border-slate-200 bg-[#eef3ea] px-3 py-1.5">
                        <button
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-emerald-700 transition hover:bg-emerald-100"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-4 min-w-5 text-center font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-emerald-700 transition hover:bg-emerald-100"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Don gia
                        </p>
                        <p className="text-lg font-black text-emerald-700">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          d
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            <button
              className="group inline-flex cursor-pointer items-center gap-2 py-2 text-sm font-bold text-emerald-700 transition hover:-translate-x-1"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} />
              Tiep tuc mua sam
            </button>
          </section>

          <aside className="sticky top-24 rounded-[1.5rem] bg-[#eef3ea] p-7 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-900">
              Tom tat don hang
            </h2>

            <div className="mt-6 space-y-4 text-sm text-slate-500">
              <div className="flex justify-between gap-4">
                <span>Tong tien hang</span>
                <span className="font-semibold text-slate-900">
                  {subtotal.toLocaleString("vi-VN")}d
                </span>
              </div>
              <div className="flex justify-between gap-4 text-lime-700">
                <span>Giam gia uu dai</span>
                <span className="font-semibold">
                  -{discount.toLocaleString("vi-VN")}d
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Phi van chuyen</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee.toLocaleString("vi-VN")}d
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-300/60 pt-5">
                <span className="text-lg font-bold text-slate-900">
                  Tong thanh toan
                </span>
                <div className="text-right">
                  <span className="block text-3xl font-black tracking-[-0.04em] text-emerald-700">
                    {finalTotal.toLocaleString("vi-VN")}d
                  </span>
                  <span className="text-xs text-slate-400">
                    (Da bao gom VAT)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-[0_18px_35px_rgba(5,150,105,0.20)] transition hover:opacity-95"
                onClick={handleCheckout}
              >
                Tien hanh thanh toan
                <CreditCard size={18} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} />
                Thanh toan an toan 100%
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-lime-700">
                Goi y rieng cho ban
              </span>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
                Co the ban cung thich
              </h2>
            </div>

            <button className="hidden cursor-pointer items-center gap-2 text-sm font-bold text-emerald-700 md:inline-flex">
              Xem tat ca
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {recommendations.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.25rem] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.08)]"
              >
                <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  {item.badge ? (
                    <span className="absolute left-2 top-2 rounded-full bg-lime-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-lime-950">
                      {item.badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-lg font-bold tracking-[-0.03em] text-slate-900">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-emerald-700">
                    {item.price}
                  </span>
                  <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-emerald-700 text-white transition hover:bg-emerald-800">
                    <ShoppingBasket size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {showError && (
          <div className="fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(225,29,72,0.35)]">
            Ban chua chon san pham nao de thanh toan kia!
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
