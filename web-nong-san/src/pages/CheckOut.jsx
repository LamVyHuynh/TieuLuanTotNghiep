import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CreditCard, MapPin, Truck } from "lucide-react";
import { CheckoutContext } from "../context/CheckoutContext";

function CheckOut() {
  const navigate = useNavigate();
  const todayISO = new Date().toISOString().split("T")[0];
  const { checkoutList } = useContext(CheckoutContext);
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const timeSlots = [];
  for (let i = 8; i <= 20; i += 1) {
    timeSlots.push(`${i < 10 ? "0" + i : i}:00`);
  }

  const currentHour = new Date().getHours();
  const availableSlots = timeSlots.filter((time) => {
    const slotHour = Number.parseInt(time.split(":")[0], 10);
    return slotHour > currentHour;
  });

  const product = checkoutList.length > 0 ? checkoutList[0] : null;

  if (!product) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-20 text-center sm:px-6 lg:px-10">
        <div className="mx-auto mb-5 flex h-[84px] w-[84px] items-center justify-center rounded-full border-4 border-slate-200 text-4xl text-slate-400">
          :(
        </div>
        <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-900">
          Đơn hàng chưa sẵn sàng!
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-500">
          Bạn chưa chọn sản phẩm nào để thanh toán cả. Quay lại nông trại chọn thêm rau củ tươi nhé!
        </p>
        <button
          className="mt-7 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(5,150,105,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
          onClick={() => navigate("/")}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const total = checkoutList.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-[1220px] px-4 py-8 sm:px-6 lg:px-10">
      <button
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <h2 className="mb-6 text-[2rem] font-black tracking-[-0.03em] text-slate-900">
        Xác nhận thanh toán
      </h2>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr] xl:gap-8">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <h3 className="mb-4 inline-flex items-center gap-2 text-lg font-bold text-emerald-600">
              <MapPin size={20} />
              Địa chỉ nhận hàng
            </h3>
            <div className="space-y-3">
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
                placeholder="Họ và tên người nhận"
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
                placeholder="Số điện thoại"
              />
              <textarea
                className="h-[92px] w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
                placeholder="Địa chỉ chi tiết (Số nhà, đường...)"
              />
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <h3 className="mb-4 inline-flex items-center gap-2 text-lg font-bold text-emerald-600">
              <Truck size={20} />
              Phương thức giao hàng
            </h3>
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 px-4 py-3 text-sm font-medium text-emerald-700">
              Giao hàng tiêu chuẩn (3-5 ngày) - 20.000đ
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <h3 className="mb-4 inline-flex items-center gap-2 text-lg font-bold text-emerald-600">
              <Clock size={20} />
              Thời gian nhận hàng
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="date"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
                defaultValue={todayISO}
                min={todayISO}
                onChange={(e) => console.log("Ngày đặt hẹn:", e.target.value)}
              />
              <select
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="">-- Chọn khung giờ giao hàng --</option>
                {availableSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] sm:p-6">
            <h3 className="mb-4 inline-flex items-center gap-2 text-lg font-bold text-emerald-600">
              <CreditCard size={20} />
              Phương thức thanh toán
            </h3>

            <div className="space-y-3">
              <PaymentOption
                checked={paymentMethod === "cod"}
                label="Thanh toán khi nhận hàng (COD)"
                onClick={() => setPaymentMethod("cod")}
              />
              <PaymentOption
                checked={paymentMethod === "momo"}
                label="Ví MoMo"
                onClick={() => setPaymentMethod("momo")}
              />
              <PaymentOption
                checked={paymentMethod === "chuyenkhoan"}
                label="Chuyển khoản ngân hàng"
                onClick={() => setPaymentMethod("chuyenkhoan")}
              />
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-36 xl:self-start">
          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] sm:p-6">
            <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900">Đơn hàng của bạn</h3>

            <div className="mt-5 flex text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase">
              <span className="flex-[2]">Sản phẩm</span>
              <span className="flex-1 text-center">SL</span>
              <span className="flex-1 text-right">Giá</span>
            </div>

            <div className="my-3 h-px bg-slate-200" />

            <div className="space-y-3">
              {checkoutList.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex flex-[2] items-center gap-2.5">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-[45px] w-[45px] rounded-lg object-cover"
                    />
                    <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <span className="flex-1 text-center text-sm text-slate-500">x{item.quantity}</span>
                  <span className="flex-1 text-right text-sm font-bold text-slate-800">
                    {(item.price * item.quantity).toLocaleString()}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="my-4 h-px bg-slate-200" />

            <div className="flex items-center justify-between text-lg font-bold text-slate-900">
              <span>Tổng thanh toán</span>
              <span className="text-[1.45rem] text-amber-500">{total.toLocaleString()}đ</span>
            </div>

            <button
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-base font-bold text-white shadow-[0_10px_20px_rgba(5,150,105,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
              onClick={() => alert("Thanh toán thành công!")}
            >
              <CreditCard size={20} />
              Đặt hàng ngay
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PaymentOption({ checked, label, onClick }) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${
        checked
          ? "border-emerald-500 bg-emerald-50/60"
          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
      }`}
      onClick={onClick}
    >
      <input type="radio" checked={checked} readOnly className="h-4 w-4 cursor-pointer accent-emerald-600" />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
  );
}

export default CheckOut;
