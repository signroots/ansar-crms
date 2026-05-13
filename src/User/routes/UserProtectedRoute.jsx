// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const isAuthenticated = () => {
//   return localStorage.getItem('user_access_token') !== null;
// };

// function UserProtectedRoute({ element }) {
//   return isAuthenticated() ? element : <Navigate to="/" />;
// }

// export default UserProtectedRoute;
import React from "react";
import { Navigate } from "react-router-dom";

const UserProtectedRoute = ({ element }) => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/user/user-login" replace />;
  }

  return element;
};

export default UserProtectedRoute;