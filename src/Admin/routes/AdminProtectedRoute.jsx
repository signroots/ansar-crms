

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import BASE_URL from '../../utils/baseUrl';
// const BASE_URL = 'https://support.ansar.in/api';

const validateToken = async (token) =>
{
  try
  {
    const response = await fetch(`${ BASE_URL }/api/validate-token/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ token }`,
      },
    });

    if (response.ok)
    {
      return true; // Token is valid
    } else
    {
      return false; // Token is invalid
    }
  } catch (error)
  {
    console.error('Token validation failed:', error);
    return false; // In case of an error
  }
};

function AdminProtectedRoute({ element })
{
  const [isValidToken, setIsValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    const token = localStorage.getItem('admin_access_token');
    if (token)
    {
      // Validate the token on the backend
      validateToken(token).then((isValid) =>
      {
        setIsValidToken(isValid);
        setLoading(false);
      });
    } else
    {
      setLoading(false);
    }
  }, []);

  if (loading)
  {
    return <div>Loading...</div>;
  }

  return isValidToken ? element : <Navigate to="/" />;
}

export default AdminProtectedRoute;
