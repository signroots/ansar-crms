import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import BASE_URL from '../../utils/baseUrl';

const validateToken = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/validate-token/`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
};

function AdminProtectedRoute({ element }) {
  const [isValidToken, setIsValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');// must match login
    if (token) {
      validateToken(token).then((isValid) => {
        setIsValidToken(isValid);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return isValidToken ? element : <Navigate to="/login" replace />;
}

export default AdminProtectedRoute;