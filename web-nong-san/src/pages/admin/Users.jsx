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
  Lock,
  Edit,
  Trash2,
  Unlock,
  X,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Eraser,
  Save,
  Shield,
  Key,
} from "lucide-react";
import axiosClient from "../../api/axiosClient.js";

// --- HÀM CHẾ BIẾN DỮ LIỆU ---
const getRoleInfo = (role_id) => {
  if (role_id === 1)
    return { name: "Quản trị", color: "bg-amber-100 text-amber-700" };
  if (role_id === 2)
    return { name: "Khách hàng", color: "bg-lime-100 text-lime-700" };

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
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User",
  )}&background=eef2eb&color=047857`;
};

// ==========================================
// COMPONENT CHÍNH
// ==========================================
function UsersPage() {
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  const [stats, setStats] = useState({
    admins: 0,
    customers: 0,
    storeOwners: 0,
    locked: 0,
  });

  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- STATE CHO MODAL XÁC NHẬN XOÁ ---
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    userId: null,
    isDeleting: false,
  });

  // --- STATE CHO THÔNG BÁO Ở GIỮA ---
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const toastTimerRef = useRef(null);

  // --- HÀM THÔNG BÁO XỊN XÒ CHÍNH GIỮA ---
  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2500);
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast((prev) => ({ ...prev, show: false }));
  };

  const totalDropDown = (userId) => {
    if (openDropdownId === userId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(userId);
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
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- LOGIC KHOÁ/MỞ KHOÁ ---
  const handleToggleLockStatus = async (user) => {
    setOpenDropdownId(null);
    const isLocking = user.is_active === 1 || user.is_active === true;
    try {
      await axiosClient.post(`/auth/users/${user.id}/toggle-status`);
      showToast(
        "success",
        isLocking
          ? "Đã khoá tài khoản thành công! 🥰"
          : "Đã mở khoá tài khoản! 🥰",
      );
      fetchUsers();
    } catch (error) {
      showToast("error", "Lỗi khi thay đổi trạng thái người dùng! 😥");
      console.error("Lỗi khi thay đổi trạng thái người dùng:", error);
    }
  };

  // --- LOGIC XOÁ USER (Dùng modal xác nhận) ---
  const openDeleteConfirm = (id) => {
    setOpenDropdownId(null);
    setDeleteConfirm({ show: true, userId: id, isDeleting: false });
  };

  const executeDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      await axiosClient.delete(
        `/auth/users/${deleteConfirm.userId}/delete-user`,
      );
      showToast("success", "Người dùng đã bị xoá vĩnh viễn! 🥰");
      fetchUsers();
    } catch (error) {
      showToast("error", "Lỗi khi xoá người dùng! 😥");
      console.error("Lỗi khi xoá người dùng:", error);
    } finally {
      setDeleteConfirm({ show: false, userId: null, isDeleting: false });
    }
  };

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

  const tableRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openDropdownId !== null &&
        tableRef.current &&
        !tableRef.current.contains(event.target)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  // ========================================================
  // FORM THÊM USER
  // ========================================================
  const [isAddUserFormOpen, setIsAddUserFormOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  const [addFormData, setAddFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleAddChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  const handleClearForm = () => {
    setAddFormData({ full_name: "", email: "", phone: "", password: "" });
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await axiosClient.post("/auth/register", addFormData);
      setIsAddUserFormOpen(false);
      handleClearForm();
      showToast("success", "Thêm người dùng mới thành công! 🥰");
      fetchUsers();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Lỗi hệ thống khi thêm người dùng 😥",
      );
    } finally {
      setIsAdding(false);
    }
  };

  // ========================================================
  // FORM SỬA USER
  // ========================================================
  const [isEditUserFormOpen, setIsEditUserFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editFormData, setEditFormData] = useState({
    id: "",
    full_name: "",
    email: "",
    phone: "",
    role_id: 2,
  });

  const openEditModal = (user) => {
    setEditFormData({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role_id: user.role_id,
    });
    setIsEditUserFormOpen(true);
    setOpenDropdownId(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setIsEditing(true);

    try {
      await axiosClient.put(
        `/auth/users/${editFormData.id}/update-user`,
        editFormData,
      );
      setIsEditUserFormOpen(false);
      showToast("success", "Cập nhật thông tin thành công! 🥰");
      fetchUsers();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi hệ thống khi cập nhật 😥",
      );
    } finally {
      setIsEditing(false);
    }
  };

  // ========================================================
  // FORM ĐỔI MẬT KHẨU
  // ========================================================
  const [isChangePwdFormOpen, setIsChangePwdFormOpen] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);

  const [changePwdData, setChangePwdData] = useState({
    id: "",
    new_password: "",
  });

  const openChangePwdModal = (user) => {
    setChangePwdData({ id: user.id, new_password: "" });
    setShowChangePwd(false);
    setIsChangePwdFormOpen(true);
    setOpenDropdownId(null);
  };

  const handleChangePwdSubmit = async (e) => {
    e.preventDefault();
    setIsChangingPwd(true);

    try {
      await axiosClient.put(`/auth/users/${changePwdData.id}/change-password`, {
        new_password: changePwdData.new_password,
      });

      setIsChangePwdFormOpen(false);
      showToast("success", "Đổi mật khẩu thành công! 🥰");
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi hệ thống khi đổi mật khẩu 😥",
      );
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8 relative bg-slate-50/50 overflow-hidden">
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

        <button
          onClick={() => setIsAddUserFormOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01]"
        >
          <UserPlus size={18} />
          Thêm người dùng
        </button>
      </header>

      {/* ================= MODAL THÊM USER ================= */}
      {isAddUserFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                Thêm người dùng mới
              </h3>
              <button
                onClick={() => setIsAddUserFormOpen(false)}
                className="cursor-pointer rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form
                id="addUserForm"
                onSubmit={handleAddUserSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="full_name"
                      type="text"
                      required
                      value={addFormData.full_name}
                      onChange={handleAddChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      value={addFormData.email}
                      onChange={handleAddChange}
                      placeholder="admin@healthygo.vn"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="phone"
                      type="text"
                      required
                      value={addFormData.phone}
                      onChange={handleAddChange}
                      placeholder="0901234567"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="password"
                      required
                      type={showAddPassword ? "text" : "password"}
                      value={addFormData.password}
                      onChange={handleAddChange}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAddPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center gap-3 bg-slate-50/50 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClearForm}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 active:scale-[0.98]"
              >
                <Eraser size={16} /> Xóa thông tin
              </button>

              <button
                type="submit"
                form="addUserForm"
                disabled={isAdding}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] ${
                  isAdding
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700"
                }`}
              >
                {isAdding ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus size={16} /> Xác nhận thêm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL SỬA USER ================= */}
      {isEditUserFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                Chỉnh sửa thông tin
              </h3>
              <button
                onClick={() => setIsEditUserFormOpen(false)}
                className="cursor-pointer rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form
                id="editUserForm"
                onSubmit={handleEditUserSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="full_name"
                      type="text"
                      required
                      value={editFormData.full_name}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="email"
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="phone"
                      type="text"
                      required
                      value={editFormData.phone}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Phân quyền (Vai trò)
                  </label>
                  <div className="relative">
                    <Shield
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      name="role_id"
                      value={editFormData.role_id}
                      onChange={handleEditChange}
                      className="w-full appearance-none cursor-pointer rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    >
                      <option value={1}>Quản trị viên</option>
                      <option value={2}>Khách hàng</option>
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50/50 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditUserFormOpen(false)}
                className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                form="editUserForm"
                disabled={isEditing}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] ${
                  isEditing
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
                }`}
              >
                {isEditing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save size={16} /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ĐỔI MẬT KHẨU ================= */}
      {isChangePwdFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                Cấp lại mật khẩu
              </h3>
              <button
                onClick={() => setIsChangePwdFormOpen(false)}
                className="cursor-pointer rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <form
                id="changePwdForm"
                onSubmit={handleChangePwdSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Key
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="new_password"
                      required
                      type={showChangePwd ? "text" : "password"}
                      value={changePwdData.new_password}
                      onChange={(e) =>
                        setChangePwdData({
                          ...changePwdData,
                          new_password: e.target.value,
                        })
                      }
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowChangePwd(!showChangePwd)}
                      className="absolute cursor-pointer right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showChangePwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    * Mật khẩu phải chứa ít nhất 8 ký tự.
                  </p>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50/50 px-6 py-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsChangePwdFormOpen(false)}
                className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                form="changePwdForm"
                disabled={isChangingPwd}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] ${
                  isChangingPwd
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700"
                }`}
              >
                {isChangingPwd ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save size={16} /> Lưu mật khẩu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PHẦN TÌM KIẾM VÀ BỘ LỌC --- */}
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
            <Filter size={16} /> Bộ lọc
          </button>
          <button className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
            <Download size={16} /> Xuất CSV
          </button>
        </div>
      </section>

      {/* --- BẢNG NGƯỜI DÙNG --- */}
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
                          {/* Nếu đang hoạt động thì cho nháy nháy màu xanh, bị khoá thì chấm đỏ đứng im */}
                          {user.is_active === 1 || user.is_active === true ? (
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                          ) : (
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                          )}
                          {status.name}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div
                          className="relative inline-block"
                          ref={openDropdownId === user.id ? tableRef : null}
                        >
                          <button
                            onClick={() => totalDropDown(user.id)}
                            className="cursor-pointer rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openDropdownId === user.id && (
                            <div className="absolute right-0 top-10 z-10 w-44 rounded-xl bg-white p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100">
                              <button
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                onClick={() => openEditModal(user)}
                              >
                                <Edit size={16} /> Chỉnh sửa
                              </button>

                              <button
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                                onClick={() => openChangePwdModal(user)}
                              >
                                <Key size={16} /> Đổi mật khẩu
                              </button>

                              <button
                                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                  user.is_active === 1 ||
                                  user.is_active === true
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                                onClick={() => handleToggleLockStatus(user)}
                              >
                                {user.is_active === 1 ||
                                user.is_active === true ? (
                                  <>
                                    <Lock size={16} /> Khóa tài khoản
                                  </>
                                ) : (
                                  <>
                                    <Unlock size={16} /> Mở khóa
                                  </>
                                )}
                              </button>

                              <div className="my-1 h-px w-full bg-slate-100" />

                              <button
                                className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                                onClick={() => openDeleteConfirm(user.id)}
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

        {/* --- PHÂN TRANG --- */}
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

      {/* --- THỐNG KÊ --- */}
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

      {/* ================= MODAL XÁC NHẬN XOÁ (UI MỚI CỰC XỊN) ================= */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setDeleteConfirm({ ...deleteConfirm, show: false })}
          ></div>
          <div className="relative w-full max-w-sm rounded-[2.5rem] bg-white overflow-hidden shadow-2xl border-2 border-rose-100">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-rose-50/50">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Xoá thiệt hả?
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Tài khoản này sẽ bị xoá vĩnh viễn khỏi hệ thống. Bạn chắc chưa?
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() =>
                    setDeleteConfirm({ ...deleteConfirm, show: false })
                  }
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all cursor-pointer"
                >
                  Thôi hổng xoá
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleteConfirm.isDeleting}
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-200 transition-all flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {deleteConfirm.isDeleting ? (
                    <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    "Xoá luôn!"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= KHUNG THÔNG BÁO Ở GIỮA ================= */}
      {toast.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            onClick={closeToast}
          ></div>
          <div
            className={`relative w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col bg-white border-2 ${
              toast.type === "success"
                ? "border-emerald-500"
                : "border-rose-400"
            }`}
          >
            <div
              className={`px-6 py-5 flex flex-col items-center justify-center gap-2 text-white relative ${
                toast.type === "success" ? "bg-emerald-500" : "bg-rose-400"
              }`}
            >
              <button
                onClick={closeToast}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/30 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              {toast.type === "success" ? (
                <span className="text-[60px] drop-shadow-md">🥰</span>
              ) : (
                <span className="text-[60px] drop-shadow-md">😥</span>
              )}
              <span className="font-black text-xl tracking-widest uppercase drop-shadow-sm">
                {toast.type === "success" ? "Thành công" : "Thất bại"}
              </span>
            </div>
            <div className="px-6 py-8 text-center bg-white">
              <p className="text-slate-700 font-bold text-lg leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;
