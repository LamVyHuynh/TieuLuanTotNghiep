import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import axiosClient from "../../api/axiosClient.js";

// --- HÀM CHẾ BIẾN DỮ LIỆU ---
// Biến role_id thành Tên và Màu sắc
const getRoleInfo = (role_id) => {
  if (role_id === 1)
    return { name: "Quản trị", color: "bg-amber-100 text-amber-700" };
  if (role_id === 2)
    return { name: "Khách hàng", color: "bg-lime-100 text-lime-700" };
  return { name: "Chưa rõ", color: "bg-slate-100 text-slate-700" };
};

// Biến is_active thành Trạng thái và Màu chấm tròn
const getStatusInfo = (is_active) => {
  if (is_active === 1) return { name: "Hoạt động", color: "bg-emerald-500" };
  return { name: "Tạm khóa", color: "bg-rose-500" };
};

// Định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return "Không xác định";
  const date = new Date(dateString);
  return `Tham gia ${date.toLocaleDateString("vi-VN")}`;
};

// Tạo Avatar ảo từ tên người dùng
const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User",
  )}&background=eef2eb&color=047857`;
};

// --- DỮ LIỆU THỐNG KÊ (Giữ nguyên tạm thời) ---
const stats = [
  {
    label: "Tổng người dùng",
    value: "...", // Có thể lấy từ API sau
    icon: Users,
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Quản trị viên",
    value: "...",
    icon: UserPlus,
    iconClass: "bg-amber-100 text-amber-700",
  },
  {
    label: "Chờ tạm khóa",
    value: "...",
    icon: Plus,
    iconClass: "bg-lime-100 text-lime-700",
  },
];

// ==========================================
// COMPONENT CHÍNH
// ==========================================
function UsersPage() {
  // LƯU Ý QUAN TRỌNG: useState và useEffect PHẢI NẰM TRONG HÀM NÀY
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Nhớ đảm bảo Backend có route "/auth/list-users" này rồi nha mạy
        const response = await axiosClient.get("/auth/list-users");

        // Thường data thực tế sẽ nằm trong response.data.data
        setUserList(response.data.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8">
      <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.04em] text-slate-900">
            Quản lý người dùng
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Xem và quản lý người dùng trong hệ thống. Theo dõi quyền, trạng thái
            tài khoản và hoạt động đăng nhập tại một nơi.
          </p>
        </div>

        <button className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01]">
          <UserPlus size={18} />
          Thêm người dùng
        </button>
      </header>

      <section className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-[#eef2eb] p-4">
        <div className="relative max-w-md flex-1 min-w-[260px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm theo tên, email hoặc vai trò..."
            className="w-full rounded-lg border-none bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none ring-0 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
            <Filter size={16} />
            Bộ lọc
          </button>
          <button className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
            <Download size={16} />
            Xuất CSV
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="bg-[#eef2eb] text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4">Tên</th>
                <th className="px-6 py-4">Địa chỉ email</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : userList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-500">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                userList.map((user, index) => {
                  // Chế biến data trước khi render
                  const role = getRoleInfo(user.role_id);
                  const status = getStatusInfo(user.is_active);

                  return (
                    <tr
                      key={user.id || user.email}
                      className={`group transition hover:bg-[#f7faf6] ${
                        index % 2 === 1 ? "bg-[#fbfcfa]" : ""
                      }`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarUrl(user.full_name)}
                            alt={user.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.full_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(user.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${role.color}`}
                        >
                          {role.name}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <span
                            className={`h-2 w-2 rounded-full ${status.color}`}
                          />
                          {status.name}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition group-hover:opacity-100">
                          <button className="cursor-pointer rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 bg-[#f7faf6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-medium text-slate-500">
            Hiển thị {userList.length > 0 ? 1 : 0} đến {userList.length} trong
            tổng số người dùng
          </span>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-slate-200 p-2 text-slate-500 opacity-50"
              disabled
            >
              <ChevronLeft size={18} />
            </button>
            <button className="cursor-pointer rounded-lg bg-emerald-700 px-3 py-1 text-sm font-bold text-white">
              1
            </button>
            <button
              className="rounded-lg bg-slate-200 p-2 text-slate-500 opacity-50"
              disabled
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl bg-[#eef2eb] p-6"
            >
              <div className={`rounded-xl p-3 ${stat.iconClass}`}>
                <Icon size={28} />
              </div>
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {stat.label}
                </p>
                <h4 className="text-2xl font-black tracking-[-0.03em] text-slate-900">
                  {stat.value}
                </h4>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default UsersPage;
