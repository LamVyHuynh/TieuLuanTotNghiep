import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/Common/LoadingSpinner";
function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Chưa đăng nhập
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  //   Đã đăng nhập nhưng không phải admin
  if (currentUser.role_id !== 1) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
