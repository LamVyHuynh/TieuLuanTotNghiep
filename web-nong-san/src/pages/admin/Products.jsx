import React, { useState, useEffect } from "react";
import { Plus, X, Save, Activity, Box } from "lucide-react";
import axiosClient from "../../api/axiosClient";

function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productList, setProductList] = useState([]);

  // Đã xóa is_organic
  const [formData, setFormData] = useState({
    id_Store: 1,
    id_Category: 1,
    name: "",
    description: "",
    price: "",
    discount_price: "",
    unit: "phần", // Tao đổi chữ 'kg' thành 'phần' cho hợp bán đồ ăn nhé
    stock_quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    image_url: "",
  });

  const fetchProducts = async () => {
    try {
      // Khi nào code API lấy danh sách xong thì mở comment dòng dưới ra
      // const response = await axiosClient.get("/products");
      // setProductList(response.data);

      setProductList([]); // Tạm thời để trống, khi nào API xong thì xóa dòng này đi
      // TẠM THỜI gán mảng rỗng để không bị ESLint chửi "không xài setProductList"
      console.log("Hàm này dùng để load lại danh sách sản phẩm");
    } catch (error) {
      console.error("Lỗi load sản phẩm:", error);
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
      alert("Thêm món ăn thành công mạy ơi! 🎉");

      // Đã xóa is_organic ở đây
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
      console.error(error);
      alert(
        "Lỗi: " +
          (error.response?.data?.message || "Kiểm tra lại Backend đi mạy!"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8 relative">
      {/* MODAL THÊM SẢN PHẨM */}
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
                className="rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* THÔNG TIN CƠ BẢN */}
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
                  <div>
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
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Giá giảm ($)
                    </label>
                    <input
                      name="discount_price"
                      type="number"
                      value={formData.discount_price}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                      placeholder="Nếu có..."
                    />
                  </div>
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
                      placeholder="Hôm nay chuẩn bị bao nhiêu phần..."
                    />
                  </div>
                </div>
              </div>

              {/* DINH DƯỠNG */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-widest">
                  <Activity size={18} /> Chỉ số dinh dưỡng (1 Phần)
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                      Calories
                    </label>
                    <input
                      name="calories"
                      type="number"
                      value={formData.calories}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                      Protein (g)
                    </label>
                    <input
                      name="protein"
                      type="number"
                      step="0.1"
                      value={formData.protein}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                      Carbs (g)
                    </label>
                    <input
                      name="carbs"
                      type="number"
                      step="0.1"
                      value={formData.carbs}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">
                      Fat (g)
                    </label>
                    <input
                      name="fat"
                      type="number"
                      step="0.1"
                      value={formData.fat}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 transition-all shadow-inner"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>

              {/* KHÁC */}
              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                    Link ảnh món ăn
                  </label>
                  <input
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                    placeholder="https://..."
                  />
                </div>
                {/* Đã xóa cái Checkbox is_organic ở đây */}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] text-white font-black rounded-[1.5rem] shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-6 w-6 animate-spin border-2 border-white border-t-transparent rounded-full" />
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

      {/* HEADER TRANG */}
      <header className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900">
            Thực đơn
          </h2>
          <p className="mt-1 text-slate-500 font-medium">
            Hiện có {productList.length || 0} món ăn trong hệ thống.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-200 transition hover:scale-105 active:scale-95"
        >
          <Plus size={20} /> Thêm món mới
        </button>
      </header>

      {/* BẢNG TRỐNG */}
      <section className="rounded-3xl border border-slate-100 bg-white p-20 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
          <Box size={40} />
        </div>
        {
          // Hiển thị bảng quản lí sản phẩm ở đây khi nào API xong thì mở comment ra nhé mạy
        }
        <h3 className="text-lg font-bold text-slate-800">Chưa có món ăn nào</h3>
        <p className="text-slate-400">
          Bấm "Thêm món mới" để bắt đầu lên thực đơn cho khách mạy ơi.
        </p>
      </section>
    </div>
  );
}

export default ProductsPage;
