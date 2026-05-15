/* eslint-disable react/prop-types */
import ProtectedRoute from '../../V2/app/router/ProtectedRoute';
import { ROLE_GROUPS } from '../../V2/shared/constants/roles';

function StaffProtectedRoute({ element })
{
    return (
        <ProtectedRoute allowedRoles={ROLE_GROUPS.TECHNICAL_STAFF}>
            {element}
        </ProtectedRoute>
    );
}

export default StaffProtectedRoute;
