import { Navigate } from "react-router-dom";

import {
  clearAuthSession,
  getAuthenticatedHomePath,
  getAuthSession,
} from "../../shared/utils/authSession";

function PublicRoute({ children }) {
  const session = getAuthSession();

  if (session.accessToken) {
    const authenticatedPath = getAuthenticatedHomePath(session);

    if (authenticatedPath !== "/login") {
      return <Navigate to={authenticatedPath} replace />;
    }

    clearAuthSession();
  }

  return children;
}

export default PublicRoute;
