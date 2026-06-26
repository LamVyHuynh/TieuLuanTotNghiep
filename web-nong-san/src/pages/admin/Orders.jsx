import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  Download,
  Search,
  Star,
  Truck,
  ShoppingBag,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin, // Icon định vị cho địa chỉ
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

const statusTabs = [
  "Tất cả",
  "Chờ xử lý",
  "Đã xác nhận",
  "Đang giao",
  "Đã giao",
  "Đã hủy",
];

const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
      return {
        text: "Chờ xử lý",
        className: "bg-rose-100 text-rose-700 border border-rose-200",
      };
    case "processing":
      return {
        text: "Đã xác nhận",
        className: "bg-blue-100 text-blue-700 border border-blue-200",
      };
    case "shipping":
      return {
        text: "Đang giao",
        className: "bg-amber-100 text-amber-700 border border-amber-200",
      };
    case "completed":
      return {
        text: "Đã giao",
        className: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      };
    case "cancelled":
      return {
        text: "Đã hủy",
        className: "bg-slate-100 text-slate-500 border border-slate-200",
      };
    default:
      return { text: status, className: "bg-gray-100 text-gray-700" };
  }
};

const getPaymentMethod = (method) => {
  if (method === "cod") return "Tiền mặt (COD)";
  if (method === "momo") return "Ví MoMo";
  if (method === "bank") return "Chuyển khoản";
  return method;
};

const insights = [
  {
    title: "Hiệu quả giao hàng",
    note: "92% giao đúng hẹn trong tuần này.",
    value: "92%",
    width: "w-[92%]",
    bar: "bg-lime-600",
    icon: Truck,
    iconWrap: "bg-lime-100 text-lime-700",
  },
  {
    title: "Giỏ hàng bị bỏ quên",
    note: "Tỷ lệ 18% - giảm 4% so với kỳ trước.",
    value: "18%",
    width: "w-[18%]",
    bar: "bg-amber-500",
    icon: ShoppingBag,
    iconWrap: "bg-amber-100 text-amber-700",
  },
  {
    title: "Đánh giá khách hàng",
    note: "Dựa trên 1.2k lượt đánh giá của khách.",
    value: "4.9",
    width: "w-full",
    bar: "bg-emerald-600",
    icon: Star,
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
];

function OrdersPage() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // =================================================================
  // 🚀 STATE QUẢN LÝ PHÂN TRANG (PAGINATION)
  // =================================================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Chốt 10 đơn trên 1 trang

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

  useEffect(() => {
    const fetchAdminOrders = async () => {
      try {
        const res = await axiosClient.get("/orders/admin/all");
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error("Lỗi tải đơn hàng admin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === "cancelled") {
      const confirm = window.confirm(
        "Bạn có chắc chắn muốn hủy đơn này? Số lượng sẽ được hoàn lại kho.",
      );
      if (!confirm) return;
    }

    setUpdatingId(orderId);
    try {
      await axiosClient.put(`/orders/admin/${orderId}/status`, {
        status: newStatus,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id_order === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      showToast("Cập nhật trạng thái thành công!", "success");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      showToast(error.response?.data?.message || "Lỗi khi cập nhật!", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Lọc đơn hàng theo Tab và Search
  const filteredOrders = orders.filter((order) => {
    const statusConfig = getStatusConfig(order.status);
    const matchesTab =
      activeTab === "Tất cả" || statusConfig.text === activeTab;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (order.id_order && order.id_order.toLowerCase().includes(searchLower)) ||
      (order.full_name && order.full_name.toLowerCase().includes(searchLower));

    return matchesTab && matchesSearch;
  });

  // 🚀 LOGIC PHÂN TRANG
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8 overflow-hidden">
      {/* 🚀 CSS THANH KÉO NGANG CHO BẢNG */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 10px; /* Làm dày thêm xíu cho dễ kéo */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>

      <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-black tracking-[-0.04em] text-slate-900">
            Quản lý đơn hàng
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Theo dõi và xử lý các đơn hàng thực phẩm organic trong hệ thống.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="cursor-pointer rounded-lg bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300">
            <span className="inline-flex items-center gap-2">
              <Download size={16} /> Xuất CSV
            </span>
          </button>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="rounded-xl bg-[#eef2eb] p-6 xl:col-span-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Bộ lọc trạng thái đơn
            </h3>
            <div className="flex flex-wrap gap-1 rounded-full bg-slate-200 p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    activeTab === tab
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                className="w-full rounded-lg border-none bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
              />
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-xl bg-emerald-700 p-6 text-white xl:col-span-4">
          <div className="relative z-10">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-lime-100">
              Tổng doanh thu hệ thống
            </p>
            <h4 className="mb-4 text-4xl font-black tracking-[-0.04em]">
              {orders
                .filter((o) => o.status !== "cancelled")
                .reduce((sum, o) => sum + Number(o.total_amount), 0)
                .toLocaleString("vi-VN")}
              đ
            </h4>
            <div className="flex items-center gap-2 text-sm font-semibold text-lime-100">
              <BarChart3 size={16} />
              <span>Chỉ tính các đơn chưa hủy</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        </article>
      </section>

      {/* BẢNG QUẢN LÝ ĐƠN HÀNG - ĐÃ FIX KHUNG CHỨA ĐỂ HIỆN THANH CUỘN */}
      <section className="mt-8 rounded-2xl bg-[#eef2eb] shadow-sm flex flex-col w-full">
        {/* 🚀 QUAN TRỌNG: Chỉ cần cái div này có overflow-x-auto là bảng sẽ có thanh cuộn ngang */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[1200px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-200/70 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                <th className="px-5 py-4 w-[100px] whitespace-nowrap">
                  Mã đơn
                </th>
                <th className="px-5 py-4 w-[180px] whitespace-nowrap">
                  Khách hàng
                </th>
                <th className="px-5 py-4 w-[220px]">Nơi giao</th>
                <th className="px-5 py-4 w-[250px]">Sản phẩm</th>
                <th className="px-5 py-4 w-[120px]">Tạm tính</th>
                <th className="px-5 py-4 w-[100px]">Giảm giá</th>
                <th className="px-5 py-4 w-[100px]">Phí Ship</th>
                <th className="px-5 py-4 w-[140px]">Tổng thanh toán</th>
                <th className="px-5 py-4 text-center w-[120px]">Trạng thái</th>
                <th className="px-5 py-4 text-right w-[140px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60">
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="py-20 text-center text-emerald-600"
                  >
                    <RefreshCcw
                      size={32}
                      className="animate-spin mx-auto mb-3"
                    />
                    <p className="font-bold">Đang tải danh sách đơn hàng...</p>
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-20 text-center text-slate-500">
                    Không tìm thấy đơn hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => {
                  const statusConf = getStatusConfig(order.status);
                  const isLocked =
                    updatingId === order.id_order ||
                    order.status === "cancelled" ||
                    order.status === "completed";

                  const subtotal = order.items
                    ? order.items.reduce(
                        (acc, item) => acc + Number(item.price) * item.quantity,
                        0,
                      )
                    : 0;
                  const shippingFee =
                    order.items && order.items.length > 0 ? 20000 : 0;
                  const discount =
                    order.items && order.items.length > 0 ? 15000 : 0;

                  return (
                    <tr
                      key={order.id_order}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-[#f8faf7]"
                      } transition hover:bg-[#f2f6f0] align-top`}
                    >
                      {/* Mã đơn */}
                      <td className="px-5 py-5 font-mono text-xs font-bold text-emerald-700">
                        #{order.id_order}
                        <div className="mt-2 text-[10px] text-slate-400 font-sans tracking-tight">
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="px-5 py-5">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs uppercase shrink-0 mt-0.5">
                            {order.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">
                              {order.full_name}
                            </p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                              {getPaymentMethod(order.payment_method)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Nơi giao */}
                      <td className="px-5 py-5">
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <MapPin
                            size={16}
                            className="shrink-0 mt-0.5 text-slate-400"
                          />
                          <span className="line-clamp-3 leading-relaxed">
                            {order.address || (
                              <span className="italic text-slate-400">
                                Không có địa chỉ
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Sản phẩm */}
                      <td className="px-5 py-5">
                        <div className="flex flex-col gap-1.5 text-sm text-slate-600">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, i) => (
                              <p
                                key={i}
                                className="line-clamp-2 text-xs font-medium leading-relaxed"
                              >
                                • {item.product_name}{" "}
                                <span className="text-slate-400 whitespace-nowrap">
                                  (x{item.quantity})
                                </span>
                              </p>
                            ))
                          ) : (
                            <span className="italic text-slate-400">
                              Không có dữ liệu
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tạm tính (Giá gốc) */}
                      <td className="px-5 py-5 text-sm font-semibold text-slate-600">
                        {subtotal.toLocaleString("vi-VN")}đ
                      </td>

                      {/* Giảm giá */}
                      <td className="px-5 py-5 text-sm font-bold text-emerald-600">
                        {discount > 0
                          ? `-${discount.toLocaleString("vi-VN")}đ`
                          : "0đ"}
                      </td>

                      {/* Phí ship */}
                      <td className="px-5 py-5 text-sm font-semibold text-slate-600">
                        +{shippingFee.toLocaleString("vi-VN")}đ
                      </td>

                      {/* Tổng thanh toán */}
                      <td className="px-5 py-5">
                        <span className="text-base font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                          {Number(order.total_amount).toLocaleString("vi-VN")}đ
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-5 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] ${statusConf.className}`}
                        >
                          {statusConf.text}
                        </span>
                      </td>

                      {/* Hành động */}
                      <td className="px-5 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {updatingId === order.id_order && (
                            <Loader2
                              size={16}
                              className="animate-spin text-emerald-600"
                            />
                          )}
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateStatus(order.id_order, e.target.value)
                            }
                            disabled={isLocked}
                            className={`rounded-lg border px-3 py-2 text-xs font-bold outline-none transition ${
                              isLocked
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70"
                                : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400 focus:border-emerald-500 cursor-pointer shadow-sm hover:shadow"
                            }`}
                          >
                            <option value="pending" className="font-semibold">
                              Chờ xử lý
                            </option>
                            <option
                              value="processing"
                              className="font-semibold"
                            >
                              Xác nhận
                            </option>
                            <option value="shipping" className="font-semibold">
                              Giao hàng
                            </option>
                            <option value="completed" className="font-semibold">
                              Đã nhận
                            </option>
                            <option value="cancelled" className="font-semibold">
                              Hủy đơn
                            </option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 🚀 ĐIỀU HƯỚNG PHÂN TRANG */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center px-6 py-4 bg-white border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition cursor-pointer"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`h-9 w-9 rounded-lg text-sm font-bold flex items-center justify-center transition cursor-pointer ${
                      currentPage === num
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition cursor-pointer"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* INSIGHTS */}
      <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-xl bg-[#eef2eb] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className={`rounded-lg p-2 ${item.iconWrap}`}>
                  <Icon size={18} />
                </div>
                <h5 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h5>
              </div>
              {item.title === "Đánh giá khách hàng" ? (
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-slate-900">
                    {item.value}
                  </span>
                  <span className="text-xs text-slate-500">/ 5.0</span>
                </div>
              ) : (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full ${item.bar} ${item.width}`} />
                </div>
              )}
              <p className="mt-2 text-xs font-medium text-slate-500">
                {item.note}
              </p>
            </article>
          );
        })}
      </section>

      {/* TOAST THÔNG BÁO */}
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

export default OrdersPage;
