import React, { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  CreditCard,
  Truck,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserX,
  Wallet,
  RefreshCcw,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState({
    aov: 0,
    cancelRate: 0,
    payments: [],
    vips: [],
    codCount: 0, // 🚀 Thêm vào để hứng data thật từ Backend
    momoCount: 0, // 🚀 Thêm vào để hứng data thật từ Backend
    bankCount: 0, // 🚀 Thêm vào để hứng data thật từ Backend
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axiosClient.get("/orders/admin/reports");
        if (response.data.success) {
          setReportData(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy báo cáo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  // 🚀 LOGIC ĐẾM VÀ TÍNH % ĐỘNG THEO COD, MOMO, BANK THẬT
  const codCount = Number(reportData.codCount || 0);
  const momoCount = Number(reportData.momoCount || 0);
  const bankCount = Number(reportData.bankCount || 0);

  // Tổng số đơn của 3 loại cộng lại trực tiếp
  const totalPaymentOrders = codCount + momoCount + bankCount;

  // Hàm tính % tự động dựa trên số lượng đếm được
  const getPaymentPercent = (count) => {
    if (totalPaymentOrders === 0) return 0;
    return Math.round((count / totalPaymentOrders) * 100);
  };

  // Hàm xuất file CSV
  const exportToCSV = () => {
    // Phần 1: Xuất các chỉ số tổng quan (AOV, Tỷ lệ huỷ, Phân bổ danh sách thanh toán)
    const summaryHeaders = ["Chỉ số", "Giá trị"];
    const summaryRows = [
      [
        "Giá trị ĐH Trung bình (AOV)",
        `${Math.round(reportData.aov).toLocaleString("vi-VN")} VND`,
      ],
      ["Tỷ lệ Hủy/Bom hàng", `${reportData.cancelRate}%`],
      ["Tổng số đơn hàng đã thanh toán", totalPaymentOrders],
      ["Tiền mặt (COD)", `${codCount} đơn (${getPaymentPercent(codCount)}%)`],
      [
        "Ví điện tử (MoMo)",
        `${momoCount} đơn (${getPaymentPercent(momoCount)}%)`,
      ],
      [
        "Chuyển khoản (Bank)",
        `${bankCount} đơn (${getPaymentPercent(bankCount)}%)`,
      ],
    ];

    // Tạo chuỗi CSV cho phần tổng quan
    const summaryCSV = [
      summaryHeaders.join(";"),
      ...summaryRows.map((row) => row.join(";")),
    ].join("\n");

    // Phần 2: Xuất Bảng Vàng Khách Hàng VIP
    const vipHeaders = [
      "Top",
      "Khách hàng",
      "Số đơn đã giao",
      "Tổng chi tiêu (VND)",
    ];

    let vipCSV = "";
    if (reportData.vips && reportData.vips.length > 0) {
      const vipRows = reportData.vips.map((vip, index) => {
        return [
          index + 1,
          `"${vip.full_name || "Khách ẩn danh"}"`, // Bọc ngoặc kép chống rớt chữ
          vip.total_orders,
          vip.total_spent,
        ].join(";");
      });

      vipCSV = [vipHeaders.join(";"), ...vipRows].join("\n");
    } else {
      vipCSV = "Chưa có đủ dữ liệu khách hàng VIP";
    }

    // Phần 3: Gộp cả 2 phần lại, cách nhau bằng 2 dòng trống (\n\n)
    const finalCSVString = `BÁO CÁO TỔNG QUAN\n${summaryCSV}\n\nBẢNG VÀNG KHÁCH HÀNG VIP\n${vipCSV}`;

    // Tạo file và ép trình duyệt tải xuống (với \uFEFF chống lỗi font)
    const blob = new Blob(["\uFEFF" + finalCSVString], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BaoCaoTongHop_HealthyGO_${new Date().toLocaleDateString("vi-VN")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-emerald-600">
        <RefreshCcw size={40} className="animate-spin mb-4" />
        <p className="font-bold text-lg">
          Đang phân tích dữ liệu chuyên sâu...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8">
      {/* HEADER */}
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-black tracking-[-0.04em] text-slate-900">
            Báo cáo Tổng hợp (All-time)
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Phân tích tỷ lệ hủy, giá trị đơn hàng trung bình và hành vi khách
            hàng (Real-time).
          </p>
        </div>
        {/* 🚀 Đã gắn hàm vào nút */}
        <button
          onClick={exportToCSV}
          className="flex items-center cursor-pointer gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowDownToLine size={14} /> Xuất Báo Cáo Tổng Hợp
        </button>
      </header>

      {/* DÒNG 1: 4 CHỈ SỐ KINH DOANH CỐT LÕI */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                Giá trị ĐH Trung bình (AOV)
              </p>
              <h4 className="text-2xl font-black text-slate-900">
                {Math.round(reportData.aov).toLocaleString("vi-VN")}đ
              </h4>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-600">
            <TrendingUp size={14} className="mr-1" /> Dữ liệu thực tế
          </div>
        </article>

        <article className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                Tỷ lệ Hủy/Bom hàng
              </p>
              <h4
                className={`text-2xl font-black ${reportData.cancelRate > 10 ? "text-rose-600" : "text-emerald-600"}`}
              >
                {reportData.cancelRate}%
              </h4>
            </div>
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
              <UserX size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-500">
            {reportData.cancelRate > 10 ? (
              <>
                <TrendingUp size={14} className="mr-1 text-rose-500" /> Cần chú
                ý xử lý
              </>
            ) : (
              <>
                <TrendingDown size={14} className="mr-1 text-emerald-500" />{" "}
                Đang ở mức an toàn
              </>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm opacity-80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                Tỷ lệ giữ chân khách
              </p>
              <h4 className="text-2xl font-black text-slate-900">68.5%</h4>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-400">
            Đang cập nhật thuật toán
          </div>
        </article>

        <article className="rounded-xl border border-slate-200/70 bg-white p-6 shadow-sm opacity-80">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                Phí Ship TB / Đơn
              </p>
              <h4 className="text-2xl font-black text-slate-900">22.000đ</h4>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Truck size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-slate-400">
            Đang cập nhật API GHTK
          </div>
        </article>
      </div>

      {/* DÒNG 2: THANH TOÁN & KHÁCH HÀNG VIP */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CƠ CẤU THANH TOÁN */}
        <section className="rounded-xl border border-slate-200/70 bg-white p-8">
          <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900 mb-1">
            Cơ cấu Thanh toán
          </h3>
          <p className="mb-8 text-sm text-slate-500">
            Tỷ lệ lựa chọn thanh toán trên tổng số {totalPaymentOrders} đơn hàng
            đã mua
          </p>

          <div className="space-y-4">
            {/* VÍ MOMO */}
            <div className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-pink-50 transition-all duration-500"
                style={{ width: `${getPaymentPercent(momoCount)}%` }}
              ></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-pink-100 text-pink-600 rounded-lg">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Ví điện tử (MoMo)</p>
                  <p className="text-xs font-bold text-pink-600">
                    Số lượng: {momoCount} đơn hàng
                  </p>
                </div>
              </div>
              <h4 className="text-xl font-black relative z-10 text-pink-600">
                {getPaymentPercent(momoCount)}%
              </h4>
            </div>

            {/* CHUYỂN KHOẢN NGÂN HÀNG */}
            <div className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-blue-50 transition-all duration-500"
                style={{ width: `${getPaymentPercent(bankCount)}%` }}
              ></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    Chuyển khoản (Bank)
                  </p>
                  <p className="text-xs font-bold text-blue-600">
                    Số lượng: {bankCount} đơn hàng
                  </p>
                </div>
              </div>
              <h4 className="text-xl font-black relative z-10 text-blue-600">
                {getPaymentPercent(bankCount)}%
              </h4>
            </div>

            {/* TIỀN MẶT COD */}
            <div className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-50 transition-all duration-500"
                style={{ width: `${getPaymentPercent(codCount)}%` }}
              ></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Package size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Tiền mặt (COD)</p>
                  <p className="text-xs font-bold text-emerald-600">
                    Số lượng: {codCount} đơn hàng
                  </p>
                </div>
              </div>
              <h4 className="text-xl font-black relative z-10 text-emerald-600">
                {getPaymentPercent(codCount)}%
              </h4>
            </div>
          </div>
        </section>

        {/* TOP VIP CUSTOMERS */}
        <section className="rounded-xl border border-slate-200/70 bg-white p-8">
          <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900 mb-1">
            Bảng Vàng VIP
          </h3>
          <p className="mb-6 text-sm text-slate-500">
            Top 5 khách hàng chi tiêu nhiều nhất hệ thống
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  <th className="pb-3">Khách hàng</th>
                  <th className="pb-3 text-center">Số đơn đã giao</th>
                  <th className="pb-3 text-right">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.vips.length > 0 ? (
                  reportData.vips.map((vip, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                            {vip.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {vip.full_name}
                            </p>
                            {i === 0 && (
                              <span className="text-[10px] font-bold text-amber-500">
                                🏆 KHÁCH HÀNG KIM CƯƠNG
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center text-sm font-bold text-slate-700">
                        {vip.total_orders} đơn
                      </td>
                      <td className="py-4 text-right text-sm font-black text-emerald-600">
                        {Number(vip.total_spent).toLocaleString("vi-VN")}đ
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      Chưa có đủ dữ liệu khách hàng.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ReportsPage;
