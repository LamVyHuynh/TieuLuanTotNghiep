import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 🚀 Thêm useLocation
import { ArrowLeft, History, X, Trash2, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function SearchHistoryPage() {
  const navigate = useNavigate();
  const location = useLocation(); // 🚀 Bổ sung location
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);

  // =================================================================
  // 🚀 STATE TẠO HIỆU ỨNG TRƯỢT CHUYỂN TRANG
  // =================================================================
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const resetAnimation = setTimeout(() => {
      setIsExiting(false);
    }, 0);
    return () => clearTimeout(resetAnimation);
  }, [location.pathname]);

  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    setIsExiting(true);
    setTimeout(() => {
      if (path === -1)
        navigate(-1); // Lùi trang
      else navigate(path);
    }, 400); // Đợi 0.4s cho hiệu ứng trượt xong mới bay qua trang kia
  };

  // =================================================================
  // LOGIC LOCAL STORAGE
  // =================================================================
  useEffect(() => {
    const loadSearchHistory = async () => {
      if (currentUser) {
        const historyData = localStorage.getItem(
          `search_history_${currentUser.id}`,
        );
        if (historyData) {
          setHistory(JSON.parse(historyData));
        } else {
          setHistory([]);
        }
      } else {
        setHistory([]);
      }
    };
    loadSearchHistory();
  }, [currentUser]);

  const handleDeleteItem = (e, itemToRemove) => {
    e.stopPropagation();
    const newHistory = history.filter((item) => item !== itemToRemove);
    setHistory(newHistory);
    localStorage.setItem(
      `search_history_${currentUser.id}`,
      JSON.stringify(newHistory),
    );
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem(`search_history_${currentUser.id}`);
  };

  const handleSearch = (term) => {
    // 🚀 Dùng handleNavigate thay vì navigate trực tiếp để có hiệu ứng
    handleNavigate(`/search?q=${encodeURIComponent(term)}`);
  };

  if (!currentUser) {
    return (
      <div
        className={`max-w-3xl mx-auto px-4 py-24 text-center transform transition-all duration-500 ease-in-out ${isExiting ? "-translate-x-12 opacity-0" : "translate-x-0 opacity-100"}`}
      >
        <h3 className="text-2xl font-black text-zinc-700">
          Vui lòng đăng nhập để xem lịch sử!
        </h3>
        <button
          onClick={() => handleNavigate("/login")}
          className="mt-6 px-8 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 cursor-pointer transition"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    // 🚀 BỌC CLASS HIỆU ỨNG VÀO THẺ NGOÀI CÙNG
    <div
      className={`max-w-3xl mx-auto px-4 py-8 min-h-[70vh] transform transition-all duration-500 ease-in-out ${
        isExiting ? "-translate-x-12 opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => handleNavigate(-1)} // 🚀 Sửa lại gọi hàm handleNavigate
          className="flex items-center gap-2 text-zinc-500 hover:text-emerald-600 font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} /> Quay lại
        </button>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            <Trash2 size={16} /> Xóa toàn bộ
          </button>
        )}
      </div>

      <h2 className="text-3xl font-black text-zinc-900 mb-6 flex items-center gap-3">
        <History className="text-emerald-600" size={32} />
        Lịch sử tìm kiếm
      </h2>

      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        {history.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-zinc-300" />
            </div>
            <p className="text-lg font-bold text-zinc-600">
              Bạn chưa tìm món nào cả!
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              Lịch sử tìm kiếm trống trơn.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-50">
            {history.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSearch(item)}
                className="flex items-center justify-between p-5 hover:bg-emerald-50/30 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-zinc-50 text-zinc-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 rounded-xl transition-colors">
                    <History size={18} />
                  </div>
                  <span className="font-semibold text-zinc-700 group-hover:text-emerald-700 text-base">
                    {item}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteItem(e, item)}
                  className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  title="Xoá"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SearchHistoryPage;
