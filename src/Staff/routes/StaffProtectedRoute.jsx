import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');

    return token && role === "Tech Support";
};

function StaffProtectedRoute({ element })
{
    return isAuthenticated() ? element : <Navigate to="/" />;
}

export default StaffProtectedRoute;
