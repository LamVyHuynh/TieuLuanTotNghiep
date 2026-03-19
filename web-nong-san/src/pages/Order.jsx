import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Package,
  Wallet,
} from "lucide-react";

function Order() {
  const navigate = useNavigate();

  const orders = [
    { id: "HD8866", date: "10/03/2026", total: "550.000", status: "Đang giao" },
    { id: "HD8850", date: "08/03/2026", total: "320.000", status: "Đã nhận" },
  ];

  const statusClassMap = {
    "Đang giao": "bg-amber-100 text-amber-700 border-amber-200",
    "Đã nhận": "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 overflow-hidden rounded-[28px] border border-emerald-100/70 bg-[linear-gradient(135deg,#f2fff7_0%,#ffffff_45%,#fff8ec_100%)] px-6 py-7 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-emerald-600 uppercase">
              Order History
            </p>
            <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-900 sm:text-4xl">
              Lịch sử đơn hàng
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            <Package size={16} />
            Tổng đơn: {orders.length}
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)] sm:p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.13em] text-slate-400 uppercase">
                  Mã đơn
                </p>
                <h3 className="mt-1 text-xl font-black tracking-[-0.02em] text-slate-900">
                  #{order.id}
                </h3>
              </div>

              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                  statusClassMap[order.status] ||
                  "bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
                <CalendarDays size={16} className="text-slate-400" />
                Ngày đặt:{" "}
                <span className="font-semibold text-slate-700">
                  {order.date}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
                <Wallet size={16} className="text-slate-400" />
                Tổng tiền:{" "}
                <span className="font-bold text-amber-500">{order.total}đ</span>
              </div>
            </div>

            <button
              className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition-all duration-300 hover:bg-emerald-100"
              onClick={() => navigate("/tracking")}
            >
              <Clock3 size={16} />
              Xem chi tiết theo dõi
              <ChevronRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Order;
