import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  X,
  Save,
  Edit,
  Trash2,
  Box,
  ImageIcon,
  FileText,
  Search,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function CategoriesPage() {
  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);

  // --- STATE CONFIRM XOÁ & TOAST ---
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    categoryId: null,
    isDeleting: false,
  });
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const toastTimerRef = useRef(null);

  const initialFormState = {
    name: "",
    description: "",
    image_url: "",
    status: 1, // Mặc định là hiển thị (active)
  };
  const [formData, setFormData] = useState(initialFormState);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, type, message });
    toastTimerRef.current = setTimeout(
      () => setToast((prev) => ({ ...prev, show: false })),
      2500,
    );
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast((prev) => ({ ...prev, show: false }));
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const [catRes, proRes] = await Promise.all([
        axiosClient.get("categories"),
        axiosClient.get("products"),
      ]);
      setCategoryList(catRes.data.categories || []);
      setProductList(proRes.data.products || []);
    } catch (error) {
      console.error("Lỗi load danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Đếm số lượng sản phẩm thuộc danh mục
  const coutProductsInCategory = useMemo(() => {
    const counts = {};
    productList.forEach((p) => {
      counts[p.id_category] = (counts[p.id_category] || 0) + 1;
    });
    return counts;
  }, [productList]);

  // Tính toán thống kê
  const stastics = {
    total: categoryList.length,
    active: categoryList.filter((cat) => cat.status === 1).length,
    inactive: categoryList.filter((cat) => cat.status === 0).length,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
      status: category.status,
    });
    setCurrentCategoryId(category.id_category);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await axiosClient.put(`categories/${currentCategoryId}`, formData);
        showToast("success", "Cập nhật danh mục thành công! 🥰");
      } else {
        await axiosClient.post("categories/add-category", formData);
        showToast("success", "Thêm danh mục mới thành công! 🥰");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Lỗi lưu danh mục! 😥",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (id) => {
    setDeleteConfirm({ show: true, categoryId: id, isDeleting: false });
  };

  const executeDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      await axiosClient.delete(`categories/${deleteConfirm.categoryId}`);
      showToast("success", "Danh mục đã bay màu! 🥰");
      fetchCategories();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Xoá không được rồi mạy ơi! 😥",
      );
    } finally {
      setDeleteConfirm({ show: false, categoryId: null, isDeleting: false });
    }
  };

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8 relative bg-slate-50/50 overflow-hidden">
      {/* HEADER */}
      <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            Quản lý danh mục
          </h2>
          <p className="mt-1 text-slate-500 font-medium italic">
            Phân loại món ăn rõ ràng giúp khách dễ mua hơn!
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#2e7d32] px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105 hover:bg-[#1b5e20] active:scale-95"
        >
          <Plus size={22} />
          <span className="text-base">Thêm danh mục</span>
        </button>
      </header>

      {/* KHU VỰC TÌM KIẾM & THỐNG KÊ */}
      <section className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 px-2">
        {/* Tìm kiếm */}
        <div className="lg:col-span-5 flex relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 "
          />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            className="w-full  bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-sm outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Thống kê (3 Cards) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Box size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Tổng danh mục
              </p>
              <p className="text-lg font-black">{stastics.total}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Edit size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Đang hiển thị
              </p>
              <p className="text-lg font-black">{stastics.active}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
              <Trash2 size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Danh mục đang ẩn
              </p>
              <p className="text-lg font-black">{stastics.inactive}</p>
            </div>
          </div>
        </div>
      </section>

      {/* TABLE */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="h-10 w-10 animate-spin border-4 border-[#2e7d32] border-t-transparent rounded-full" />
        </div>
      ) : categoryList.length > 0 ? (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400">
                    Danh mục
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400">
                    Mô tả chi tiết
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-center">
                    Trạng thái
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categoryList.map((cat) => (
                  <tr
                    key={cat.id_category}
                    className="group hover:bg-emerald-50/30 transition-all"
                  >
                    {/* Thay đoạn td Tên danh mục cũ bằng đoạn này */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            cat.image_url || "https://via.placeholder.com/150"
                          }
                          alt=""
                          className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                        />
                        <div className="flex flex-col">
                          <p className="font-black text-slate-800 text-base">
                            {cat.name}
                          </p>

                          {/* Hiện số lượng món ở đây */}
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {coutProductsInCategory[cat.id_category] || 0} sản
                            phẩm
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-slate-500 max-w-xs truncate">
                      {cat.description || "Không có mô tả"}
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${cat.status === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {cat.status === 1 ? "Hiển thị" : "Đang ẩn"}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(cat.id_category)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <section className="rounded-[3rem] border border-slate-100 bg-white p-24 text-center">
          <Box size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-black text-slate-800">
            Chưa có danh mục nào
          </h3>
        </section>
      )}

      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 px-8 py-6 backdrop-blur-md">
              <h3 className="text-2xl font-black text-slate-900">
                {isEditMode ? "Sửa danh mục" : "Thêm danh mục"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Box size={14} /> Tên danh mục
                </label>
                <input
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white shadow-inner"
                  placeholder="Ví dụ: Món nướng, Món nước..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <FileText size={14} /> Mô tả chi tiết
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white shadow-inner resize-none"
                  placeholder="Mô tả về danh mục này..."
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <ImageIcon size={14} /> Link hình ảnh
                </label>
                <input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white shadow-inner"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: parseInt(e.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white shadow-inner cursor-pointer"
                >
                  <option value={1}>Hiển thị (Active)</option>
                  <option value={0}>Ẩn (Inactive)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-3 py-5 bg-[#2e7d32] hover:bg-[#1b5e20] active:scale-[0.98] text-white font-bold rounded-[1.5rem] shadow-xl cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 animate-spin border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Save size={24} />{" "}
                    <span className="text-lg">
                      {isEditMode ? "CẬP NHẬT" : "THÊM DANH MỤC"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XOÁ */}
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
                Danh mục này sẽ bị xoá. Nếu danh mục đang chứa món ăn thì không
                xoá được đâu nhé!
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() =>
                    setDeleteConfirm({ ...deleteConfirm, show: false })
                  }
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl cursor-pointer"
                >
                  Thôi hổng xoá
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleteConfirm.isDeleting}
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer"
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

      {/* KHUNG THÔNG BÁO TOAST */}
      {toast.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            onClick={closeToast}
          ></div>
          <div
            className={`relative w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col bg-white border-2 ${toast.type === "success" ? "border-emerald-500" : "border-rose-400"}`}
          >
            <div
              className={`px-6 py-5 flex flex-col items-center justify-center gap-2 text-white relative ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-400"}`}
            >
              <button
                onClick={closeToast}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/30 cursor-pointer"
              >
                <X size={20} />
              </button>
              <span className="text-[60px] drop-shadow-md">
                {toast.type === "success" ? "🥰" : "😥"}
              </span>
              <span className="font-black text-xl uppercase drop-shadow-sm">
                {toast.type === "success" ? "Thành công" : "Thất bại"}
              </span>
            </div>
            <div className="px-6 py-8 text-center bg-white">
              <p className="text-slate-700 font-bold text-lg">
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;
