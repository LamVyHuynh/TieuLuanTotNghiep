import React, { useState, useEffect } from "react";
import { MapPin, Phone, User, Home, ShieldCheck } from "lucide-react";
import axiosClient from "../../api/axiosClient";

function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchAddresses();
  }, []);

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
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      {/* HEADER TỔNG QUAN */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <MapPin className="text-emerald-600" size={28} />
            Quản lý Địa Chỉ Giao Hàng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hiển thị toàn bộ địa chỉ mà khách hàng đã thiết lập trên hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 border border-slate-200 shadow-sm">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-bold text-slate-700">
            Tổng cộng:{" "}
            <span className="text-emerald-600">{addresses.length}</span> địa chỉ
          </span>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">
                  Khách hàng
                </th>
                <th scope="col" className="px-6 py-4 font-bold">
                  Liên hệ nhận hàng
                </th>
                <th scope="col" className="px-6 py-4 font-bold">
                  Địa chỉ chi tiết
                </th>
                <th scope="col" className="px-6 py-4 font-bold text-center">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {addresses.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
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
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    {/* Cột 1: Thông tin chủ tài khoản */}
                    <td className="px-6 py-4 align-top">
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

                    {/* Cột 2: Tên & SĐT người nhận */}
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-700">
                          <span className="text-slate-400">
                            <User size={14} />
                          </span>
                          {addr.receiver_name || (
                            <span className="italic text-slate-400">
                              Không có
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="text-slate-400">
                            <Phone size={14} />
                          </span>
                          {addr.phone || (
                            <span className="italic text-slate-400">
                              Không có
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Địa chỉ chi tiết */}
                    <td className="px-6 py-4 align-top max-w-xs">
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

                    {/* Cột 4: Mặc định hay không */}
                    <td className="px-6 py-4 align-top text-center">
                      {addr.is_default === 1 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          <ShieldCheck size={14} />
                          Mặc định
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          Thường
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AddressPage;
