/* eslint-disable react/prop-types */
import ProtectedRoute from '../../V2/app/router/ProtectedRoute';
import { ROLE_GROUPS } from '../../V2/shared/constants/roles';

function AdminProtectedRoute({ element }) {
  return (
    <ProtectedRoute allowedRoles={ROLE_GROUPS.SUPER_ADMIN}>
      {element}
    </ProtectedRoute>
  );
}

export default AdminProtectedRoute;
