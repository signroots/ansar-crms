import { Navigate } from "react-router-dom";
import { USER_ROLES } from "../../shared/constants/roles";
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

  if (requireAdmin && !session.isAdmin && session.role !== USER_ROLES.DEPARTMENT_ADMIN) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
