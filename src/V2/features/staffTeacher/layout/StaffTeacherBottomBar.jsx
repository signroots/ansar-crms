import AccountCircle from "@mui/icons-material/AccountCircle";
import Article from "@mui/icons-material/Article";
import AssignmentLate from "@mui/icons-material/AssignmentLate";
import Home from "@mui/icons-material/Home";
import { BottomNavigation, BottomNavigationAction, Box, Paper } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import ROUTE_PATHS from "../../../app/router/paths";

const STAFF_TEACHER_ROUTES = ROUTE_PATHS.staffTeacher;

const NAV_ITEMS = [
  {
    label: "Home",
    path: STAFF_TEACHER_ROUTES.home,
    icon: Home,
  },
  {
    label: "Complaints",
    path: STAFF_TEACHER_ROUTES.allComplaints,
    icon: AssignmentLate,
  },
  {
    label: "Requests",
    path: STAFF_TEACHER_ROUTES.allRequests,
    icon: Article,
  },
  {
    label: "Profile",
    path: STAFF_TEACHER_ROUTES.profile,
    icon: AccountCircle,
  },
];

const isActivePath = (pathname, path) =>
  pathname === path ||
  pathname.startsWith(`${path}/`) ||
  (path === STAFF_TEACHER_ROUTES.allRequests && pathname.startsWith("/user/request/"));

function StaffTeacherBottomBar() {
  const location = useLocation();

  const resetStaffPreview = () => {
    window.dispatchEvent(new Event("staffTeacher:navigation"));
  };

  const activePath =
    NAV_ITEMS.find((item) => isActivePath(location.pathname, item.path))?.path ||
    STAFF_TEACHER_ROUTES.home;

  return (
    <Box
      sx={{
        position: "fixed",
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1200,
        px: 1.25,
        pb: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
        pointerEvents: "none",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 520,
          mx: "auto",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(226, 232, 240, 0.95)",
          bgcolor: "rgba(255, 255, 255, 0.96)",
          boxShadow: "0 16px 36px rgba(15, 118, 110, 0.12)",
          backdropFilter: "blur(18px)",
          pointerEvents: "auto",
        }}
      >
        <BottomNavigation
          showLabels
          value={activePath}
          sx={{
            height: 72,
            bgcolor: "transparent",
            px: 0.75,
            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              maxWidth: "none",
              mx: 0.25,
              my: 0.75,
              borderRadius: 3,
              color: "#64748b",
              transition: "background-color 180ms ease, color 180ms ease, transform 180ms ease",
            },
            "& .MuiBottomNavigationAction-label": {
              mt: 0.25,
              fontSize: 11,
              fontWeight: 600,
              opacity: 1,
              letterSpacing: 0,
            },
            "& .MuiBottomNavigationAction-root.Mui-selected": {
              bgcolor: "#ecfeff",
              color: "#0f766e",
              border: "1px solid #bae6fd",
              transform: "translateY(-1px)",
            },
            "& .MuiBottomNavigationAction-root.Mui-selected .MuiSvgIcon-root": {
              color: "#0891b2",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 23,
            },
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <BottomNavigationAction
                key={item.path}
                component={Link}
                to={item.path}
                value={item.path}
                label={item.label}
                icon={<Icon />}
                onClick={resetStaffPreview}
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default StaffTeacherBottomBar;
