import React from "react";
import { Route, Routes } from "react-router-dom";
import TechAdminProtectedRoute from "./TechAdminProtectedRoute"; // ✅ IMPORTANT
import Layout from "../../Admin/components/layout/Layout";

// Pages
import Dashboard from "../pages/dashboard";
import TechAdminCom from "../pages/TechAdminCom";
import TechAdminReq from "../pages/TechAdminReq";
import TechUserManagement from "../pages/TechUserManagement";

function TechAdminRoutes() {
  return (
    <Routes>

      <Route
        path="dashboard"
        element={
          <TechAdminProtectedRoute
            element={<Layout><Dashboard /></Layout>}
          />
        }
      />

      <Route
        path="complaints"
        element={
          <TechAdminProtectedRoute
            element={<Layout><TechAdminCom /></Layout>}
          />
        }
      />

      <Route
        path="requests"
        element={
          <TechAdminProtectedRoute
            element={<Layout><TechAdminReq /></Layout>}
          />
        }
      />

      <Route
        path="users"
        element={
          <TechAdminProtectedRoute
            element={<Layout><TechUserManagement /></Layout>}
          />
        }
      />

    </Routes>
  );
}

export default TechAdminRoutes;