import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Trash2 } from "lucide-react";
import { CartContext } from "../../context/CartContext.jsx";
import { CheckoutContext } from "../../context/CheckoutContext.jsx";

function Cart() {
  const { cartItems, removeProductCart } = useContext(CartContext);
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
    const allIds = cartItems.map((item) => item.id);
    setSelectIdItem(allIds);
  };

  const total = cartItems
    .filter((item) => selectIdItem.includes(item.id))
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const selectedProducts = cartItems.filter((item) =>
      selectIdItem.includes(item.id)
    );

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

  return (
    <div className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 lg:px-8">
      <button
        className="cursor-pointer mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <h2 className="mb-5 text-3xl font-black tracking-[-0.03em] text-slate-900">
        Giỏ hàng của bạn
      </h2>

      <div className="mb-5 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
        <button
          className={`flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
            allSelected
              ? "border-emerald-500 bg-emerald-500 text-white"
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

      {cartItems.length === 0 ? (
        <div className="mt-10 rounded-[24px] border border-slate-100 bg-white px-6 py-12 text-center shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-300 text-3xl text-slate-400">
            :(
          </div>
          <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-900">
            Ối! Giỏ hàng đang buồn...
          </h3>
          <p className="mt-3 text-base leading-7 text-slate-500">
            Bạn chưa chọn món nào cả. Đi dạo một vòng rồi chốt đơn cho nó vui
            lên nhé!
          </p>
          <button
            className="mt-7 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(5,150,105,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
            onClick={() => navigate("/")}
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {cartItems.map((item) => {
              const selected = selectIdItem.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center"
                >
                  <button
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all ${
                      selected
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                    onClick={() => handleSelectProduct(item.id)}
                  >
                    ✓
                  </button>

                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-[92px] w-[92px] rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Số lượng: <strong>{item.quantity}</strong>
                    </p>
                    <p className="mt-1 text-base font-bold text-amber-500">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                  </div>

                  <button
                    className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-500 transition hover:bg-rose-100"
                    onClick={() => removeProductCart(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-700">
                Tổng cộng:
              </span>
              <h3 className="text-3xl font-black tracking-[-0.03em] text-emerald-600">
                {total.toLocaleString("vi-VN")}đ
              </h3>
            </div>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-base font-bold text-white shadow-[0_10px_20px_rgba(5,150,105,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
              onClick={handleCheckout}
            >
              <CreditCard size={20} />
              Thanh toán
            </button>
          </div>
        </div>
      )}

      {showError && (
        <div className="fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(225,29,72,0.35)]">
          ⚠️ Bạn chưa chọn sản phẩm nào để thanh toán kìa!
        </div>
      )}
    </div>
  );
}

export default Cart;
