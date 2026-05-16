import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NotFound from "../../shared/components/NotFound";
import AppProviders from "../providers/AppProviders";
import ROUTE_PATHS from "./paths";
import { appRoutes } from "./routeConfig";

function AppRouter() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          <Route path={ROUTE_PATHS.root} element={<Navigate to={ROUTE_PATHS.login} replace />} />
          {appRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path={ROUTE_PATHS.notFound} element={<NotFound />} />
        </Routes>

        <ToastContainer position="bottom-right" />
      </Router>
    </AppProviders>
  );
}

export default AppRouter;
