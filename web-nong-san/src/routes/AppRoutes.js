import Home from "../pages/User/Home";
import Cart from "../pages/User/Cart";
import Tracking from "../pages/User/Tracking";
import DetailProduct from "../pages/User/DetailProduct";
import CheckOut from "../pages/User/CheckOut";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Order from "../pages/User/Order";
import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Products from "../pages/admin/Products";
import Reports from "../pages/admin/Reports";
import Orders from "../pages/admin/Orders";
import Stores from "../pages/admin/Stores";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";

const publicRoutes = [
  {
    // path :"/", element UserLayout là dùng dùng để bọc nguyên lại
    // tất cả các children bên trong sẽ render bên trong UserLayout
    path: "/",
    element: UserLayout,
    children: [
      { index: true, element: Home },
      { path: "cart", element: Cart },
      { path: "tracking", element: Tracking },
      { path: "detail-product/:id", element: DetailProduct },
      { path: "checkout", element: CheckOut },
      { path: "login", element: Login },
      { path: "register", element: Register },
      { path: "order", element: Order },
    ],
  },
  {
    path: "/admin",
    element: AdminLayout,
    children: [
      { index: true, element: Dashboard },
      { path: "users", element: Users },
      { path: "products", element: Products },
      { path: "stores", element: Stores },
      { path: "orders", element: Orders },
      { path: "reports", element: Reports },
    ],
  },
];

export { publicRoutes };
