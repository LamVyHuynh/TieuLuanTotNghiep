import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Landmark,
  Lock,
  MapPin,
  Wallet,
  QrCode,
  XCircle,
  X,
  Plus,
  ChevronRight,
  User,
  Phone,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronDown,
  AlertCircle,
  Save,
  PencilLine, // 🚀 Thêm icon cái bút chì cho đẹp
} from "lucide-react";
import { CheckoutContext } from "../../context/CheckoutContext";
import { useAuth } from "../../context/AuthContext";
import axiosClient from "../../api/axiosClient";

const generateTimeSlots = () => {
  const groupedSlots = [];
  const now = new Date();

  now.setMinutes(now.getMinutes() + 45);
  const limitHour = now.getHours();
  const limitMinute = now.getMinutes();

  const sessions = [
    { name: "Khuya", start: 0, end: 6 },
    { name: "Sáng", start: 6, end: 11 },
    { name: "Trưa", start: 11, end: 13 },
    { name: "Chiều", start: 13, end: 18 },
    { name: "Tối", start: 18, end: 24 },
  ];

  sessions.forEach((session) => {
    const slotsInThisSession = [];
    for (let h = session.start; h < session.end; h++) {
      const mins = [0, 30];
      for (let m of mins) {
        const startTimeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

        let nextH = h;
        let nextM = m + 30;
        if (nextM >= 60) {
          nextM = 0;
          nextH += 1;
        }
        const displayNextH =
          nextH === 24 ? "00" : nextH.toString().padStart(2, "0");
        const endTimeStr = `${displayNextH}:${nextM.toString().padStart(2, "0")}`;

        let isDisabled = false;
        if (h < limitHour) isDisabled = true;
        if (h === limitHour && m < limitMinute) isDisabled = true;

        const realNow = new Date();
        const year = realNow.getFullYear();
        const month = String(realNow.getMonth() + 1).padStart(2, "0");
        const date = String(realNow.getDate()).padStart(2, "0");
        const hourStr = String(h).padStart(2, "0");
        const minStr = String(m).padStart(2, "0");

        const mysqlDateTime = `${year}-${month}-${date} ${hourStr}:${minStr}:00`;

        slotsInThisSession.push({
          value: mysqlDateTime,
          label: `${startTimeStr} - ${endTimeStr}`,
          isDisabled: isDisabled,
        });
      }
    }
    if (slotsInThisSession.length > 0) {
      groupedSlots.push({
        sessionName: session.name,
        slots: slotsInThisSession,
      });
    }
  });

  return groupedSlots;
};

const paymentMethods = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: Banknote },
  { id: "bank", label: "Chuyển khoản ngân hàng", icon: Landmark },
  { id: "momo", label: "Ví điện tử MoMo", icon: Wallet },
];

function CheckOut() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkoutList } = useContext(CheckoutContext);
  const { currentUser, refetchUser } = useAuth();

  const [isExiting, setIsExiting] = useState(true);
  const [slideDirection, setSlideDirection] = useState("-translate-x-12");

  useEffect(() => {
    const resetAnimation = setTimeout(() => {
      setIsExiting(false);
    }, 10);
    return () => clearTimeout(resetAnimation);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    if (path === -1 || path === "/cart" || path === "/") {
      setSlideDirection("translate-x-12");
    } else {
      setSlideDirection("-translate-x-12");
    }
    setIsExiting(true);
    setTimeout(() => {
      if (path === -1) navigate(-1);
      else navigate(path);
    }, 400);
  };

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");

  const [deliveryType, setDeliveryType] = useState("asap");
  const [scheduledTime, setScheduledTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showQRModal, setShowQRModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newAddressText, setNewAddressText] = useState("");

  // =================================================================
  // 🚀 LOGIC TÊN TẠM THỜI VÀ SĐT LƯU DB
  // =================================================================
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });

  const [tempOrderName, setTempOrderName] = useState("");

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        full_name: tempOrderName || currentUser.full_name || "",
        phone: currentUser.phone || "",
      });
      if (!tempOrderName) {
        setTempOrderName(currentUser.full_name || "");
      }
    }
  }, [currentUser, showProfileModal, tempOrderName]);

  const isPhoneMissing =
    !currentUser?.phone || currentUser?.phone.trim() === "";

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.full_name.trim() || !profileForm.phone.trim()) {
      showToast("Vui lòng điền đầy đủ tên và số điện thoại!", "error");
      return;
    }

    if (!/^\d{10,11}$/.test(profileForm.phone.trim())) {
      showToast("Số điện thoại phải từ 10-11 chữ số!", "error");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      // 🚀 CẬP NHẬT DB: Giữ nguyên tên gốc, chỉ lưu SĐT mới
      await axiosClient.put(`/auth/users/${currentUser.id}/update-user`, {
        full_name: currentUser.full_name,
        phone: profileForm.phone,
        email: currentUser.email,
        role_id: currentUser.role_id,
      });

      // 🚀 LƯU TÊN MỚI VÀO BIẾN TẠM
      setTempOrderName(profileForm.full_name);

      showToast("Cập nhật thông tin giao hàng thành công! 🥰", "success");
      setShowProfileModal(false);

      if (refetchUser) await refetchUser();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi cập nhật thông tin",
        "error",
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, []);

  // Khi mở trang checkout lên thì fetchAddresses để lấy danh sách địa chỉ của user hiện tại
  // Trong khi chờ tải dữ liệu thì khung sẽ hiện lên
  // Khi tải liệu xong thì hiện ra - giải thích cho phần thay đổi username tạm và phone user ở bên dưới
  const fetchAddresses = useCallback(async (newIdToSelect = null) => {
    try {
      setIsLoadingAddress(true);
      const res = await axiosClient.get("/addresses");
      const list = res.data?.data || [];
      setAddresses(list);

      if (list.length > 0) {
        let chosen = null;
        if (newIdToSelect) {
          chosen = list.find((a) => a.id_address === newIdToSelect);
        }
        if (!chosen) {
          chosen =
            list.find((a) => a.is_default === 1 || a.is_default === true) ||
            list[0];
        }
        setSelectedAddress(chosen);
      } else {
        setSelectedAddress(null);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách địa chỉ:", error);
      setSelectedAddress(null);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAddresses();
    }
  }, [currentUser, fetchAddresses]);

  const handleSaveNewAddress = async () => {
    if (!newAddressText.trim()) {
      showToast("Vui lòng nhập địa chỉ cụ thể!", "error");
      return;
    }

    setIsSavingAddress(true);
    try {
      const addressPayload = {
        receiver_name: tempOrderName || currentUser?.full_name,
        phone: currentUser?.phone,
        address: newAddressText.trim(),
        is_default: 1,
      };

      const res = await axiosClient.post(
        "/addresses/add-address",
        addressPayload,
      );
      const newAddressId = res.data?.data?.id;

      showToast("Đã lưu địa chỉ thành công! 🥰", "success");

      setNewAddressText("");
      setIsAddingNewAddr(false);
      setShowAddressModal(false);

      await fetchAddresses(newAddressId);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi lưu địa chỉ!",
        "error",
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  const triggerDelete = (addressId, e) => {
    e.stopPropagation();
    setAddressToDelete(addressId);
    setShowDeleteModal(true);
  };

  const executeDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsDeleting(true);
    try {
      await axiosClient.delete(`/addresses/${addressToDelete}`);
      showToast("Đã xoá địa chỉ!", "success");

      if (selectedAddress?.id_address === addressToDelete) {
        setSelectedAddress(null);
      }

      await fetchAddresses();
      setShowDeleteModal(false);
      setAddressToDelete(null);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Lỗi khi xoá địa chỉ!",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const product = checkoutList.length > 0 ? checkoutList[0] : null;
  const subtotal = useMemo(
    () =>
      checkoutList.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [checkoutList],
  );
  const shippingFee = checkoutList.length > 0 ? 20000 : 0;
  const discount = checkoutList.length > 0 ? 15000 : 0;
  const total = Math.max(subtotal + shippingFee - discount, 0);

  const handlePlaceOrder = () => {
    if (isPhoneMissing) {
      setShowProfileModal(true);
      showToast("Vui lòng bổ sung SĐT trước khi đặt hàng!", "error");
      return;
    }

    if (!selectedAddress) {
      showToast("Vui lòng thêm địa chỉ giao hàng!", "error");
      return;
    }

    if (deliveryType === "scheduled" && !scheduledTime) {
      showToast("Vui lòng chọn khung giờ bạn muốn nhận hàng!", "error");
      return;
    }

    if (paymentMethod !== "cod" && !showQRModal) {
      setShowQRModal(true);
      return;
    }

    executeOrder();
  };

  const executeOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        full_name: tempOrderName || currentUser?.full_name,
        phone: currentUser?.phone,
        address: selectedAddress.address,
        note: note,
        payment_method: paymentMethod,
        total_amount: total,
        scheduled_time: deliveryType === "scheduled" ? scheduledTime : null,
        items: checkoutList.map((item) => ({
          id_product: item.id_product || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await axiosClient.post("/orders/checkout", orderPayload);

      setShowQRModal(false);
      showToast("Đặt hàng thành công! Sang trang đơn hàng...", "success");

      setTimeout(() => {
        handleNavigate("/order");
      }, 1500);
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      showToast(
        error.response?.data?.message || "Lỗi khi đặt hàng, vui lòng thử lại!",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div
        className={`mx-auto max-w-[560px] px-4 py-20 text-center sm:px-6 lg:px-10 transform transition-all duration-500 ease-in-out ${
          isExiting
            ? `${slideDirection} opacity-0`
            : "translate-x-0 opacity-100"
        }`}
      >
        <div className="mx-auto mb-5 flex h-[84px] w-[84px] items-center justify-center rounded-full border-4 border-slate-200 text-4xl text-slate-400">
          :(
        </div>
        <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-900">
          Đơn hàng chưa sẵn sàng!
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-500">
          Bạn chưa chọn sản phẩm nào để thanh toán cả.
        </p>
        <button
          className="mt-7 cursor-pointer rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
          onClick={() => handleNavigate("/")}
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen bg-[#f6f8f4] text-slate-900 transform transition-all duration-500 ease-in-out ${
          isExiting
            ? `${slideDirection} opacity-0`
            : "translate-x-0 opacity-100"
        }`}
      >
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => handleNavigate(-1)}
              >
                <ArrowLeft size={16} /> Quay lại
              </button>
              <span className="hidden h-4 w-px bg-slate-300 sm:block" />
              <span className="hidden text-sm font-semibold text-slate-500 sm:block">
                Thanh toán an toàn
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Lock size={16} /> Bảo mật 100%
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-6 lg:col-span-8">
              <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                      1
                    </div>
                    <h2 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                      Thông tin giao nhận
                    </h2>
                  </div>
                  {/*  NÚT SỬA THÔNG TIN ĐƯỢC MANG RA NGOÀI GÓC PHẢI */}
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <PencilLine size={16} /> Sửa đổi
                  </button>
                </div>

                {isLoadingAddress ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
                    <div className="h-24 w-full bg-slate-100 rounded-xl"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {/* KHU VỰC TÊN NGƯỜI NHẬN - HIỂN THỊ TÊN TẠM */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <User size={14} className="text-slate-400" />
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                            Người nhận
                          </p>
                        </div>
                        <p className="font-bold text-slate-900 truncate">
                          {tempOrderName || currentUser?.full_name}
                        </p>
                      </div>

                      {/* KHU VỰC SĐT */}
                      <div
                        className={`rounded-xl border p-4 ${isPhoneMissing ? "border-rose-200 bg-rose-50" : "border-slate-100 bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Phone
                            size={14}
                            className={
                              isPhoneMissing
                                ? "text-rose-400"
                                : "text-slate-400"
                            }
                          />
                          <p
                            className={`text-[11px] font-bold uppercase tracking-widest ${isPhoneMissing ? "text-rose-500" : "text-slate-500"}`}
                          >
                            Điện thoại
                          </p>
                        </div>

                        {isPhoneMissing ? (
                          <button
                            onClick={() => setShowProfileModal(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-3 py-1 rounded-md transition mt-1 cursor-pointer shadow-sm"
                          >
                            <AlertCircle size={14} /> Cần bổ sung
                          </button>
                        ) : (
                          <p className="font-bold text-slate-900">
                            {currentUser?.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Nơi nhận hàng
                      </label>
                      {selectedAddress ? (
                        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 p-5 transition hover:border-emerald-200">
                          <div className="flex items-start gap-4 pr-16">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <MapPin size={18} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900">
                                  Địa chỉ giao hàng
                                </h3>
                                {selectedAddress.is_default ? (
                                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    MẶC ĐỊNH
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {selectedAddress.address}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowAddressModal(true);
                              setIsAddingNewAddr(false);
                            }}
                            className="absolute right-4 top-4 text-sm font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100"
                          >
                            Thay đổi
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
                          <p className="mb-4 text-slate-500 font-medium">
                            Bạn chưa có địa chỉ giao hàng nào.
                          </p>
                          <button
                            onClick={() => {
                              setShowAddressModal(true);
                              setIsAddingNewAddr(true);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-5 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-200 cursor-pointer transition"
                          >
                            <Plus size={16} /> Thêm địa chỉ mới
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <label className="ml-1 mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> Thời gian nhận hàng
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDeliveryType("asap");
                            setScheduledTime("");
                          }}
                          className={`py-3.5 px-4 rounded-xl border-2 font-bold text-sm transition cursor-pointer ${
                            deliveryType === "asap"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                          }`}
                        >
                          Giao ngay cho nóng
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryType("scheduled")}
                          className={`py-3.5 px-4 rounded-xl border-2 font-bold text-sm transition cursor-pointer ${
                            deliveryType === "scheduled"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
                          }`}
                        >
                          Hẹn giờ giao
                        </button>
                      </div>

                      {deliveryType === "scheduled" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <label className="block text-xs font-medium text-slate-500 mb-2">
                            Chọn khung giờ (Dự kiến):
                          </label>
                          <div className="relative">
                            <select
                              value={scheduledTime}
                              onChange={(e) => setScheduledTime(e.target.value)}
                              className="w-full appearance-none rounded-xl border border-slate-200 bg-white p-3.5 pr-10 text-sm font-semibold text-emerald-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                            >
                              <option value="" disabled>
                                -- Chọn khung giờ nhận hàng --
                              </option>
                              {timeSlots.map((group, idx) => (
                                <optgroup
                                  key={idx}
                                  label={`--- BUỔI ${group.sessionName.toUpperCase()} ---`}
                                >
                                  {group.slots.map((slot, sIdx) => (
                                    <option
                                      key={sIdx}
                                      value={slot.value}
                                      disabled={slot.isDisabled}
                                      className={
                                        slot.isDisabled
                                          ? "text-slate-300"
                                          : "text-slate-800 font-bold"
                                      }
                                    >
                                      {slot.label}{" "}
                                      {slot.isDisabled ? " ❌ (Đã qua)" : ""}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                            <ChevronDown
                              size={18}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                          </div>
                          <p className="mt-3 text-[11px] text-amber-600 font-medium">
                            * Khung giờ đã qua sẽ không thể chọn. Cửa hàng cần
                            thêm 45 phút chuẩn bị món.
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="ml-1 mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Ghi chú đơn hàng (Tùy chọn)
                      </label>
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Vd: Tới nơi gọi trước giúp mình nha..."
                        className="w-full rounded-xl border-none bg-slate-100 p-3.5 text-sm text-slate-700 outline-none transition focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
                      />
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-8">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    2
                  </div>
                  <h2 className="text-xl font-black tracking-[-0.03em] text-slate-900">
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const active = paymentMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        className={`flex w-full cursor-pointer items-center rounded-xl border-2 p-4 text-left transition ${
                          active
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-transparent bg-slate-100 hover:border-emerald-200"
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <input
                          type="radio"
                          checked={active}
                          readOnly
                          className="h-5 w-5 accent-emerald-600 cursor-pointer"
                        />
                        <div className="ml-4 flex items-center gap-3">
                          <Icon size={18} className="text-slate-500" />
                          <span className="font-medium text-slate-800">
                            {method.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <aside className="sticky top-24 lg:col-span-4">
              <div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                <div className="border-b border-slate-200/70 p-6">
                  <h3 className="text-lg font-black tracking-[-0.03em] text-slate-900">
                    Tóm tắt đơn hàng
                  </h3>
                </div>

                <div className="space-y-4 p-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {checkoutList.map((item) => (
                    <div
                      key={item.id || item.id_product}
                      className="flex items-center gap-4"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-lg bg-slate-100 shrink-0 relative">
                        <img
                          src={
                            item.img ||
                            item.image_url ||
                            "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=700&q=80"
                          }
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm border-2 border-white">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold leading-tight text-slate-900 line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="mt-1 flex items-center justify-between gap-4">
                          <p className="text-sm font-bold text-emerald-700">
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN",
                            )}
                            đ
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 bg-slate-50/80 p-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tạm tính</span>
                    <span className="font-medium text-slate-900">
                      {subtotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phí vận chuyển</span>
                    <span className="font-medium text-slate-900">
                      {shippingFee.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Giảm giá</span>
                    <span className="font-medium">
                      -{discount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-4">
                    <span className="font-bold text-slate-900">Tổng cộng</span>
                    <span className="text-2xl font-black tracking-[-0.04em] text-emerald-700">
                      {total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <button
                    className={`flex items-center justify-center gap-2 w-full cursor-pointer rounded-xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] py-4 text-lg font-bold text-white shadow-[0_18px_35px_rgba(5,150,105,0.22)] transition hover:scale-[1.02] ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={isSubmitting}
                    onClick={handlePlaceOrder}
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      "Xác nhận đặt hàng"
                    )}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* ================= 🚀 MODAL BỔ SUNG THÔNG TIN ================= */}
      {showProfileModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl relative">
              <div className="flex items-center justify-between bg-emerald-50 px-6 py-5 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <PencilLine size={24} />
                  </div>
                  <h3 className="text-lg font-black text-emerald-900">
                    Thông tin giao nhận
                  </h3>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="rounded-full p-2 text-emerald-400 hover:bg-emerald-200 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-slate-600 mb-6">
                  Bạn có thể thay đổi tên người nhận cho đơn hàng này. Riêng{" "}
                  <span className="font-bold">Số điện thoại</span> sẽ được lưu
                  lại vào hệ thống để dùng cho các lần sau.
                </p>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Tên người nhận (Dùng cho đơn này)
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            full_name: e.target.value,
                          })
                        }
                        placeholder="Nhập tên thật của bạn..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Vd: 0901234567"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProfile ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Save size={18} /> Lưu & Tiếp tục đặt hàng
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ================= CÁC MODAL KHÁC BÊN DƯỚI GIỮ NGUYÊN ================= */}

      {/* MODAL SỔ ĐỊA CHỈ */}
      {showAddressModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 shrink-0">
                <h3 className="text-xl font-black text-slate-900">
                  {isAddingNewAddr ? "Thêm địa chỉ mới" : "Sổ địa chỉ của bạn"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    setIsAddingNewAddr(false);
                  }}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {isAddingNewAddr ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="ml-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Nhập địa chỉ cụ thể
                      </label>
                      <textarea
                        value={newAddressText}
                        onChange={(e) => setNewAddressText(e.target.value)}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, Tỉnh/Thành phố..."
                        rows={4}
                        className="w-full resize-none rounded-xl border-none bg-slate-100 p-4 text-sm text-slate-700 outline-none transition focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]"
                      />
                    </div>
                    <div className="pt-4 flex gap-3">
                      {addresses.length > 0 && (
                        <button
                          onClick={() => setIsAddingNewAddr(false)}
                          className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition cursor-pointer"
                        >
                          Trở lại
                        </button>
                      )}
                      <button
                        onClick={handleSaveNewAddress}
                        disabled={isSavingAddress}
                        className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex justify-center items-center gap-2 transition cursor-pointer disabled:opacity-70"
                      >
                        {isSavingAddress ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          "Lưu địa chỉ"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id_address}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                          selectedAddress?.id_address === addr.id_address
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-slate-100 hover:border-emerald-200 bg-white"
                        }`}
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedAddress(addr);
                            setShowAddressModal(false);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <MapPin
                                size={16}
                                className={
                                  selectedAddress?.id_address ===
                                  addr.id_address
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                                }
                              />
                              <h4 className="font-bold text-slate-900">
                                Địa chỉ giao hàng
                              </h4>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mt-2 ml-6 leading-relaxed pr-4">
                            {addr.address}
                          </p>
                        </div>

                        <button
                          onClick={(e) => triggerDelete(addr.id_address, e)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition cursor-pointer shrink-0"
                          title="Xoá địa chỉ này"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => setIsAddingNewAddr(true)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700 transition cursor-pointer font-bold mt-2"
                    >
                      <span className="flex items-center gap-2 ml-1">
                        <Plus size={18} /> Thêm địa chỉ mới
                      </span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* MODAL XÁC NHẬN XOÁ ĐỊA CHỈ */}
      {showDeleteModal &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl p-6 text-center relative">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Xoá địa chỉ này?
              </h3>
              <p className="text-sm text-slate-500 mb-6 px-2">
                Bạn sẽ không thể khôi phục lại địa chỉ này sau khi xoá.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition cursor-pointer"
                  disabled={isDeleting}
                >
                  Huỷ bỏ
                </button>
                <button
                  onClick={executeDeleteAddress}
                  className="flex-1 py-3.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition flex items-center justify-center cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Xoá ngay"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* MODAL MÃ QR THANH TOÁN */}
      {showQRModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl relative">
              <div className="bg-[#a50064] p-6 text-center text-white relative">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/40 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
                <QrCode size={40} className="mx-auto mb-3 opacity-90" />
                <h3 className="text-xl font-black tracking-wide">
                  Quét mã thanh toán
                </h3>
              </div>
              <div className="p-8 text-center">
                <div className="mx-auto aspect-square max-w-[220px] rounded-2xl border-4 border-pink-100 p-2 shadow-sm bg-white overflow-hidden mb-5">
                  <img
                    src={`https://img.vietqr.io/image/vcb-123456789-compact.png?amount=${total}&addInfo=Thanh toan don hang`}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={executeOrder}
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition cursor-pointer ${
                    isSubmitting
                      ? "bg-slate-400"
                      : "bg-[#a50064] hover:bg-[#80004d]"
                  }`}
                >
                  {isSubmitting ? "Đang xử lý..." : "Tôi đã chuyển khoản xong"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* TOAST */}
      {toast.show &&
        createPortal(
          <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold text-white shadow-xl animate-in slide-in-from-bottom-5 ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-500"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <XCircle size={20} />
            )}
            {toast.message}
          </div>,
          document.body,
        )}
    </>
  );
}

export default CheckOut;
