import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Leaf, Mail, Lock, ArrowRight } from "lucide-react";

function Login() {
  const [frmDataLogin, setFrmDataLogin] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rememberLogin, setRememberLogin] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFrmDataLogin({ ...frmDataLogin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        frmDataLogin
      );

      setSuccessMessage(response.data.message || "Đăng nhập thành công");

      // Lưu dữ liệu của user đăng nhập vào localStorage để có thể sử dụng ở các trang khác
      // dùng response.data.token để lấy token từ response trả về của backend
      // const userData = response.data.data;
      const token = response.data.token;
      const user = response.data.user;
      // Lưu token vào localStorage để sử dụng cho các yêu cầu sau
      localStorage.setItem("accessToken", token);
      // Chuyển userData thành chuỗi JSON trước khi lưu vào localStorage vì localStorage chỉ lưu được chuỗi JSON
      // console.log("userData trước khi lưu vào localStorage:", userData);
      // localStorage.setItem("userDataLogin", JSON.stringify(userData));
      // console.log(
      //   "userData đã lưu vào localStorage:",
      //   JSON.parse(localStorage.getItem("userDataLogin"))
      // );

      // tạo ra tín hiệu event
      window.dispatchEvent(new Event("authChange"));

      setTimeout(() => {
        if (user.role_id === 1) {
          navigate("/admin");
          console.log("Qua trang admin");
        } else if (user.role_id === 2) {
          navigate("/");
          console.log("Qua trang user");
        }
      }, 1500);

      setFrmDataLogin({ email: "", password: "" });
      console.log("Login successful:", response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Đăng nhập thất bại"
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f9f9] p-4 text-slate-900 antialiased md:p-8">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-[0_24px_48px_-12px_rgba(26,28,28,0.08)] lg:grid-cols-12">
        <div className="flex flex-col justify-center p-8 md:p-12 lg:col-span-5 lg:p-16">
          <div className="mb-12">
            <div className="mb-3 leading-none">
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
            {errorMessage ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

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
                  placeholder="name@example.com"
                  className="w-full rounded-xl border-none bg-[#e2e2e2] py-4 pl-11 pr-4 text-sm font-semibold tracking-[-0.01em] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="password"
                  className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500"
                >
                  Mật khẩu
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold tracking-[-0.01em] text-emerald-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={frmDataLogin.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-none bg-[#e2e2e2] py-4 pl-11 pr-4 text-sm font-semibold tracking-[-0.01em] text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
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
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#006e1c_0%,#4caf50_100%)] py-4 text-base font-black tracking-[-0.02em] text-white shadow-lg shadow-emerald-700/20 transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Đăng nhập ngay
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
              <Link
                to="/register"
                className="ml-1 font-bold text-emerald-700 hover:underline"
              >
                Đăng ký miễn phí
              </Link>
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
