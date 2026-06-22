import { Navigate, useLocation, Outlet } from "react-router-dom";
import useAuthStore from "../../store/auth.store";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
