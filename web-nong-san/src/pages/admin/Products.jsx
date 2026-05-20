import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Save,
  Activity,
  Box,
  Edit,
  Trash2,
  AlertCircle, // Icon cảnh báo cho modal xoá
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function ProductsPage() {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE CHO MODAL THÊM / SỬA ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // --- STATE CHO MODAL XÁC NHẬN XOÁ ---
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    productId: null,
    isDeleting: false,
  });

  // --- STATE CHO THÔNG BÁO Ở GIỮA ---
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const toastTimerRef = useRef(null);

  const [formData, setFormData] = useState({
    id_Store: 1,
    id_Category: 1,
    name: "",
    description: "",
    price: "",
    discount_price: "",
    unit: "phần",
    stock_quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    image_url: "",
  });

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

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("products");
      setProductList(response.data.products || []);
    } catch (error) {
      console.error("Lỗi load sản phẩm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openEditModal = (product) => {
    setFormData({
      id_Store: product.id_Store,
      id_Category: product.id_Category,
      name: product.name,
      description: product.description || "",
      price: product.price,
      discount_price: product.discount_price || "",
      unit: product.unit,
      stock_quantity: product.stock_quantity,
      calories: product.calories,
      protein: product.protein,
      carbs: product.carbs,
      fat: product.fat,
      image_url: product.image_url || "",
    });
    setCurrentProductId(product.id_product);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({
      id_Store: 1,
      id_Category: 1,
      name: "",
      description: "",
      price: "",
      discount_price: "",
      unit: "phần",
      stock_quantity: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      image_url: "",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await axiosClient.put(`products/${currentProductId}`, formData);
        showToast("success", "Bạn đã cập nhật thông tin thành công!");
      } else {
        await axiosClient.post("products/add-product", formData);
        showToast("success", "Bạn đã thêm món ăn thành công!");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      showToast(
        "error",
        "Lỗi: " + (error.response?.data?.message || "Kiểm tra lại Backend!"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (id) => {
    setDeleteConfirm({ show: true, productId: id, isDeleting: false });
  };

  const executeDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      await axiosClient.delete(`products/${deleteConfirm.productId}`);
      showToast("success", "Món ăn đã được xoá thành công 🥰");
      fetchProducts();
    } catch (error) {
      showToast("error", "Xoá món ăn không được rồi 😥", error);
    } finally {
      setDeleteConfirm({ show: false, productId: null, isDeleting: false });
    }
  };

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8 relative bg-slate-50/50 overflow-hidden">
      {/* MODAL THÊM / SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 px-8 py-6 backdrop-blur-md">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                {isEditMode ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-rose-500 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest">
                  <Box size={18} /> Thông tin
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Tên món ăn
                    </label>
                    <input
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Giá gốc ($)
                    </label>
                    <input
                      name="price"
                      type="number"
                      required
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Giá giảm ($)
                    </label>
                    <input
                      name="discount_price"
                      type="number"
                      value={formData.discount_price}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Đơn vị
                    </label>
                    <input
                      name="unit"
                      required
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Số lượng kho
                    </label>
                    <input
                      name="stock_quantity"
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-widest">
                  <Activity size={18} /> Dinh dưỡng
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Calo
                    </label>
                    <input
                      name="calories"
                      type="number"
                      value={formData.calories}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Đạm
                    </label>
                    <input
                      name="protein"
                      type="number"
                      step="0.1"
                      value={formData.protein}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Carbs
                    </label>
                    <input
                      name="carbs"
                      type="number"
                      step="0.1"
                      value={formData.carbs}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                      Béo
                    </label>
                    <input
                      name="fat"
                      type="number"
                      step="0.1"
                      value={formData.fat}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                  Link ảnh sản phẩm
                </label>
                <input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  placeholder="https://..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-3 py-5 bg-[#2e7d32] hover:bg-[#1b5e20] active:scale-[0.98] text-white font-bold rounded-[1.5rem] shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 animate-spin border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Save size={24} />
                    <span className="text-lg">
                      {isEditMode ? "Lưu thông tin" : "Thêm vào kho"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER TRANG CHÍNH */}
      <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            Quản lý sản phẩm
          </h2>
          <p className="mt-1 text-slate-500 font-medium italic">
            Sức khỏe của khách hàng nằm trong tay bạn!
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#2e7d32] px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
        >
          <Plus size={22} />
          <span className="text-base">Thêm món mới</span>
        </button>
      </header>

      {/* TABLE BẢNG HIỂN THỊ ĐÃ KHÔI PHỤC ĐẦY ĐỦ */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="h-10 w-10 animate-spin border-4 border-[#2e7d32] border-t-transparent rounded-full" />
        </div>
      ) : productList.length > 0 ? (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400">
                    Món ăn
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-center">
                    Dinh dưỡng (P-C-F)
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-center">
                    Tồn kho
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-center">
                    Giá bán
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productList.map((product) => (
                  <tr
                    key={product.id_product}
                    className="group hover:bg-emerald-50/30 transition-all"
                  >
                    {/* Cột Tên & Ảnh */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            product.image_url ||
                            "https://via.placeholder.com/150"
                          }
                          alt=""
                          className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                        />
                        <div>
                          <p className="font-black text-slate-800 leading-none mb-1">
                            {product.name}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {product.unit}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* Cột Dinh dưỡng */}
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg mb-1">
                          {product.calories} kcal
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          P:{product.protein} C:{product.carbs} F:{product.fat}
                        </span>
                      </div>
                    </td>
                    {/* Cột Tồn kho */}
                    <td className="p-5 text-center">
                      <span
                        className={`font-black text-sm ${product.stock_quantity <= 5 ? "text-rose-500" : "text-slate-600"}`}
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    {/* Cột Giá */}
                    <td className="p-5 text-center font-black text-[#2e7d32]">
                      {product.discount_price ? (
                        <div className="flex flex-col items-center">
                          <span className="text-slate-300 line-through text-[10px]">
                            {Number(product.price).toLocaleString("vi-VN")}đ
                          </span>
                          <span>
                            {Number(product.discount_price).toLocaleString(
                              "vi-VN",
                            )}
                            đ
                          </span>
                        </div>
                      ) : (
                        <span>
                          {Number(product.price).toLocaleString("vi-VN")}đ
                        </span>
                      )}
                    </td>
                    {/* Cột Nút bấm thao tác */}
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2.5 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(product.id_product)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
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
            Chưa có món ăn nào
          </h3>
        </section>
      )}

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
                Món ăn này sẽ biến mất vĩnh viễn khỏi kho. Suy nghĩ kỹ chưa bạn
                ơi?
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

      {/* ================= KHUNG THÔNG BÁO GIỮA MÀN HÌNH ================= */}
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

export default ProductsPage;
