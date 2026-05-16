import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axiosClient from "../../../api/axiosClient";
import { User, Mail, Phone, Save, ArrowLeft, ShieldCheck } from "lucide-react";

function ProfilePage() {
  const { currentUser, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // Đổ dữ liệu cũ vào form khi trang load
  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    // --- LOGIC: NẾU BỎ TRỐNG THÌ LẤY DATA CŨ ---
    const finalData = {
      full_name: formData.full_name.trim() || currentUser.full_name,
      email: formData.email.trim() || currentUser.email,
      phone: formData.phone.trim() || currentUser.phone,
      role_id: currentUser.role_id, // Giữ nguyên role
    };

    try {
      await axiosClient.put("/auth/update-profile", finalData);

      // Cập nhật lại Context để các trang khác (Header) nhận tên mới
      await fetchCurrentUser();

      // alert("Ngon lành! Cập nhật thông tin thành công rồi mạy.");
      navigate("/"); // Cook về trang chủ
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      // alert(error.response?.data?.message || "Lỗi rồi ba ơi, thử lại xem!");
    } finally {
      setIsUpdating(false);
    }
  };

  // Hàm hiển thị tên Role
  const getRoleName = (id) => {
    if (id === 1) return "Quản trị viên";
    if (id === 3) return "Chủ cửa hàng";
    return "Khách hàng thân thiết";
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-3xl shadow-lg border border-slate-100">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition font-medium"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Cập nhật thông tin cá nhân
        </h2>
        {/* Hiển thị Role cho biết mạy là ai */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
          <ShieldCheck size={14} />
          {getRoleName(currentUser?.role_id)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Họ tên */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-500 ml-1">
            Họ và tên
          </label>
          <div className="relative">
            <User
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Để trống để giữ nguyên tên cũ..."
              className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-500 ml-1">Email</label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Để trống để giữ nguyên email cũ..."
              className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Số điện thoại */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-500 ml-1">
            Số điện thoại
          </label>
          <div className="relative">
            <Phone
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Để trống để giữ nguyên SĐT cũ..."
              className="w-full py-3 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={isUpdating}
          className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-70"
        >
          {isUpdating ? (
            <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Save size={18} /> Lưu thay đổi
            </>
          )}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-400 font-medium">
        Mọi thay đổi sẽ được cập nhật ngay lập tức trên hệ thống
      </p>
    </div>
  );
}

export default ProfilePage;
