import { AccountCircle, FormatListBulleted, HistoryRounded, Home } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Box, Paper } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import ROUTE_PATHS from "../../../V2/app/router/paths";

const TECH_SUPPORT_ROUTES = ROUTE_PATHS.technicalStaff;

const NAV_ITEMS = [
  {
    label: "Home",
    path: TECH_SUPPORT_ROUTES.home,
    icon: Home,
  },
  {
    label: "Complaints",
    path: TECH_SUPPORT_ROUTES.tasks,
    icon: FormatListBulleted,
  },
  {
    label: "Requests",
    path: TECH_SUPPORT_ROUTES.requests,
    icon: HistoryRounded,
  },
  {
    label: "Profile",
    path: TECH_SUPPORT_ROUTES.profile,
    icon: AccountCircle,
  },
];

const isActivePath = (pathname, path) =>
  pathname === path ||
  pathname.startsWith(`${path}/`) ||
  (path === TECH_SUPPORT_ROUTES.requests && pathname.startsWith("/tech-support/request/"));

function StaffBottomBar() {
  const location = useLocation();

  const activePath =
    NAV_ITEMS.find((item) => isActivePath(location.pathname, item.path))?.path ||
    TECH_SUPPORT_ROUTES.home;

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
              fontWeight: 800,
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
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default StaffBottomBar;
