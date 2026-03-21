import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Landmark,
  Lock,
  MapPin,
  SunMedium,
  Wallet,
} from "lucide-react";
import { CheckoutContext } from "../../context/CheckoutContext";

const deliverySlots = [
  {
    id: "morning",
    title: "Buoi sang",
    time: "8:00 - 12:00",
    icon: SunMedium,
    accent: "text-emerald-700",
  },
  {
    id: "afternoon",
    title: "Buoi chieu",
    time: "14:00 - 18:00",
    icon: MapPin,
    accent: "text-amber-600",
  },
];

const paymentMethods = [
  {
    id: "cod",
    label: "Thanh toan khi nhan hang (COD)",
    icon: Banknote,
  },
  {
    id: "bank",
    label: "Chuyen khoan ngan hang",
    icon: Landmark,
  },
  {
    id: "momo",
    label: "Vi dien tu MoMo",
    icon: Wallet,
  },
];

function CheckOut() {
  const navigate = useNavigate();
  const { checkoutList } = useContext(CheckoutContext);
  const [selectedTime, setSelectedTime] = useState("morning");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const product = checkoutList.length > 0 ? checkoutList[0] : null;

  const subtotal = useMemo(
    () =>
      checkoutList.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [checkoutList]
  );
  const shippingFee = checkoutList.length > 0 ? 20000 : 0;
  const discount = checkoutList.length > 0 ? 15000 : 0;
  const total = Math.max(subtotal + shippingFee - discount, 0);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (!product) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-20 text-center sm:px-6 lg:px-10">
        <div className="mx-auto mb-5 flex h-[84px] w-[84px] items-center justify-center rounded-full border-4 border-slate-200 text-4xl text-slate-400">
          :(
        </div>
        <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-900">
          Don hang chua san sang!
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-500">
          Ban chua chon san pham nao de thanh toan ca. Quay lai cua hang chon
          them nhe.
        </p>
        <button
          className="mt-7 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(5,150,105,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
          onClick={() => navigate("/")}
        >
          Ve trang chu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f4] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              Quay lai
            </button>
            <span className="hidden h-4 w-px bg-slate-300 sm:block" />
            <span className="hidden text-sm font-semibold text-slate-500 sm:block">
              Thanh toan
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
            <Lock size={16} />
            Bao mat 100%
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-8">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  1
                </div>
                <h2 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                  Thong tin giao nhan
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field
                  label="Ho va ten"
                  value={formData.fullName}
                  onChange={(value) => handleChange("fullName", value)}
                  placeholder="Nguyen Van A"
                />
                <Field
                  label="So dien thoai"
                  value={formData.phone}
                  onChange={(value) => handleChange("phone", value)}
                  placeholder="0901 234 567"
                />
                <div className="space-y-2 md:col-span-2">
                  <label className="ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Dia chi chi tiet
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(event) =>
                      handleChange("address", event.target.value)
                    }
                    placeholder="So nha, ten duong, phuong/xa, quan/huyen..."
                    rows={3}
                    className="w-full resize-none rounded-xl border-none bg-slate-100 p-3.5 text-sm text-slate-700 outline-none transition focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-8">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  2
                </div>
                <h2 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                  Chon khung gio giao hang
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {deliverySlots.map((slot) => {
                  const Icon = slot.icon;
                  const active = selectedTime === slot.id;

                  return (
                    <button
                      key={slot.id}
                      className={`rounded-xl border-2 p-4 text-left transition ${
                        active
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-transparent bg-slate-100 hover:border-emerald-200"
                      }`}
                      onClick={() => setSelectedTime(slot.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} className={slot.accent} />
                        <div>
                          <p className="font-bold text-slate-900">
                            {slot.title}
                          </p>
                          <p className="text-sm text-slate-500">{slot.time}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-8">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  3
                </div>
                <h2 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                  Phuong thuc thanh toan
                </h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const active = paymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      className={`flex w-full items-center rounded-xl border-2 p-4 text-left transition ${
                        active
                          ? "border-emerald-600 bg-emerald-50"
                          : "border-transparent bg-slate-100 hover:border-emerald-200"
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <input
                        type="radio"
                        checked={active}
                        readOnly
                        className="h-5 w-5 accent-emerald-600"
                      />
                      <div className="ml-4 flex items-center gap-3">
                        <Icon size={18} className="text-slate-500" />
                        <span className="font-medium text-slate-800">
                          {method.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="sticky top-24 lg:col-span-4">
            <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <div className="border-b border-slate-200/70 p-6">
                <h3 className="text-lg font-black tracking-[-0.03em] text-slate-900">
                  Tom tat don hang
                </h3>
              </div>

              <div className="space-y-4 p-6">
                {checkoutList.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold leading-tight text-slate-900">
                        {item.name}
                      </h4>
                      <div className="mt-1 flex items-center justify-between gap-4">
                        <p className="text-xs text-slate-500">
                          So luong: {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-emerald-700">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          d
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 bg-slate-50/80 p-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tam tinh</span>
                  <span className="font-medium text-slate-900">
                    {subtotal.toLocaleString("vi-VN")}d
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phi van chuyen</span>
                  <span className="font-medium text-slate-900">
                    {shippingFee.toLocaleString("vi-VN")}d
                  </span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Giam gia</span>
                  <span className="font-medium">
                    -{discount.toLocaleString("vi-VN")}d
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-4">
                  <span className="font-bold text-slate-900">Tong cong</span>
                  <span className="text-2xl font-black tracking-[-0.04em] text-emerald-700">
                    {total.toLocaleString("vi-VN")}d
                  </span>
                </div>
              </div>

              <div className="p-6">
                <button
                  className="w-full rounded-xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] py-4 text-lg font-bold text-white shadow-[0_18px_35px_rgba(5,150,105,0.22)] transition hover:scale-[1.02]"
                  onClick={() => alert("Thanh toan thanh cong!")}
                >
                  Xac nhan va dat hang
                </button>
                <p className="mt-4 px-4 text-center text-[10px] leading-relaxed text-slate-500">
                  Bang cach dat hang, ban dong y voi Dieu khoan dich vu va Chinh
                  sach bao mat cua HealthyGO.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-none bg-slate-100 p-3.5 text-sm text-slate-700 outline-none transition focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
      />
    </div>
  );
}

export default CheckOut;
