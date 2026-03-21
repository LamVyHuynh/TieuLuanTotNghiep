import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Tracking from "../pages/Tracking";
import DetailProduct from "../pages/DetailProduct";
import CheckOut from "../pages/CheckOut";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Order from "../pages/Order";
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
