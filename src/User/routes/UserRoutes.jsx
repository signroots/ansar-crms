import React, { useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Auth from "../pages/Auth";
import UserLayout from "../layout/UserLayout";
import Home from "../pages/Home";
import UserProfile from "../pages/UserProfile";
import UserProtectedRoute from "./UserProtectedRoute";
import ComplaintForm from "../pages/ComplaintForm";
import RequestForm from "../pages/RequestForm";
import AllRequests from "../pages/AllRequests";
import AllComplaints from "../pages/AllComplaints";
// import TechAdminHome from "../pages/TechAdminHome";
import Layout from "../components/layout/Layout";

function UserRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = () => {
      const role = localStorage.getItem("user_role");
      const isAdmin = localStorage.getItem("is_admin") === "true";

      if (role === "Staff") {
        navigate("/user/user-home", { replace: true });
      } 
        
      
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  return (
    <Routes>
      {/* LOGIN */}
      <Route path="user-login" element={<Auth />} />

      {/* NORMAL USER HOME */}
      <Route
        path="user-home"
        element={
          <UserProtectedRoute
            element={
              <UserLayout>
                <Home />
              </UserLayout>
            }
          />
        }
      />

      {/* TECH SUPPORT ADMIN HOME */}
      {/* <Route
        path="admin-home"
        element={
          <UserProtectedRoute
            element={
              <Layout>
                <TechAdminHome />
              </Layout>
            }
          />
        }
      /> */}

      {/* REQUEST FORM */}
      <Route
        path="user-/user/admin/requests"
        element={
          <UserProtectedRoute
            element={
              <UserLayout>
                <RequestForm />
              </UserLayout>
            }
          />
        }
      />

        <Route
        path="user-requests"
        element={
          <UserProtectedRoute
            element={
              <UserLayout>
                <RequestForm />
              </UserLayout>
            }
          />
        }
      />

      {/* COMPLAINT FORM */}
      <Route
        path="user-complaints"
        element={
          <UserProtectedRoute
            element={
              <UserLayout>
                <ComplaintForm />
              </UserLayout>
            }
          />
        }
      />

      {/* ALL REQUESTS */}
      <Route
        path="user-all-requests"
        element={
          <UserProtectedRoute
            element={
              <UserLayout>
                <AllRequests />
              </UserLayout>
            }
          />
        }
      />

      {/* ALL COMPLAINTS */}
      <Route
        path="user-all-complaints"
        element={
          <UserProtectedRoute
            element={
              <UserLayout>
                <AllComplaints />
              </UserLayout>
            }
          />
        }
      />

      {/* PROFILE */}
      <Route
        path="user-profile"
        element={
          <UserProtectedRoute
            element={
              <UserLayout>
                <UserProfile />
              </UserLayout>
            }
          />
        }
      />
    </Routes>
  );
}

export default UserRoutes;