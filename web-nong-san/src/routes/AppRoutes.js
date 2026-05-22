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
import CategoriesPage from "../pages/admin/Categories";
import LogsPage from "../pages/admin/LogsPage";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import UpdateUserInfo from "../pages/User/UpdateUserInfo/ProfilePage";

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
      { path: "profile", element: UpdateUserInfo },
    ],
  },
  {
    path: "/admin",
    element: ProtectedRoute,
    children: [
      {
        path: "",
        element: AdminLayout,
        children: [
          { index: true, element: Dashboard },
          { path: "users", element: Users },
          { path: "products", element: Products },
          { path: "stores", element: Stores },
          { path: "categories", element: CategoriesPage },
          { path: "orders", element: Orders },
          { path: "reports", element: Reports },
          { path: "logs", element: LogsPage },
        ],
      },
    ],
  },
];

export { publicRoutes };
