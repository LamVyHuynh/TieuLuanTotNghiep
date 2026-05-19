import React, { useState, useEffect } from "react";
import { Plus, X, Save, Activity, Box, Edit, Trash2 } from "lucide-react";
import axiosClient from "../../api/axiosClient";

function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const response = await axiosClient.get("products"); // Mở comment gọi API thật
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosClient.post("products/add-product", formData);
      alert("Thêm món ăn thành công bạn ơi! 🎉");
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

  // Xoá sản phẩm (nếu cần thiết)
  const handleDeleteProduct = async (productId) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xoá món này không? Hành động này không thể hoàn tác!",
      )
    ) {
      return;
    }
    try {
      await axiosClient.delete(`products/${productId}`);
      alert("Xoá món ăn thành công!");
      console.log("Sản phẩm đã xoá:", productId);
      fetchProducts();
    } catch (error) {
      alert("Lỗi khi xoá món ăn!");
      console.log("Lỗi xoá sản phẩm:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8 relative bg-slate-50/50">
      {/* MODAL THÊM SẢN PHẨM (GIỮ NGUYÊN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 px-8 py-6 backdrop-blur-md">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                Thêm món ăn mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest">
                  <Box size={18} /> Thông tin cơ bản
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
                      placeholder="Ví dụ: Salad ức gà nướng..."
                    />
                  </div>
                  <input
                    name="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    placeholder="Giá gốc ($)"
                  />
                  <input
                    name="discount_price"
                    type="number"
                    value={formData.discount_price}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    placeholder="Giá giảm ($)"
                  />
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Số lượng kho (Phần)
                    </label>
                    <input
                      name="stock_quantity"
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                      placeholder="Số lượng phần ăn..."
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-widest">
                  <Activity size={18} /> Chỉ số dinh dưỡng
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <input
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
                    placeholder="Calo"
                  />
                  <input
                    name="protein"
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
                    placeholder="Đạm"
                  />
                  <input
                    name="carbs"
                    type="number"
                    step="0.1"
                    value={formData.carbs}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
                    placeholder="Carbs"
                  />
                  <input
                    name="fat"
                    type="number"
                    step="0.1"
                    value={formData.fat}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
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
                  placeholder="Link ảnh món ăn..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-full py-5 bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] text-white font-black rounded-[1.5rem] shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 animate-spin border-2 border-white border-t-transparent rounded-full " />
                ) : (
                  <>
                    <Save size={22} /> XÁC NHẬN THÊM VÀO KHO
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
          onClick={() => setIsModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-200 transition hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Thêm món mới
        </button>
      </header>

      {/* HIỂN THỊ DANH SÁCH HOẶC TRẠNG THÁI TRỐNG */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="h-10 w-10 animate-spin border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      ) : productList.length > 0 ? (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="p-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Món ăn
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Dinh dưỡng (Macros)
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Tồn kho
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Giá bán
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productList.map((product) => (
                  <tr
                    key={product.id_product}
                    className="group hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 shadow-sm">
                          <img
                            src={
                              product.image_url ||
                              "https://via.placeholder.com/150"
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 leading-none mb-1">
                            {product.name}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {product.unit}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs font-black text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-lg">
                          <Activity size={14} /> {product.calories} kcal
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                          P: {product.protein}g • C: {product.carbs}g • F:{" "}
                          {product.fat}g
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-black ${product.stock_quantity > 10 ? "text-slate-700" : "text-rose-500"}`}
                        >
                          {product.stock_quantity} {product.unit}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.min(product.stock_quantity, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-black text-emerald-700">
                      {Number(product.price).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteProduct(product.id_product)
                          }
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
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
        <section className="rounded-[3rem] border-4 border-dashed border-slate-100 bg-white p-24 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-200">
            <Box size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight">
            Hệ thống đang rỗng bạn ơi!
          </h3>
          <p className="text-slate-400 mt-2 font-medium">
            Bấm cái nút xanh xanh phía trên để lên thực đơn ngay đi.
          </p>
        </section>
      )}
    </div>
  );
}

export default ProductsPage;
