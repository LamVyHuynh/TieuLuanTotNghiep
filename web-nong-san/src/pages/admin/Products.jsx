import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Plus,
  X,
  Save,
  Activity,
  Box,
  Edit,
  Trash2,
  Search,
  LayoutDashboard,
  AlertTriangle,
  DollarSign,
  Download,
  UploadCloud,
  ImageIcon,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

// 🚀 IMPORT THƯ VIỆN EXCEL Ở FRONTEND
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function ProductsPage() {
  const [categoryList, setCategoryList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE CHO CHỨC NĂNG CHỌN NHIỀU (BULK ACTIONS) ---
  const [selectedIds, setSelectedIds] = useState([]);

  // --- STATE CHO MODAL THÊM / SỬA ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // --- STATE LƯU FILE & PREVIEW ẢNH ---
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // --- STATE CHO MODAL XÁC NHẬN XOÁ (Thêm cờ isBulk) ---
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    productId: null,
    isDeleting: false,
    isBulk: false, // Cờ phân biệt xoá 1 hay xoá nhiều
  });

  // --- STATE CHO THÔNG BÁO Ở GIỮA ---
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const toastTimerRef = useRef(null);

  const [formData, setFormData] = useState({
    id_category: "",
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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productRes, categoryRes] = await Promise.all([
        axiosClient.get("products"),
        axiosClient.get("categories"),
      ]);
      setProductList(productRes.data.products || []);

      // Lọc danh mục đang hoạt động để hiển thị trong form
      const activeCategories = (categoryRes.data.categories || []).filter(
        (cat) => cat.status === 1,
      );
      setCategoryList(activeCategories);
    } catch (error) {
      console.error("Lỗi load sản phẩm:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const categoryMap = useMemo(() => {
    return categoryList.reduce((acc, cat) => {
      acc[cat.id_category] = cat.name;
      return acc;
    }, {});
  }, [categoryList]);

  const getCategoryName = (id) => categoryMap[id] || "Chưa có danh mục";

  const stastics = {
    total: productList.length,
    lowStock: productList.filter((product) => product.stock_quantity <= 5)
      .length,
    totalValue: productList.reduce((sum, product) => {
      const activePrice =
        product.discount_price && Number(product.discount_price) > 0
          ? Number(product.discount_price)
          : Number(product.price) || 0;
      return sum + activePrice * (product.stock_quantity || 0);
    }, 0),
  };

  // =========================================================
  // XỬ LÝ CHỌN NHIỀU SẢN PHẨM (CHECKBOX)
  // =========================================================
  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = productList.map((p) => p.id_product);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openEditModal = (product) => {
    setFormData({
      id_category: product.id_category,
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
    });
    setImageFile(null);
    setImagePreview(product.image_url || "");
    setCurrentProductId(product.id_product);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setFormData({
      id_category: categoryList.length > 0 ? categoryList[0].id_category : "",
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
    });
    setImageFile(null);
    setImagePreview("");
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      if (isEditMode) {
        await axiosClient.put(`products/${currentProductId}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("success", "Bạn đã cập nhật thông tin thành công!");
      } else {
        await axiosClient.post("products/add-product", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("success", "Bạn đã thêm món ăn thành công!");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      showToast(
        "error",
        "Lỗi: " + (error.response?.data?.message || "Kiểm tra lại Backend!"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở Modal xác nhận xoá 1 mục
  const openDeleteConfirm = (id) => {
    setDeleteConfirm({
      show: true,
      productId: id,
      isDeleting: false,
      isBulk: false,
    });
  };

  // Mở Modal xác nhận xoá hàng loạt
  const openBulkDeleteConfirm = () => {
    setDeleteConfirm({
      show: true,
      productId: null,
      isDeleting: false,
      isBulk: true,
    });
  };

  // =========================================================
  // XỬ LÝ XOÁ (GỘP CHUNG 1 HÀM CHO CẢ XOÁ LẺ VÀ XOÁ NHIỀU)
  // =========================================================
  const executeDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));
    try {
      if (deleteConfirm.isBulk) {
        // Gửi mảng ID xuống Backend API (Yêu cầu Backend phải hỗ trợ route này)
        await axiosClient.delete("products/bulk-delete", {
          data: { ids: selectedIds },
        });
        showToast(
          "success",
          `Đã xoá thành công ${selectedIds.length} món ăn 🥰`,
        );
        setSelectedIds([]); // Dọn dẹp danh sách đã chọn
      } else {
        await axiosClient.delete(`products/${deleteConfirm.productId}`);
        showToast("success", "Món ăn đã được xoá thành công 🥰");
        // Xóa món đó khỏi selectedIds (nếu đang được tick)
        setSelectedIds((prev) =>
          prev.filter((id) => id !== deleteConfirm.productId),
        );
      }
      fetchData();
    } catch (error) {
      showToast("error", "Xoá món ăn không được rồi 😥", error);
    } finally {
      setDeleteConfirm({
        show: false,
        productId: null,
        isDeleting: false,
        isBulk: false,
      });
    }
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template Nhập Sản Phẩm");

    const categoryOptions = categoryList.map(
      (cat) => `${cat.name} - [ID: ${cat.id_category}]`,
    );
    const suggestCategory =
      categoryOptions.length > 0 ? categoryOptions[0] : "";

    worksheet.columns = [
      { header: "Tên món ăn", key: "name", width: 25 },
      { header: "Danh mục", key: "category", width: 35 },
      { header: "Giá gốc", key: "price", width: 15 },
      { header: "Giá giảm", key: "discount_price", width: 15 },
      { header: "Đơn vị", key: "unit", width: 10 },
      { header: "Tồn kho", key: "stock", width: 10 },
      { header: "Calo", key: "calories", width: 10 },
      { header: "Đạm", key: "protein", width: 10 },
      { header: "Carb", key: "carbs", width: 10 },
      { header: "Béo", key: "fat", width: 10 },
      { header: "Mô tả", key: "description", width: 40 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "059669" },
      };
      cell.font = { color: { argb: "FFFFFF" }, bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    worksheet.addRow({
      name: "Salad Ức Gà Mẫu",
      category: suggestCategory,
      price: 65000,
      discount_price: 50000,
      unit: "phần",
      stock: 100,
      calories: 350,
      protein: 25.5,
      carbs: 10,
      fat: 5.2,
      description: "Món salad rất ngon, phù hợp ăn kiêng.",
    });

    if (categoryOptions.length > 0) {
      const hiddenSheet = workbook.addWorksheet("HiddenCategories", {
        state: "hidden",
      });
      categoryOptions.forEach((cat, index) => {
        hiddenSheet.getCell(`A${index + 1}`).value = cat;
      });

      for (let i = 2; i <= 1000; i++) {
        worksheet.getCell(`B${i}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`HiddenCategories!$A$1:$A$${categoryOptions.length}`],
          showErrorMessage: true,
          errorTitle: "Lỗi danh mục",
          error:
            "Vui lòng click vào mũi tên và chọn danh mục có sẵn trong danh sách!",
        };
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Template_Nhap_SanPham_HealthyGO.xlsx");
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const importData = new FormData();
    importData.append("file", file);

    try {
      const res = await axiosClient.post("products/import", importData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", res.data.message || "Import dữ liệu thành công!");
      fetchData();
    } catch (error) {
      showToast(
        "error",
        "Lỗi Import: " +
          (error.response?.data?.message || "Kiểm tra lại file!"),
      );
    } finally {
      setIsLoading(false);
      e.target.value = null;
    }
  };

  const exportToCSV = () => {
    if (productList.length === 0) {
      showToast("error", "Không có dữ liệu để xuất CSV!");
      return;
    }

    const headers = [
      "Mã SP",
      "Tên món",
      "Danh mục",
      "Đơn vị",
      "Giá gốc (đ)",
      "Giá KM (đ)",
      "Tồn kho",
      "Calo",
      "Đạm (P)",
      "Carb (C)",
      "Béo (F)",
    ];

    const csvRows = productList.map((product) => {
      return [
        product.id_product,
        `"${product.name}"`,
        `"${getCategoryName(product.id_category)}"`,
        product.unit,
        product.price,
        product.discount_price || "",
        product.stock_quantity,
        product.calories,
        product.protein,
        product.carbs,
        product.fat,
      ].join(";");
    });

    const csvString = [headers.join(";"), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `KhoSanPham_HealthyGO_${new Date().toLocaleDateString("vi-VN")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("success", "Xuất kho hàng thành công! 🥰");
  };

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6 lg:p-8 relative bg-slate-50/50 overflow-hidden">
      {/* HEADER TRANG CHÍNH */}
      <header className="mb-10 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            Quản lý sản phẩm
          </h2>
          <p className="mt-1 text-slate-500 font-medium italic">
            Sức khỏe của khách hàng nằm trong tay bạn!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadTemplate}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-sm"
          >
            <Download size={20} />
            <span className="text-sm">Tải Template mẫu</span>
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 font-bold text-amber-700 hover:bg-amber-100 transition shadow-sm">
            <UploadCloud size={20} />
            <span className="text-sm">Nhập Excel</span>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
              onChange={handleImportFile}
            />
          </label>

          <button
            onClick={exportToCSV}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 font-bold text-slate-700 shadow-sm transition hover:scale-105 active:scale-95"
          >
            <Download size={20} />
            <span className="text-sm">Xuất CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#2e7d32] px-6 py-3 font-bold text-white shadow-lg transition hover:scale-105 hover:bg-[#1b5e20] active:scale-95"
          >
            <Plus size={20} />
            <span className="text-sm">Thêm món mới</span>
          </button>
        </div>
      </header>

      {/* THỐNG KÊ & TÌM KIẾM */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4 px-2">
        <div className="lg:col-span-2 flex relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 "
          />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium shadow-sm outline-none focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Tổng món
              </p>
              <p className="text-lg font-black">{stastics.total}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Sản phẩm sắp hết
              </p>
              <p className="text-lg font-black">{stastics.lowStock}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Card giá trị kho */}
      <section className="mb-8 px-2">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Tổng giá trị kho hàng (Theo giá thực tế)
            </p>
            <p className="text-2xl font-black text-slate-800">
              {Number(stastics.totalValue).toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 THANH CÔNG CỤ XÓA HÀNG LOẠT SẼ HIỆN RA KHI CÓ SẢN PHẨM ĐƯỢC CHỌN */}
      {selectedIds.length > 0 && (
        <div className="mb-4 mx-2 flex items-center justify-between bg-rose-50 border border-rose-200 px-6 py-4 rounded-2xl shadow-sm animate-in fade-in duration-200">
          <span className="text-sm font-bold text-rose-800">
            Đã chọn{" "}
            <span className="text-rose-600 font-black text-lg mx-1">
              {selectedIds.length}
            </span>{" "}
            sản phẩm
          </span>
          <button
            onClick={openBulkDeleteConfirm}
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95"
          >
            <Trash2 size={18} /> Xoá các mục đã chọn
          </button>
        </div>
      )}

      {/* TABLE BẢNG HIỂN THỊ */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="h-10 w-10 animate-spin border-4 border-[#2e7d32] border-t-transparent rounded-full" />
        </div>
      ) : productList.length > 0 ? (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1100px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {/* 🚀 CỘT CHECKBOX CHỌN TẤT CẢ */}
                  <th className="p-5 w-[60px] text-center border-r border-slate-100">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        productList.length > 0 &&
                        selectedIds.length === productList.length
                      }
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 w-[300px]">
                    Món ăn
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400">
                    Danh mục
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-center">
                    Dinh dưỡng (P-C-F)
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-center">
                    Tồn kho
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-right">
                    Giá gốc
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-right">
                    Giá khuyến mãi
                  </th>
                  <th className="p-5 text-[11px] font-black uppercase text-slate-400 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productList.map((product) => {
                  const originalPrice = Number(product.price) || 0;
                  const discountPrice = Number(product.discount_price) || 0;
                  // Kiểm tra xem sản phẩm này có đang được chọn không
                  const isSelected = selectedIds.includes(product.id_product);

                  return (
                    <tr
                      key={product.id_product}
                      className={`group transition-all align-middle hover:bg-emerald-50/30 ${isSelected ? "bg-emerald-50/50" : ""}`}
                    >
                      {/* 🚀 CỘT CHECKBOX CHỌN LẺ */}
                      <td className="p-5 text-center border-r border-slate-50">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(product.id_product)}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </td>

                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              product.image_url ||
                              "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                            }
                            alt=""
                            className="h-14 w-14 rounded-2xl object-cover shadow-sm"
                          />
                          <div>
                            <p className="font-black text-slate-800 leading-tight line-clamp-2 mb-1">
                              {product.name}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {product.unit}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-5">
                        <span
                          title={getCategoryName(product.id_category)}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm"
                        >
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest truncate max-w-[120px]">
                            {getCategoryName(product.id_category)}
                          </span>
                        </span>
                      </td>

                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg mb-1">
                            {product.calories} kcal
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            P:{product.protein} C:{product.carbs} F:
                            {product.fat}
                          </span>
                        </div>
                      </td>

                      <td className="p-5 text-center">
                        <span
                          className={`font-black text-sm px-3 py-1 rounded-lg ${
                            product.stock_quantity <= 5
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </td>

                      <td className="p-5 text-right font-bold text-slate-600">
                        <span
                          className={
                            discountPrice > 0
                              ? "line-through text-slate-400"
                              : ""
                          }
                        >
                          {originalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </td>

                      <td className="p-5 text-right">
                        {discountPrice > 0 ? (
                          <span className="font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                            {discountPrice.toLocaleString("vi-VN")}đ
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold italic text-xs bg-slate-50 px-3 py-1.5 rounded-md">
                            Không có
                          </span>
                        )}
                      </td>

                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl cursor-pointer transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              openDeleteConfirm(product.id_product)
                            }
                            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* ================= MODAL XÁC NHẬN XOÁ ================= */}
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
                {deleteConfirm.isBulk ? "Xoá hàng loạt?" : "Xoá thiệt hả?"}
              </h3>
              <p className="text-slate-500 font-medium mb-8">
                {deleteConfirm.isBulk
                  ? `Bạn đang chuẩn bị xoá ${selectedIds.length} món ăn. Hành động này không thể hoàn tác!`
                  : "Món ăn này sẽ biến mất vĩnh viễn khỏi kho. Suy nghĩ kỹ chưa bạn ơi?"}
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
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
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

      {/* ================= MODAL THÊM / SỬA ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white shadow-2xl custom-scrollbar">
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
              {/* 🚀 KHU VỰC CHỌN HÌNH ẢNH SẢN PHẨM */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <ImageIcon size={14} /> Ảnh đại diện món ăn
                </label>

                <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl p-4 bg-slate-50 transition-colors flex flex-col items-center justify-center min-h-[160px]">
                  {imagePreview ? (
                    <div className="relative w-full h-44 rounded-2xl overflow-hidden group/img">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="cursor-pointer bg-white text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg hover:bg-emerald-50 hover:text-emerald-700 transition">
                          Đổi ảnh khác
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full py-6 text-slate-400 hover:text-emerald-600 transition">
                      <UploadCloud size={44} className="mb-2 text-slate-300" />
                      <span className="text-sm font-bold text-slate-700">
                        Nhấp vào đây để chọn ảnh từ máy tính
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Hỗ trợ PNG, JPG, WEBP tối đa 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest">
                  <Box size={18} /> Thông tin món
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
                      placeholder="Ví dụ: Salad ức gà..."
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Thuộc danh mục
                    </label>
                    <select
                      name="id_category"
                      required
                      value={formData.id_category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          id_category: parseInt(e.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner cursor-pointer"
                    >
                      <option value="" disabled>
                        -- Chọn danh mục --
                      </option>
                      {categoryList.map((cat) => (
                        <option key={cat.id_category} value={cat.id_category}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase">
                      Giá gốc (đ)
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
                      Giá giảm (đ)
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

      {/* ================= KHUNG THÔNG BÁO CHÍNH GIỮA ================= */}
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
              <span className="text-[60px] drop-shadow-md">
                {toast.type === "success" ? "🥰" : "😥"}
              </span>
              <span className="font-black text-xl tracking-widest uppercase">
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
