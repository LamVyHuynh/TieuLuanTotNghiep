import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight } from "lucide-react";
import axiosClient from "../../api/axiosClient";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resultCode = queryParams.get("resultCode");
    const momoOrderId = queryParams.get("orderId"); // ID dính đuôi từ MoMo trả về

    const timer = setTimeout(() => {
      if (resultCode === "0") {
        setStatus("success");

        if (momoOrderId) {
          // 🚀 SỬA TẠI ĐÂY: Tách lấy phần ID đơn hàng thực sự trước khi gửi xuống local
          const realOrderId = momoOrderId.split("_")[0];

          axiosClient
            .post("/orders/momo-local-confirm", { orderId: realOrderId }) // Truyền realOrderId vào đây
            .then(() => console.log("Cập nhật DB local thành công!"))
            .catch((err) =>
              console.error("Lỗi cập nhật đơn hàng ở local:", err),
            );
        }
      } else {
        setStatus("fail");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.search]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6f8f4] p-4 text-slate-900">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100 animate-in zoom-in-95 duration-300">
        {status === "checking" && (
          <div className="py-10">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 font-bold text-slate-600">
              Đang kiểm tra kết quả giao dịch...
            </p>
          </div>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Thanh toán thành công!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
              Tuyệt vời! Đơn hàng của bạn đã được thanh toán qua ví MoMo. Hệ
              thống đang tiến hành chuẩn bị món ăn ngay cho bạn.
            </p>
          </>
        )}
        {status === "fail" && (
          <>
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-inner">
              <XCircle size={44} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Giao dịch thất bại!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 font-medium">
              Đã có lỗi xảy ra hoặc bạn đã chủ động hủy bỏ thanh toán trên cổng
              MoMo. Vui lòng thử lại sau.
            </p>
          </>
        )}
        {status !== "checking" && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/order")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3.5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              <ShoppingBag size={14} /> Xem đơn hàng
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-emerald-700 cursor-pointer"
            >
              Tiếp tục mua <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
