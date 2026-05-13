import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminRoutes from './Admin/routes/AdminRoutes';
import UserRoutes from './User/routes/UserRoutes';
import StaffRoutes from './Staff/routes/StaffRoutes';
import NotFound from './common/NotFound';
import Landing from './common/Landing';
import FeedbackList from "./Admin/pages/Feedback";
import StudentInfoPage from "./Admin/pages/StudentInfo";
import AdminProtectedRoute from './Admin/routes/AdminProtectedRoute';
import Layout from './Admin/components/layout/Layout';
// import NotificationBell from "./components/NotificationBell";
import TechAdminRoutes from "./TechAdmin/routes/TechAdminProtectedRoute";

function App()
{


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/user/*" element={<UserRoutes />} />
        <Route path="/tech-support/*" element={<StaffRoutes />} />
        <Route path="/tech-admin/*" element={<TechAdminRoutes />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Landing />} />
        <Route
          path="/ansar/feedback-manage"
          element={
            <AdminProtectedRoute element={<StudentInfoPage />} />
          }
        />
        <Route
          path="ansar/feedback-manage/list"
          element={
            <AdminProtectedRoute element={<FeedbackList />} />
          }
        />
      </Routes>
           
      <ToastContainer
        position='bottom-right'
      />
    </Router>
  );
}

export default App;
