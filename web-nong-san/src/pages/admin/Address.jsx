import React, { useState, useEffect } from "react";
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
  AlertTriangle,
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
      alert("Xóa thành công!");
    } catch (error) {
      alert("Lỗi khi xoá địa chỉ!" + error.message);
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
      alert("Cập nhật thành công!");
    } catch (error) {
      alert("Lỗi cập nhật địa chỉ!", error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <MapPin className="text-emerald-600" size={28} /> Quản lý Địa Chỉ
            Giao Hàng
          </h1>
        </div>
      </div>

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
                    Chưa có địa chỉ nào
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
                          {addr.receiver_name || "Trống"}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone size={14} className="text-slate-400" />
                          {addr.phone || "Trống"}
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
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(addr)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
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

      {/* MODAL SỬA */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                Sửa thông tin địa chỉ
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Tên người nhận
                </label>
                <input
                  type="text"
                  value={formData.receiver_name}
                  onChange={(e) =>
                    setFormData({ ...formData, receiver_name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Địa chỉ chi tiết
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-2">
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
                  className="text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  <Save size={16} /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÓA */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">
              Xác nhận xoá?
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Bạn có chắc chắn muốn xoá địa chỉ này khỏi hệ thống? Hành động này
              không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Xoá ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressPage;
