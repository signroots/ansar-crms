import { Navigate } from "react-router-dom";
import { getAuthSession } from "../../shared/utils/authSession";

function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAdmin = false,
  redirectTo = "/login",
}) {
  const session = getAuthSession();

  if (!session.accessToken) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && !session.isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
