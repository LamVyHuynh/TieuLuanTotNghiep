import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarDays,
  Package,
  ArrowLeft,
  ShoppingBag,
  TicketPercent,
  Truck,
  Star,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function Order() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isExiting, setIsExiting] = useState(true);
  const [slideDirection, setSlideDirection] = useState("-translate-x-12");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =================================================================
  // STATE TOAST THÔNG BÁO
  // =================================================================
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

  // =================================================================
  // 🚀 STATE QUẢN LÝ ĐÁNH GIÁ TRỰC TIẾP (OBJECT STATE DÀNH CHO NHIỀU ITEM)
  // =================================================================
  const [ratings, setRatings] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [comments, setComments] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});
  const [submittedReviews, setSubmittedReviews] = useState({}); // Lưu trạng thái đã gửi thành công

  // Hàm thay đổi giá trị cho từng item riêng biệt
  const setItemRating = (id, val) =>
    setRatings((prev) => ({ ...prev, [id]: val }));
  const setItemHover = (id, val) =>
    setHoverRatings((prev) => ({ ...prev, [id]: val }));
  const setItemComment = (id, val) =>
    setComments((prev) => ({ ...prev, [id]: val }));

  const handleSubmitReview = async (e, orderId, productId) => {
    e.preventDefault();
    const uniqueId = `${orderId}-${productId}`;
    const currentRating = ratings[uniqueId] || 5; // Mặc định 5 sao nếu chưa chọn
    const currentComment = comments[uniqueId] || "";

    if (currentRating < 1) {
      showToast("Vui lòng chọn số sao đánh giá!", "error");
      return;
    }

    setIsSubmitting((prev) => ({ ...prev, [uniqueId]: true }));
    try {
      await axiosClient.post("/reviews", {
        productId: productId,
        rating: currentRating,
        comment: currentComment,
      });

      showToast("Cảm ơn bạn đã gửi đánh giá! 🥰", "success");
      setSubmittedReviews((prev) => ({ ...prev, [uniqueId]: true }));
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      showToast(
        error.response?.data?.message || "Có lỗi xảy ra, thử lại sau nhé!",
        "error",
      );
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [uniqueId]: false }));
    }
  };

  // =================================================================
  // FETCH DỮ LIỆU
  // =================================================================
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.warn("Không tìm thấy token xác thực!");
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
      <div className="space-y-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
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
            // 🚀 BẮT ĐIỀU KIỆN ĐƠN ĐÃ HOÀN THÀNH
            const isCompleted = order.status === "completed";

            const subtotal = order.items
              ? order.items.reduce(
                  (acc, item) => acc + Number(item.price) * item.quantity,
                  0,
                )
              : 0;

            const shippingFee =
              order.items && order.items.length > 0 ? 20000 : 0;
            const discount = order.items && order.items.length > 0 ? 15000 : 0;

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

                {/* CHI TIẾT MÓN ĂN TRONG ĐƠN */}
                <div className="mb-5 rounded-xl bg-slate-50/50 p-4 border border-slate-100/50">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ShoppingBag size={16} className="text-emerald-500" />
                    Sản phẩm đã mua
                  </div>
                  <ul className="space-y-5">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => {
                        const actualProductId =
                          item.id_product || item.product_id;
                        const uniqueId = `${order.id_order}-${actualProductId}`;

                        // Lấy State của cái item đang render hiện tại
                        const currentRating = ratings[uniqueId] || 5;
                        const currentHover = hoverRatings[uniqueId] || 0;
                        const currentComment = comments[uniqueId] || "";
                        const isSubmittingThis =
                          isSubmitting[uniqueId] || false;
                        const isSubmittedThis =
                          submittedReviews[uniqueId] || false;

                        return (
                          <li
                            key={index}
                            className="flex flex-col gap-3 text-sm border-b border-slate-100/50 pb-5 last:border-0 last:pb-0"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1">
                                <span className="font-bold text-slate-800">
                                  {item.product_name}
                                </span>
                                <span className="ml-2 text-slate-500 font-medium bg-white px-2 py-0.5 rounded border border-slate-200">
                                  x{item.quantity}
                                </span>
                              </div>
                              <div className="font-black text-emerald-700">
                                {(
                                  Number(item.price) * item.quantity
                                ).toLocaleString("vi-VN")}
                                đ
                              </div>
                            </div>

                            {/* 🚀 FORM ĐÁNH GIÁ LUÔN HIỂN THỊ NẾU ĐÃ NHẬN VÀ CHƯA ĐÁNH GIÁ */}
                            {isCompleted &&
                              (isSubmittedThis ? (
                                <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                                  <CheckCircle2 size={16} /> Đã gửi đánh giá
                                </div>
                              ) : (
                                <form
                                  onSubmit={(e) =>
                                    handleSubmitReview(
                                      e,
                                      order.id_order,
                                      actualProductId,
                                    )
                                  }
                                  className="mt-2 bg-white border border-amber-200/60 rounded-xl p-4 shadow-sm relative overflow-hidden"
                                >
                                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>

                                  <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm">
                                    <MessageSquare
                                      size={16}
                                      className="text-amber-500"
                                    />
                                    Đánh giá sản phẩm này
                                  </div>

                                  {/* Cụm chọn sao */}
                                  <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() =>
                                          setItemRating(uniqueId, star)
                                        }
                                        onMouseEnter={() =>
                                          setItemHover(uniqueId, star)
                                        }
                                        onMouseLeave={() =>
                                          setItemHover(uniqueId, 0)
                                        }
                                        className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                      >
                                        <Star
                                          size={24}
                                          className={`transition-colors duration-200 ${
                                            star <=
                                            (currentHover || currentRating)
                                              ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                              : "text-slate-200"
                                          }`}
                                        />
                                      </button>
                                    ))}
                                    <span className="ml-3 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded">
                                      {currentRating === 5
                                        ? "Tuyệt vời"
                                        : currentRating === 4
                                          ? "Rất tốt"
                                          : currentRating === 3
                                            ? "Bình thường"
                                            : currentRating === 2
                                              ? "Tệ"
                                              : "Rất tệ"}
                                    </span>
                                  </div>

                                  {/* Khung nhập comment */}
                                  <textarea
                                    value={currentComment}
                                    onChange={(e) =>
                                      setItemComment(uniqueId, e.target.value)
                                    }
                                    placeholder="Hương vị món ăn thế nào? Để lại nhận xét nhé..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all min-h-[70px] resize-none"
                                  ></textarea>

                                  <div className="flex justify-end mt-3">
                                    <button
                                      type="submit"
                                      disabled={isSubmittingThis}
                                      className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      {isSubmittingThis ? (
                                        <Loader2
                                          size={14}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Send size={14} />
                                      )}
                                      Gửi đánh giá
                                    </button>
                                  </div>
                                </form>
                              ))}
                          </li>
                        );
                      })
                    ) : (
                      <li className="text-sm text-slate-400 italic">
                        Không tải được chi tiết sản phẩm
                      </li>
                    )}
                  </ul>
                </div>

                {/* BILL TÍNH TIỀN */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-600 mb-4 text-sm">
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

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>
                        Tạm tính ({order.items?.length || 0} sản phẩm)
                      </span>
                      <span className="font-medium">
                        {subtotal.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Truck size={14} /> Phí vận chuyển
                      </span>
                      <span className="font-medium">
                        {shippingFee.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span className="flex items-center gap-1.5">
                        <TicketPercent size={14} /> Giảm giá
                      </span>
                      <span className="font-bold">
                        -{discount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100">
                      <span className="font-bold text-slate-700 text-base">
                        Tổng thanh toán
                      </span>
                      <span className="font-black text-amber-500 text-2xl">
                        {Number(order.total_amount).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* TOAST THÔNG BÁO (BẮN BẰNG PORTAL RA NGOÀI CÙNG) */}
      {toast.show &&
        createPortal(
          <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-5 ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <XCircle size={20} />
            )}
            {toast.message}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default Order;
