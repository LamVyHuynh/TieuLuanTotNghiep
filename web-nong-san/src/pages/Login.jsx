import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { Leaf, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [frmDataLogin, setFrmDataLogin] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rememberLogin, setRememberLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // =================================================================
  // STATE TẠO HIỆU ỨNG TRƯỢT CHUYỂN TRANG
  // =================================================================
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

    if (path === "/" || path === -1) {
      setSlideDirection("translate-x-12");
    } else {
      setSlideDirection("-translate-x-12");
    }

    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 400);
  };

  const handleChange = (e) => {
    setFrmDataLogin({ ...frmDataLogin, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
    if (successMessage) setSuccessMessage("");
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleBlurEmail = () => {
    if (frmDataLogin.email.trim() !== "") {
      const isValid = validateEmail(frmDataLogin.email);
      setIsEmailValid(isValid);
    } else {
      setIsEmailValid(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!frmDataLogin.email || !frmDataLogin.password) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin đăng nhập");
      return;
    }
    setIsLoading(true);

    try {
      const response = await axiosClient.post("/auth/login", frmDataLogin);
      setSuccessMessage(response.data.message || "Đăng nhập thành công");

      const token = response.data.token;
      const user = response.data.user;

      login(user, token);

      if (rememberLogin) {
        localStorage.setItem("rememberEmail", frmDataLogin.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      setTimeout(() => {
        setSlideDirection("-translate-x-12"); // Đăng nhập thì tiến vào app
        setIsExiting(true);
        setTimeout(() => {
          if (user.role_id === 1) {
            navigate("/admin");
          } else if (user.role_id === 2) {
            navigate("/");
          }
        }, 400);
      }, 1000);

      setFrmDataLogin({ email: "", password: "" });
    } catch (error) {
      setSuccessMessage("");
      const serverMessage = error.response?.data?.message;
      setErrorMessage(serverMessage || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberEmail = localStorage.getItem("rememberEmail");
    if (rememberEmail) {
      setFrmDataLogin((prev) => ({ ...prev, email: rememberEmail }));
      setRememberLogin(true);
    }
  }, []);

  return (
    <main
      className={`min-h-screen bg-[#f9f9f9] p-4 text-slate-900 antialiased md:p-8 transform transition-all duration-500 ease-in-out ${
        isExiting ? `${slideDirection} opacity-0` : "translate-x-0 opacity-100"
      }`}
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-12px_rgba(26,28,28,0.08)] lg:grid-cols-12">
        <div className="flex flex-col justify-center p-8 md:p-12 lg:col-span-5 lg:p-16">
          <div className="mb-12">
            <div
              className="mb-3 leading-none cursor-pointer"
              onClick={() => handleNavigate("/")}
            >
              <span className="text-[2rem] font-black tracking-[-0.06em] text-emerald-600 sm:text-[2.35rem]">
                Healthy
              </span>
              <span className="ml-1 text-[2rem] font-black tracking-[-0.06em] text-amber-500 sm:text-[2.35rem]">
                GO
              </span>
            </div>
            <p className="text-sm font-semibold tracking-[-0.01em] text-slate-500 md:text-base">
              Chào mừng bạn quay trở lại với lối sống lành mạnh.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {successMessage && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-4 shadow-sm shadow-emerald-100/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Leaf size={20} fill="currentColor" fillOpacity={0.2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black tracking-tight text-emerald-900">
                    Chào mừng trở lại!
                  </h3>
                  <p className="text-xs font-medium text-emerald-600/90">
                    {successMessage}
                  </p>
                </div>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              </div>
            )}
            {errorMessage && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-rose-100 p-1 text-rose-600">
                  <Leaf size={14} className="rotate-180" />{" "}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-rose-800">
                    Lỗi đăng nhập
                  </p>
                  <p className="text-xs text-rose-600 font-medium">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500"
              >
                Địa chỉ email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={frmDataLogin.email}
                  onChange={handleChange}
                  onBlur={handleBlurEmail}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border-none bg-[#e2e2e2] py-4 pl-11 pr-4 text-sm font-semibold tracking-[-0.01em] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              {!isEmailValid && (
                <p className="mt-1 px-1 text-[11px] font-bold text-rose-500 uppercase tracking-wider">
                  Định dạng email không hợp lệ !
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500"
                >
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => handleNavigate("/forgot-password")}
                  className="text-xs font-bold tracking-[-0.01em] text-emerald-700 hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={frmDataLogin.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-none bg-[#e2e2e2] py-4 pl-11 pr-4 text-sm font-semibold tracking-[-0.01em] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded border-slate-300 text-emerald-700 focus:ring-emerald-300"
              />
              <label
                htmlFor="remember"
                className="cursor-pointer text-sm font-semibold tracking-[-0.01em] text-slate-500"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-4 text-base font-black tracking-[-0.02em] text-white shadow-lg transition-all active:scale-[0.98] 
    ${
      isLoading
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] shadow-emerald-700/20 hover:opacity-90"
    }`}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              <ArrowRight size={18} />
            </button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 font-bold tracking-[0.2em] text-slate-400">
                  Hoặc
                </span>
              </div>
            </div>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-slate-100 py-4 text-sm font-bold tracking-[-0.01em] text-slate-800 transition-all hover:bg-slate-200 active:scale-[0.98]"
            >
              <Leaf size={18} className="text-emerald-700" />
              Tiếp tục với Google
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-semibold tracking-[-0.01em] text-slate-500">
              Chưa có tài khoản?
              <button
                type="button"
                onClick={() => handleNavigate("/register")}
                className="ml-1 font-bold text-emerald-700 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Đăng ký miễn phí
              </button>
            </p>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-[#f3f3f3] lg:col-span-7 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/10 to-lime-200/20" />
          <div className="relative flex h-full w-full items-center justify-center p-12">
            <div className="relative h-full max-h-[700px] w-full overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80"
                alt="Rau củ hữu cơ trong giỏ gỗ"
                className="absolute inset-0 h-full w-full scale-110 object-cover transition-transform duration-1000 ease-out hover:scale-100"
              />
              <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-white/20 bg-white/40 p-8 backdrop-blur-md">
                <div className="mb-4 flex items-center gap-4">
                  <div className="rounded-full bg-emerald-100 p-2 text-emerald-800">
                    <Leaf size={22} />
                  </div>
                  <span className="text-lg font-black tracking-[-0.06em] text-emerald-900">
                    100% Hữu cơ
                  </span>
                </div>
                <h2 className="text-3xl font-black tracking-[-0.06em] text-slate-900">
                  Sức khỏe từ thiên nhiên
                </h2>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-700">
                  Chúng tôi mang những sản phẩm tươi sạch nhất từ trang trại đến
                  tận bàn ăn của gia đình bạn.
                </p>
              </div>
            </div>
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
