import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Phone,
  User,
  Home,
  ShieldCheck,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // State Form Edit
  const [formData, setFormData] = useState({
    receiver_name: "",
    phone: "",
    address: "",
    is_default: 0,
  });

  // =================================================================
  // TOAST THÔNG BÁO (THAY THẾ ALERT PHÈN)
  // =================================================================
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success", // "success" hoặc "error"
  });
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  const fetchAddresses = async () => {
    try {
      const response = await axiosClient.get(
        "/addresses/admin/users-addresses",
      );
      setAddresses(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách địa chỉ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Mở popup Xóa
  const openDeleteModal = (addr) => {
    setSelectedAddress(addr);
    setIsDeleteModalOpen(true);
  };

  // Xác nhận Xóa
  const handleDelete = async () => {
    try {
      await axiosClient.delete(
        `/addresses/admin/${selectedAddress.id_address}`,
      );
      setIsDeleteModalOpen(false);
      fetchAddresses(); // Load lại data
      showToast("Đã xóa địa chỉ thành công!");
    } catch (error) {
      showToast("Lỗi khi xoá địa chỉ: " + error.message, "error");
    }
  };

  // Mở popup Sửa
  const openEditModal = (addr) => {
    setSelectedAddress(addr);
    setFormData({
      receiver_name: addr.receiver_name || "",
      phone: addr.phone || "",
      address: addr.address || "",
      is_default: addr.is_default || 0,
    });
    setIsEditModalOpen(true);
  };

  // Xác nhận Sửa
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(
        `/addresses/admin/${selectedAddress.id_address}`,
        formData,
      );
      setIsEditModalOpen(false);
      fetchAddresses(); // Load lại data
      showToast("Cập nhật địa chỉ thành công!");
    } catch (error) {
      showToast("Lỗi cập nhật địa chỉ: " + error.message, "error");
    }
  };

  // Hàm xuất dữ liệu ra CSV
  const exportToCSV = () => {
    if (addresses.length === 0) {
      showToast("Không có dữ liệu để xuất CSV", "error");
      return;
    }

    const headers = [
      "ID",
      "Tên khách hàng",
      "Người nhận",
      "Số điện thoại",
      "Địa chỉ chi tiết",
      "Mặc định",
    ];
    const csvRows = addresses.map((addr) =>
      [
        addr.id_address,
        addr.user_name,
        addr.receiver_name || "",
        addr.phone || "",
        addr.address || "",
        addr.is_default === 1 ? "Mặc định" : "Thường",
      ].join(";"),
    );

    const csvString = [headers.join(";"), ...csvRows].join("\n");

    const blob = new Blob([`\uFEFF${csvString}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `DanhSachDiaChi_HealthyGO_${new Date().toLocaleDateString("vi-VN")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Đã xuất danh sách địa chỉ!");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
          <p className="font-semibold text-slate-500">
            Đang tải dữ liệu địa chỉ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 relative">
      {/* HEADER TỔNG QUAN */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <MapPin className="text-emerald-600" size={28} /> Quản lý Địa Chỉ
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hiển thị toàn bộ địa chỉ khách hàng đã thiết lập
          </p>
        </div>

        {/* 🚀 Cụm nút bấm */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-300"
          >
            <Download size={16} /> Xuất CSV
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 border border-slate-200 shadow-sm">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-slate-700">
              {addresses.length} địa chỉ
            </span>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Khách hàng</th>
                <th className="px-6 py-4 font-bold">Liên hệ nhận hàng</th>
                <th className="px-6 py-4 font-bold">Địa chỉ chi tiết</th>
                <th className="px-6 py-4 font-bold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {addresses.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <Home className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-base font-semibold">
                      Chưa có địa chỉ nào trên hệ thống
                    </p>
                  </td>
                </tr>
              ) : (
                addresses.map((addr) => (
                  <tr
                    key={addr.id_address}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {addr.user_name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {addr.user_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-700">
                          <User size={14} className="text-slate-400" />
                          {addr.receiver_name || (
                            <span className="italic text-slate-400">Trống</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone size={14} className="text-slate-400" />
                          {addr.phone || (
                            <span className="italic text-slate-400">Trống</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={16}
                          className="text-slate-400 shrink-0 mt-0.5"
                        />
                        <p className="line-clamp-2 text-slate-700 font-medium">
                          {addr.address}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {addr.is_default === 1 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <ShieldCheck size={14} /> Mặc định
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          Thường
                        </span>
                      )}
                    </td>

                    {/* CỘT THAO TÁC */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(addr)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(addr)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Xoá"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL SỬA ĐỊA CHỈ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-bold text-lg text-zinc-800">
                Sửa thông tin địa chỉ
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 transition"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Tên người nhận
                </label>
                <input
                  type="text"
                  value={formData.receiver_name}
                  onChange={(e) =>
                    setFormData({ ...formData, receiver_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  Địa chỉ chi tiết
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                ></textarea>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default === 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_default: e.target.checked ? 1 : 0,
                    })
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label
                  htmlFor="is_default"
                  className="text-sm font-medium text-zinc-700 cursor-pointer"
                >
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition cursor-pointer"
                >
                  <Save size={16} /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÓA ĐỊA CHỈ (Chuẩn Style Giỏ Hàng) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="text-rose-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Xoá địa chỉ?</h3>
            <p className="text-sm text-zinc-500 mt-2 mb-6">
              Bạn có chắc muốn xoá địa chỉ của{" "}
              <b>{selectedAddress?.user_name}</b> khỏi hệ thống không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 font-semibold text-white cursor-pointer hover:bg-rose-700 transition-colors"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO */}
      {toast.show && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 rounded-full px-6 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-10 ${
            toast.type === "error" ? "bg-rose-500" : "bg-emerald-600"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AddressPage;
