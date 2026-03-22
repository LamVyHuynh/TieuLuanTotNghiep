import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, Package, Truck } from "lucide-react";

function Tracking() {
  const navigate = useNavigate();
  const currentStep = 2; // 1: Đã xác nhận, 2: Đang giao, 3: Đã nhận

  const steps = [
    { id: 1, label: "Đã xác nhận", icon: Package },
    { id: 2, label: "Đang giao", icon: Truck },
    { id: 3, label: "Đã nhận", icon: CheckCircle },
  ];

  return (
    <div className="mx-auto max-w-[920px] px-4 py-8 sm:px-6 lg:px-8">
      <button
        className="cursor-pointer mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Quay lại
      </button>

      <section className="mb-6 rounded-[26px] border border-emerald-100/70 bg-[linear-gradient(130deg,#f2fff7_0%,#ffffff_45%,#fff8ec_100%)] px-6 py-7 shadow-[0_18px_40px_rgba(15,23,42,0.06)] sm:px-8">
        <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-emerald-600 uppercase">
          Theo dõi đơn
        </p>
        <h2 className="text-3xl font-black tracking-[-0.03em] text-slate-900 sm:text-4xl">
          Theo dõi đơn hàng #12345
        </h2>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-7">
        <div className="relative pt-2">
          <div className="absolute top-8 right-[16.666%] left-[16.666%] h-[3px] rounded-full bg-slate-200" />
          <div
            className="absolute top-8 left-[16.666%] h-[3px] rounded-full bg-emerald-400 transition-all duration-500"
            style={{
              // Nếu currentStep = 1 => (1-1)/(3-1)=0=> Width = 0% => Không có thanh màu xanh nào cả
              // Nếu currentStep = 2 => (2-1)/(3-1)=0.5=> Width = 33.333% => Thanh màu xanh sẽ chiếm 1/3 chiều dài của thanh ngang
              // Nếu currentStep = 3 => (3-1)/(3-1)=1=> Width = 66.666% => Thanh màu xanh sẽ chiếm toàn bộ chiều dài của thanh ngang
              width: `${((currentStep - 1) / (steps.length - 1)) * 66.666}%`,
            }}
          />

          <div className="relative grid grid-cols-3 gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              {
                /* Số thức tự của bước đó <= bước hiện tại thì tao đậm xanh cả nền và viền
                vd step.id = 1 và currentStep= 2 => 1<=2 -> ĐÚNG -> Đậm xanh cả nền và viền
                  step.id = 2  và currentStep = 2 => 2=2 -> ĐÚNG -> Đậm xanh cả nền và viền
                  step.id = 3 và currentStep = 2 => 3> 2 -> SAO -> Không đậm xanh cả nền và viền
                 */
              }
              const isCompleted = step.id <= currentStep;

              {
                /* Chỉ khi nào mà step.id mà bằng với currentStep thì sẽ làm thêm viền ngoài để tạo điểm
              nhấn */
              }
              const isActive = step.id === currentStep;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_8px_18px_rgba(5,150,105,0.25)]"
                        : "border-slate-300 bg-slate-200 text-white"
                    } ${isActive ? "ring-4 ring-emerald-100" : ""}`}
                  >
                    <Icon size={20} />
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isCompleted ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-6">
        <h4 className="mb-4 text-lg font-black tracking-[-0.02em] text-slate-900">
          Chi tiết vận chuyển
        </h4>

        <div className="space-y-3 text-sm text-slate-600">
          <p className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
            <Clock size={16} className="text-slate-400" />
            Dự kiến giao:{" "}
            <span className="font-semibold text-slate-700">10/03/2026</span>
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">
            Địa chỉ:{" "}
            <span className="font-semibold text-slate-700">
              123 Đường 3/2, Cần Thơ
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Tracking;
