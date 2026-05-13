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
function TechAdminProtectedRoute({ element }) {
  const [isValidToken, setIsValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

  function TechAdminProtectedRoute({ element }) {
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tech_access_token");
    const role = localStorage.getItem("user_role");
    const isAdmin = JSON.parse(localStorage.getItem("is_admin") || "false");

    // if (token && role === "Tech Support" && isAdmin) {
    //   validateToken(token).then((res) => {
    //     setIsValid(res);
    //     setLoading(false);
    //   });
    // } else {
    //   setLoading(false);
    // }
  }, []);

 
  }

  if (loading) return <div>Loading...</div>;

  return isValidToken ? element : <Navigate to="/login" replace />;
}

export default TechAdminProtectedRoute;