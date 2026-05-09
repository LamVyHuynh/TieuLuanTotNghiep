import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Search,
  UserPlus,
  Users,
  Store,
  Lock,
  Edit,
  Trash2,
} from "lucide-react";
import axiosClient from "../../api/axiosClient.js";

// --- HÀM CHẾ BIẾN DỮ LIỆU ---
const getRoleInfo = (role_id) => {
  if (role_id === 1)
    return { name: "Quản trị", color: "bg-amber-100 text-amber-700" };
  if (role_id === 2)
    return { name: "Khách hàng", color: "bg-lime-100 text-lime-700" };
  if (role_id === 3)
    return { name: "Chủ cửa hàng", color: "bg-blue-100 text-blue-700" };
  return { name: "Chưa rõ", color: "bg-slate-100 text-slate-700" };
};

const getStatusInfo = (is_active) => {
  if (is_active === 1 || is_active === true)
    return { name: "Hoạt động", color: "bg-emerald-500" };
  return { name: "Tạm khóa", color: "bg-rose-500" };
};

const formatDate = (dateString) => {
  if (!dateString) return "Không xác định";
  const date = new Date(dateString);
  return `Tham gia ${date.toLocaleDateString("vi-VN")}`;
};

const getAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=eef2eb&color=047857`;
};

// ==========================================
// COMPONENT CHÍNH
// ==========================================
function UsersPage() {
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE TÌM KIẾM ---
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE PHÂN TRANG & THỐNG KÊ TỪ SERVER ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  // Tạo state để hứng stats từ Backend
  const [stats, setStats] = useState({
    admins: 0,
    customers: 0,
    storeOwners: 0,
    locked: 0,
  });

  // làm cái dropdown của từng user
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const totalDropDown = (userId) => {
    // Nếu dropdown đang mở là của user hiện tại, bấm thêm lần nữa sẽ đóng lại
    if (openDropdownId === userId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(userId); // Bấm thằng khác sẽ mở dropdown của thằng đó và đóng thằng trước
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosClient.get(
        `/auth/list-users?page=${currentPage}&limit=${usersPerPage}`,
      );

      setUserList(response.data.data || []);
      setTotalUsers(response.data.total || 0);

      // Hứng cục stats từ Backend gán vào State
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, usersPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = userList.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const maxVisiblePages = 3;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const visiblePageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePageNumbers.push(i);
  }

  // Khai báo mảng hiển thị dựa vào cục 'stats' lấy từ Backend (chuẩn 100% không bị ảnh hưởng bởi trang)
  const dynamicStats = [
    {
      label: "Tổng người dùng",
      value: totalUsers,
      icon: Users,
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Khách hàng",
      value: stats.customers,
      icon: Users,
      iconClass: "bg-lime-100 text-lime-700",
    },
    {
      label: "Chủ cửa hàng",
      value: stats.storeOwners,
      icon: Store,
      iconClass: "bg-blue-100 text-blue-700",
    },
    {
      label: "Quản trị viên",
      value: stats.admins,
      icon: UserPlus,
      iconClass: "bg-amber-100 text-amber-700",
    },
    {
      label: "Tạm ngưng",
      value: stats.locked,
      icon: Lock,
      iconClass: "bg-rose-100 text-rose-700",
    },
  ];

  // tạo ref để bắt sự kiện click ra ngoài đóng dropdown
  const tableRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Nếu menu ĐANG MỞ và cái chỗ click chuột KHÔNG NẰM TRONG cái bảng (tableRef)
      if (
        openDropdownId !== null &&
        tableRef.current &&
        !tableRef.current.contains(event.target)
      ) {
        setOpenDropdownId(null); // thì đóng dropdown lại
      }
    };

    // Gắn tai nghe vào Document để bắt tất cả click
    // dù bấm bất cứ đầu thì handleClickOutside cũng chạy kiểm tra xem có cần đóng dropdown không
    document.addEventListener("mousedown", handleClickOutside);

    // Rút tai nghe khi component unmount - nếu không rút ra nó vẫn chạy ngầm làm lag trang
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
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
                  <td colSpan="5" className="py-10 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-500">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
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
                      {/* Bỏ thẻ <td ref={tableRef}...> đi, chỉ giữ thẻ <td> bình thường */}
                      <td className="px-6 py-5 text-right">
                        {/* Thêm một cái div bọc cả nút và menu, gắn ref vào div này */}
                        <div
                          className="relative inline-block"
                          ref={openDropdownId === user.id ? tableRef : null}
                        >
                          {/* Nút 3 chấm */}
                          <button
                            onClick={() => totalDropDown(user.id)}
                            className="cursor-pointer rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Cái Menu thả xuống */}
                          {openDropdownId === user.id && (
                            <div className="absolute right-0 top-10 z-10 w-36 rounded-xl bg-white p-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                              <button
                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => {
                                  console.log("SỬA user:", user.id);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <Edit size={16} /> Chỉnh sửa
                              </button>

                              <button
                                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                                onClick={() => {
                                  console.log("XÓA user:", user.id);
                                  setOpenDropdownId(null);
                                }}
                              >
                                <Trash2 size={16} /> Xóa user
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalUsers > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-[#f7faf6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-medium text-slate-500">
              Hiển thị{" "}
              {Math.min((currentPage - 1) * usersPerPage + 1, totalUsers)} đến{" "}
              {Math.min(currentPage * usersPerPage, totalUsers)} trong tổng số{" "}
              {totalUsers} người dùng
            </span>

            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1">
                {startPage > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="cursor-pointer w-8 h-8 border border-slate-200 rounded-lg hover:bg-white text-sm"
                    >
                      1
                    </button>
                    <span className="px-1 text-slate-400">...</span>
                  </>
                )}

                {visiblePageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                      currentPage === number
                        ? "bg-emerald-700 text-white shadow-md"
                        : "border border-slate-200 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {number}
                  </button>
                ))}

                {endPage < totalPages && (
                  <>
                    <span className="px-1 text-slate-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="cursor-pointer w-8 h-8 border border-slate-200 rounded-lg hover:bg-white text-sm"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* THỐNG KÊ */}
      <section className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {dynamicStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl bg-[#eef2eb] p-5 shadow-sm"
            >
              <div className={`rounded-xl p-3 ${stat.iconClass}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  {stat.label}
                </p>
                <h4 className="text-xl font-black tracking-[-0.03em] text-slate-900">
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
