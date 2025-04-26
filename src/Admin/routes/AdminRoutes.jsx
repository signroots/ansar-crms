  import React from 'react';
  import { Route, Routes } from 'react-router-dom';
  import Authentication from '../pages/Authentication';
  import Layout from '../components/layout/Layout';
  import Dashboard from '../pages/Dashboard';
  import UserManage from '../pages/UserManage';
  import StaffManage from '../pages/StaffManage';
  import AdminProtectedRoute from './AdminProtectedRoute';
  import Complaints from '../pages/Complaints';
  import Requests from '../pages/Requests';
// import FeedbackList from '../pages/Feedback';
// import StudentInfoPage from '../pages/StudentInfo';

  function AdminRoutes()
  {
    return (
      <Routes>
        <Route path="auth" element={<Authentication />} />

        <Route
          path="dashboard"
          element={
            <AdminProtectedRoute element={<Layout><Dashboard /></Layout>} />
          }
        />
      
        <Route
          path="complaints"
          element={
            <AdminProtectedRoute element={<Layout><Complaints/></Layout>} />
          }
        />
        <Route
          path="requests"
          element={
            <AdminProtectedRoute element={<Layout><Requests/></Layout>} />
          }
        />
        <Route
          path="user-manage"
          element={
            <AdminProtectedRoute element={<Layout><UserManage /></Layout>} />
          }
        />
       
        <Route
          path="staff-manage"
          element={
            <AdminProtectedRoute element={<Layout><StaffManage /></Layout>} />
          }
        />
      </Routes>
    );
  }

  export default AdminRoutes;
