import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = ({ roles, requireVerifiedDoctor = false }) => {
  const { user, loading } = useAuth();

  // Wait until auth state is loaded
  if (loading) {
    return null;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Verified doctor check
  if (requireVerifiedDoctor && !user.verified) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
