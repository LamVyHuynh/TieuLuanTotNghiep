import Home from "../pages/User/Home";
import Cart from "../pages/User/Cart";
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
import CategoriesPage from "../pages/admin/Categories";
import LogsPage from "../pages/admin/LogsPage";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AddressPage from "../pages/admin/Address";
import SearchPage from "../pages/User/SearchPage";
import SearchHistoryPage from "../pages/User/SearchHistoryPage";
const publicRoutes = [
  {
    // path :"/", element UserLayout là dùng dùng để bọc nguyên lại
    // tất cả các children bên trong sẽ render bên trong UserLayout
    path: "/",
    element: UserLayout,
    children: [
      { index: true, element: Home },
      { path: "cart", element: Cart },
      { path: "detail-product/:id", element: DetailProduct },
      { path: "checkout", element: CheckOut },
      { path: "login", element: Login },
      { path: "register", element: Register },
      { path: "order", element: Order },
      { path: "search", element: SearchPage },
      { path: "search-history", element: SearchHistoryPage },
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
          { path: "addresses", element: AddressPage },
          { path: "products", element: Products },
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
