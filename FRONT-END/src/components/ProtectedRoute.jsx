import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    if (location.pathname.includes("owner")) {
      return <Navigate to="/owner-login" replace />;
    }

    if (location.pathname.includes("admin")) {
      return <Navigate to="/admin-login" replace />;
    }

    return <Navigate to="/customer-login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === "owner") {
      return <Navigate to="/owner-dashboard" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    return <Navigate to="/vehicles" replace />;
  }

  return children;
}

export default ProtectedRoute;
