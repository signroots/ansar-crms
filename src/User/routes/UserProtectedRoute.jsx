/* eslint-disable react/prop-types */
import ProtectedRoute from "../../V2/app/router/ProtectedRoute";
import { ROLE_GROUPS } from "../../V2/shared/constants/roles";

const UserProtectedRoute = ({ element }) => {
  return (
    <ProtectedRoute allowedRoles={ROLE_GROUPS.STAFF_TEACHER}>
      {element}
    </ProtectedRoute>
  );
};

export default UserProtectedRoute;
