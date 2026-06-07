import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Package,
  Wallet,
  ArrowLeft,
  ShoppingBag, // Nhớ import thêm icon này cho đẹp
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function Order() {
  const navigate = useNavigate();
  const location = useLocation();

  // =================================================================
  // STATE TẠO HIỆU ỨNG TRƯỢT CHUYỂN TRANG THÔNG MINH
  // =================================================================
  const [isExiting, setIsExiting] = useState(true);
  const [slideDirection, setSlideDirection] = useState("-translate-x-12");

  // Lịch sử đơn hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tự động gọi API khi vừa vào trang để lấy lịch sử đơn hàng
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.warn(
            "Không tìm thấy token xác thực! Vui lòng đăng nhập để xem lịch sử đơn hàng.",
          );
          setLoading(false);
          return;
        }
        const response = await axiosClient.get("/orders/history");
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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

  // =================================================================
  // DICTIONARY MAP TRẠNG THÁI VÀ MÀU SẮC
  // =================================================================
  const statusTextMap = {
    pending: "Chờ xác nhận",
    processing: "Đang chuẩn bị",
    shipping: "Đang giao",
    completed: "Đã nhận",
    cancelled: "Đã hủy",
  };

  const statusClassMap = {
    "Chờ xác nhận": "bg-slate-100 text-slate-700 border-slate-200",
    "Đang chuẩn bị": "bg-blue-100 text-blue-700 border-blue-200",
    "Đang giao": "bg-amber-100 text-amber-700 border-amber-200",
    "Đã nhận": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Đã hủy": "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <div
      className={`mx-auto max-w-[980px] px-4 py-8 sm:px-6 lg:px-8 min-h-screen transform transition-all duration-500 ease-in-out ${
        isExiting ? `${slideDirection} opacity-0` : "translate-x-0 opacity-100"
      }`}
    >
      <button
        className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        onClick={() => handleNavigate("/")}
      >
        <ArrowLeft size={18} />
        Về trang chủ
      </button>

      <section className="mb-6 overflow-hidden rounded-[28px] border border-emerald-100/70 bg-[linear-gradient(135deg,#f2fff7_0%,#ffffff_45%,#fff8ec_100%)] px-6 py-7 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-emerald-600 uppercase">
              Lịch sử mua hàng
            </p>
            <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-900 sm:text-4xl">
              Lịch sử đơn hàng
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
            <Package size={16} />
            Tổng số đơn: {orders.length}
          </div>
        </div>
      </section>

      {/* KHU VỰC RENDER DANH SÁCH ĐƠN HÀNG */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="text-emerald-600 font-semibold animate-pulse">
              Đang tải dữ liệu...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">Bạn chưa có đơn hàng nào.</p>
            <button
              onClick={() => handleNavigate("/")}
              className="mt-4 text-emerald-600 font-bold hover:underline cursor-pointer"
            >
              Mua sắm ngay!
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const viStatus = statusTextMap[order.status] || order.status;

            return (
              <article
                key={order.id_order}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)] sm:p-6"
              >
                {/* Header Card (Mã đơn + Trạng thái) */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.13em] text-slate-400 uppercase">
                      Mã đơn
                    </p>
                    <h3 className="mt-1 text-xl font-black tracking-[-0.02em] text-slate-900">
                      #{order.id_order}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                      statusClassMap[viStatus] ||
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {viStatus}
                  </span>
                </div>

                {/* ===== CHI TIẾT MÓN ĂN TRONG ĐƠN (Thêm mới) ===== */}
                <div className="mb-5 rounded-xl bg-slate-50/50 p-4 border border-slate-100/50">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ShoppingBag size={16} className="text-emerald-500" />
                    Sản phẩm đã mua
                  </div>
                  <ul className="space-y-3">
                    {/* Duyệt mảng items bên trong mỗi order */}
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <div className="flex-1">
                            <span className="font-medium text-slate-800">
                              {item.product_name}
                            </span>
                            <span className="ml-2 text-slate-500 font-medium">
                              x{item.quantity}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-700">
                            {(
                              Number(item.price) * item.quantity
                            ).toLocaleString("vi-VN")}
                            đ
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-slate-400 italic">
                        Không tải được chi tiết sản phẩm
                      </li>
                    )}
                  </ul>
                </div>
                {/* ============================================== */}

                {/* Footer Card (Ngày đặt + Tổng tiền) */}
                <div className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
                    <CalendarDays size={16} className="text-slate-400" />
                    Ngày đặt:{" "}
                    <span className="font-semibold text-slate-700">
                      {new Date(order.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600">
                    <Wallet size={16} className="text-slate-400" />
                    Tổng thanh toán:{" "}
                    <span className="font-bold text-amber-500 text-base">
                      {Number(order.total_amount).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <button
                  className="cursor-pointer mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition-all duration-300 hover:bg-emerald-100"
                  onClick={() => handleNavigate(`/tracking/${order.id_order}`)}
                >
                  <Clock3 size={16} />
                  Xem theo dõi đơn hàng
                  <ChevronRight size={16} />
                </button>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Order;
