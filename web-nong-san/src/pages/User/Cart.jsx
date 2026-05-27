import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { CartContext } from "../../context/CartContext.jsx";
import { CheckoutContext } from "../../context/CheckoutContext.jsx";

function Cart() {
  const { cartItems, removeProductCart, updateCartQuantity } =
    useContext(CartContext);
  const { addToPayment } = useContext(CheckoutContext);
  const navigate = useNavigate();

  const [selectIdItem, setSelectIdItem] = useState([]);
  const [showError, setShowError] = useState(false);

  // State để quản lý món nào đang chờ xóa
  const [itemToDelete, setItemToDelete] = useState(null);
  // State toast thông báo
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleSelectProduct = (id) => {
    setSelectIdItem((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
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
    [cartItems, selectIdItem],
  );

  const subtotal = selectedProducts.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // Tạm tính phí ship và giảm giá nếu có chọn món
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

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      2500,
    );
  };

  const confirmRemove = async () => {
    if (itemToDelete) {
      await removeProductCart(itemToDelete.id);
      showToast(`Đã xoá ${itemToDelete.name} khỏi giỏ!`);
      setItemToDelete(null); // Đóng modal xác nhận
    }
  };

  const allSelected =
    cartItems.length > 0 && selectIdItem.length === cartItems.length;

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-[980px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-100 bg-white px-6 py-14 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ShoppingBasket size={30} />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-slate-900">
            Giỏ hàng đang trống
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-slate-500">
            Bạn chưa chọn sản phẩm nào cả. Quay lại cửa hàng để thêm rau củ,
            trái cây hoặc combo healthy nhé.
          </p>
          <button
            className="mt-8 cursor-pointer rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-[0_18px_35px_rgba(5,150,105,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-800"
            onClick={() => navigate("/")}
          >
            Mua sắm ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f8f4] pb-20 pt-8 text-slate-900 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <button
          className="group inline-flex cursor-pointer items-center gap-2 py-2 text-sm font-bold text-emerald-700 transition hover:-translate-x-1"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={16} />
          Tiếp tục mua sắm
        </button>

        <h1 className="mb-8 text-4xl font-black tracking-[-0.05em] text-slate-950">
          Giỏ hàng của bạn
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
                Chọn tất cả ({selectIdItem.length}/{cartItems.length})
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
                      src={
                        item.img ||
                        "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=700&q=80"
                      }
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
                          {item.category || "Món ngon"} • {item.unit || "Phần"}
                        </p>
                      </div>

                      <button
                        className="cursor-pointer text-slate-400 transition hover:text-rose-500"
                        onClick={() => setItemToDelete(item)}
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
                          Đơn giá
                        </p>
                        <p className="text-lg font-black text-emerald-700">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          đ
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="sticky top-24 rounded-[1.5rem] bg-[#eef3ea] p-7 shadow-sm h-fit">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-slate-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="mt-6 space-y-4 text-sm text-slate-500">
              <div className="flex justify-between gap-4">
                <span>Tổng tiền hàng</span>
                <span className="font-semibold text-slate-900">
                  {subtotal.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between gap-4 text-lime-700">
                <span>Giảm giá ưu đãi</span>
                <span className="font-semibold">
                  -{discount.toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-300/60 pt-5">
                <span className="text-lg font-bold text-slate-900">
                  Tổng thanh toán
                </span>
                <div className="text-right">
                  <span className="block text-3xl font-black tracking-[-0.04em] text-emerald-700">
                    {finalTotal.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-slate-400">
                    (Đã bao gồm VAT)
                  </span>
                </div>
              </div>
            </div>

            {/* MODAL XÁC NHẬN XOÁ */}
            {itemToDelete && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center">
                  <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="text-rose-500" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    Xoá sản phẩm?
                  </h3>
                  <p className="text-sm text-zinc-500 mt-2 mb-6">
                    Bạn có chắc muốn xoá <b>{itemToDelete.name}</b> ra khỏi giỏ
                    không?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setItemToDelete(null)}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-100 font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={confirmRemove}
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 font-semibold text-white cursor-pointer hover:bg-rose-700"
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TOAST THÔNG BÁO KẾT QUẢ */}
            {toast.show && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-10">
                <CheckCircle2 size={20} /> {toast.message}
              </div>
            )}

            <div className="mt-8 space-y-3">
              <button
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-[0_18px_35px_rgba(5,150,105,0.20)] transition hover:opacity-95"
                onClick={handleCheckout}
              >
                Tiến hành thanh toán
                <CreditCard size={18} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={15} />
                Thanh toán an toàn 100%
              </div>
            </div>
          </aside>
        </div>

        {showError && (
          <div className="fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(225,29,72,0.35)]">
            Bạn chưa chọn sản phẩm nào để thanh toán kìa!
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
