import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Logs,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phân trang dữ liệu
  // Cái gì cũng bắt đầu từng trang 1, mỗi trang sẽ có 5 bảng ghi nhật kí hoạt động
  const [currentPage, setCurrentPage] = useState(1);

  // Số lượng logs hiển thị trên mỗi trang, có thể điều chỉnh tùy ý
  const [logsPerPage] = useState(5);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/auth/logs");
      // Dữ liệu từ Backend trả về mảng phẳng: [{id, user_id, email_attempted, status, reason, created_at, full_name}, ...]
      setLogs(response.data.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Tính toán thống kê dựa trên mảng logs thật
  const status = {
    success: logs.filter((l) => l.status === "success").length,
    failure: logs.filter(
      (l) => l.status === "failure" || l.status === "failure",
    ).length,
    critical: logs.filter((l) => l.reason && l.reason.includes("khóa")).length, // Ví dụ: tài khoản bị khóa là nghiêm trọng
  };

  // Tính toán logs hiển thị trên trang hiện tại
  // Xác định vị trí log cuối cùng của trang hiện tại
  // Công thức: 2 (trang hiện tại)×5 (mỗi trang)=10
  // // Ý nghĩa: Ở trang 2, cái log cuối cùng mạy nhìn thấy sẽ là cái thứ 10 trong danh sách tổng.
  const indexOfLastLog = currentPage * logsPerPage;

  // Dòng này để xác định: "Điểm bắt đầu của trang này là từ đâu?"
  // Công thức: 10 (vừa tıˊnh ở treˆn)−5 (mỗi trang)=5.
  // Ý nghĩa: Mạy muốn bắt đầu lấy dữ liệu từ sau cái log thứ 5 (tức là từ cái thứ 6 trở đi).
  const indexOffirstLog = indexOfLastLog - logsPerPage;

  const curretLogs = logs.slice(indexOffirstLog, indexOfLastLog);

  // Tính tổng số trang dựa trên tổng số logs và số logs mỗi trang
  //  Công thức: Tổng số logs (ví dụ: 23) chia cho số logs mỗi trang (5) = 4.6 → làm tròn lên thành 5 trang.
  //  mỗi trang thì tối đa 5 log thì chỉ cần lấy tổng chia 5 là ra được số trang cần thiết để hiển thị hết tất cả logs.
  const totalPages = Math.ceil(logs.length / logsPerPage);

  // Hiển thị danh sách các trang trong log
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] antialiased font-sans">
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1a1c1c] tracking-tight font-display">
              Nhật ký hoạt động
            </h1>
            <p className="text-[#3f4a3c] mt-2 max-w-lg">
              Giám sát toàn bộ thay đổi hệ thống và truy vết hành động người
              dùng theo thời gian thực.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#1a1c1c]/5 text-[#1a1c1c] rounded-xl font-semibold text-sm hover:bg-[#f3f3f3] transition-all shadow-sm">
              <Download size={18} /> Xuất báo cáo
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-[#006e1c] to-[#4caf50] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#006e1c]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>

        {/* Bento Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#f3f3f3]/50 p-5 rounded-3xl border border-[#1a1c1c]/5">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] font-bold text-[#3f4a3c] uppercase tracking-widest ml-1">
              Tìm kiếm chi tiết
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3f4a3c]/40"
              />
              <input
                className="w-full bg-white border-none rounded-xl pl-10 py-2.5 text-sm focus:ring-2 focus:ring-[#006e1c]/10 shadow-sm"
                placeholder="Email, IP..."
                type="text"
              />
            </div>
          </div>
          {/* ... (Các phần filter khác mạy giữ nguyên nhé) */}
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#1a1c1c]/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f3f3f3]/30 border-b border-[#1a1c1c]/5">
                  <th className="px-8 py-5 text-xs font-bold text-[#3f4a3c]/60 uppercase tracking-widest text-center">
                    Thời gian
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-[#3f4a3c]/60 uppercase tracking-widest">
                    Người thực hiện
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-[#3f4a3c]/60 uppercase tracking-widest">
                    Trạng thái / Hành động
                  </th>
                  <th className="px-8 py-5 text-xs font-bold text-[#3f4a3c]/60 uppercase tracking-widest">
                    IP / Thiết bị
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1c1c]/5">
                {curretLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#f3f3f3]/30 transition-colors group"
                  >
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1a1c1c]">
                          {new Date(log.created_at).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                        <span className="text-[11px] text-[#3f4a3c]/60">
                          {new Date(log.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${log.status === "success" ? "bg-[#006e1c]/10 text-[#006e1c]" : "bg-rose-100 text-rose-600"}`}
                        >
                          {log.full_name
                            ? log.full_name.substring(0, 2).toUpperCase()
                            : log.email_attempted.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#1a1c1c]">
                            {log.full_name || "Khách vãng lai"}
                          </span>
                          <span className="text-[11px] text-[#3f4a3c]/70 font-medium">
                            {log.email_attempted}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2.5">
                        {log.status === "success" ? (
                          <>
                            <CheckCircle2
                              size={16}
                              className="text-[#006e1c]"
                            />
                            <span className="text-sm font-medium text-[#006e1c]">
                              Đăng nhập thành công
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle
                              size={16}
                              className="text-rose-600"
                            />
                            <span className="text-sm font-bold text-rose-600">
                              Thất bại: {log.reason || "Sai mật khẩu"}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono text-[#3f4a3c]/60">
                        {log.ip_address}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 bg-[#f3f3f3]/20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1a1c1c]/5">
            <span className="text-xs text-[#3f4a3c] font-semibold">
              Hiển thị {logs.length} hoạt động gần nhất
            </span>
            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl border border-[#1a1c1c]/10 text-[#3f4a3c] hover:bg-white transition-all"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                    currentPage === number
                      ? "bg-gradient-to-br from-[#006e1c] to-[#4caf50] text-white font-bold text-sm shadow-md"
                      : "border border-[#1a1c1c]/10 text-[#3f4a3c] hover:bg-white transition-all"
                  }`}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ))}

              <button
                className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-xl border border-[#1a1c1c]/10 text-[#3f4a3c] hover:bg-white transition-all"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          <div className="bg-[#006e1c]/5 p-8 rounded-[2rem] border border-[#006e1c]/10 relative overflow-hidden group">
            <CheckCircle2
              size={80}
              className="absolute -right-4 -bottom-4 text-[#006e1c]/10 group-hover:scale-110 transition-transform duration-500"
            />
            <p className="text-[#006e1c] font-black text-xs uppercase tracking-[0.2em] mb-2">
              Thành công
            </p>
            <h3 className="text-5xl font-extrabold text-[#1a1c1c] tracking-tighter">
              {status.success}
            </h3>
            <p className="text-[#3f4a3c]/60 text-xs mt-3 flex items-center gap-1 font-medium">
              Lượt truy cập an toàn
            </p>
          </div>

          <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 relative overflow-hidden group">
            <AlertTriangle
              size={80}
              className="absolute -right-4 -bottom-4 text-amber-200/40 group-hover:scale-110 transition-transform duration-500"
            />
            <p className="text-amber-700 font-black text-xs uppercase tracking-[0.2em] mb-2">
              Cảnh báo
            </p>
            <h3 className="text-5xl font-extrabold text-[#1a1c1c] tracking-tighter">
              {status.failure}
            </h3>
            <p className="text-[#3f4a3c]/60 text-xs mt-3">
              Lượt đăng nhập thất bại
            </p>
          </div>

          <div className="bg-red-50 p-8 rounded-[2rem] border border-red-100 relative overflow-hidden group">
            <ShieldAlert
              size={80}
              className="absolute -right-4 -bottom-4 text-red-200/40 group-hover:scale-110 transition-transform duration-500"
            />
            <p className="text-red-600 font-black text-xs uppercase tracking-[0.2em] mb-2">
              Nghiêm trọng
            </p>
            <h3 className="text-5xl font-extrabold text-[#1a1c1c] tracking-tighter">
              {status.critical}
            </h3>
            <p className="text-red-600 font-bold text-xs mt-3 underline italic">
              Tài khoản bị khóa/xâm nhập
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LogsPage;
