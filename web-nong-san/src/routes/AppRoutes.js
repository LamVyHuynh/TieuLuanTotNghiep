import Home from "../pages/User/Home";
import Cart from "../pages/User/Cart";
import Tracking from "../pages/User/Tracking";
import DetailProduct from "../pages/User/DetailProduct";
import CheckOut from "../pages/User/CheckOut";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Order from "../pages/User/Order";
import Dashboard from "../pages/admin/Dashboard";
const publicRoutes = [
  { path: "/", element: Home },
  { path: "/cart", element: Cart },
  { path: "/tracking", element: Tracking },
  { path: "/detail-product/:id", element: DetailProduct },
  { path: "/checkout", element: CheckOut },
  { path: "/login", element: Login },
  { path: "/register", element: Register },
  { path: "/order", element: Order },
  { path: "/admin/dashboard", element: Dashboard },
];

export { publicRoutes };
