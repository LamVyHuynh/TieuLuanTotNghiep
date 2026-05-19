import React, { useState, useEffect } from "react";
import { Plus, X, Save, Activity, Box, Edit, Trash2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";

function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- PHẦN LOGIC SỬA SẢN PHẨM MỚI THÊM ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

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

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("products");
      const products = response.data.products;
      setProductList(products);
    } catch (error) {
      console.error("Lỗi load sản phẩm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- HÀM MỞ FORM ĐỂ SỬA ---
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

  // --- HÀM MỞ FORM ĐỂ THÊM MỚI (Reset lại form) ---
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
        // NẾU ĐANG SỬA THÌ GỌI API CẬP NHẬT
        await axiosClient.put(`products/${currentProductId}`, formData);
        alert("Cập nhật món ăn thành công! 🎉");
      } else {
        // NẾU THÊM MỚI
        await axiosClient.post("products/add-product", formData);
        alert("Thêm món ăn thành công bạn ơi! 🎉");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      alert(
        "Lỗi: " + (error.response?.data?.message || "Kiểm tra lại Backend!"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc muốn xoá món này không?")) return;
    try {
      await axiosClient.delete(`products/${productId}`);
      alert("Xoá món ăn thành công!");
      fetchProducts();
    } catch (error) {
      alert("Lỗi khi xoá món ăn!");
      console.log("Lỗi xoá sản phẩm:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8 relative bg-slate-50/50">
      {/* MODAL THÊM / SỬA DÙNG CHUNG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
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
                  <input
                    name="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    placeholder="Giá gốc"
                  />
                  <input
                    name="discount_price"
                    type="number"
                    value={formData.discount_price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    placeholder="Giá giảm"
                  />
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Đơn vị tính
                    </label>
                    <input
                      name="unit"
                      type="string"
                      required
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <div className="sm:col-span-2">
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
                  <input
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    placeholder="Calo"
                  />
                  <input
                    name="protein"
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    placeholder="Đạm"
                  />
                  <input
                    name="carbs"
                    type="number"
                    step="0.1"
                    value={formData.carbs}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    placeholder="Carbs"
                  />
                  <input
                    name="fat"
                    type="number"
                    step="0.1"
                    value={formData.fat}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    placeholder="Béo"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  placeholder="Link ảnh..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 flex items-center justify-center gap-3 py-5 bg-[#2e7d32] hover:bg-[#1b5e20] active:scale-[0.98] text-white font-black rounded-[1.5rem] shadow-xl shadow-green-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 animate-spin border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Save size={24} />
                    <span className="text-lg font-black">
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
          <h2 className="text-4xl font-black tracking-tighter text-slate-900">
            Quản lý sản phẩm
          </h2>
          <p className="mt-1 text-slate-500 font-medium italic">
            Sức khỏe của khách hàng nằm trong tay bạn!
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
        >
          <Plus size={22} /> {/* Tao cho icon to lên tí cho cân */}
          <span className="text-base">Thêm món mới</span>{" "}
          {/* Đổi từ text-xs sang text-base */}
        </button>
      </header>

      {/* BẢNG HIỂN THỊ */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="h-10 w-10 animate-spin border-4 border-emerald-600 border-t-transparent rounded-full" />
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
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400">
                    Dinh dưỡng
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400">
                    Tồn kho
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400">
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
                    className="group hover:bg-emerald-50/30"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            product.image_url ||
                            "https://via.placeholder.com/150"
                          }
                          alt=""
                          className="h-14 w-14 rounded-2xl object-cover"
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
                    <td className="p-5">
                      <div className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg w-fit">
                        {product.calories} kcal
                      </div>
                    </td>
                    <td className="p-5 font-black text-slate-700">
                      {product.stock_quantity}
                    </td>
                    <td className="p-5 text-sm font-black text-emerald-700">
                      {Number(product.price).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* NÚT EDIT GỌI openEditModal */}
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2.5 text-slate-400 hover:text-emerald-600 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteProduct(product.id_product)
                          }
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
            Chưa có món ăn nào
          </h3>
        </section>
      )}
    </div>
  );
}

export default ProductsPage;
