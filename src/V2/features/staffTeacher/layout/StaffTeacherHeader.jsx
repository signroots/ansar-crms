import { useEffect, useState } from "react";

import Notifications from "@mui/icons-material/Notifications";
import School from "@mui/icons-material/School";
import {
  AppBar,
  Badge,
  Box,
  Divider,
  IconButton,
  Menu as MuiMenu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import ROUTE_PATHS from "../../../app/router/paths";
import { env } from "../../../config/env";
import { getAuthSession } from "../../../shared/utils/authSession";

const STAFF_TEACHER_ROUTES = ROUTE_PATHS.staffTeacher;

const getNotificationText = (notification, key, fallback) =>
  notification?.message?.[key] || fallback;

const isRequestsDetailPath = (pathname) => pathname.startsWith("/user/request/");

const isActivePath = (pathname, path) =>
  pathname === path ||
  pathname.startsWith(`${path}/`) ||
  (path === STAFF_TEACHER_ROUTES.allRequests && isRequestsDetailPath(pathname));

const getCurrentPageTitle = (pathname) => {
  if (isActivePath(pathname, STAFF_TEACHER_ROUTES.allComplaints)) {
    return "Complaints";
  }

  if (isActivePath(pathname, STAFF_TEACHER_ROUTES.allRequests)) {
    return "Requests";
  }

  if (isActivePath(pathname, STAFF_TEACHER_ROUTES.profile)) {
    return "Profile";
  }

  if (
    isActivePath(pathname, STAFF_TEACHER_ROUTES.requests) ||
    isActivePath(pathname, STAFF_TEACHER_ROUTES.legacyRequestForm)
  ) {
    return "New Request";
  }

  if (isActivePath(pathname, STAFF_TEACHER_ROUTES.complaints)) {
    return "New Complaint";
  }

  return "Dashboard";
};

function StaffTeacherHeader() {
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const pageTitle = getCurrentPageTitle(location.pathname);
  const openNotificationMenu = Boolean(notificationAnchor);

  useEffect(() => {
    const { accessToken: token } = getAuthSession();

    if (!token) {
      return undefined;
    }

    const socket = new WebSocket(`${env.wsUrl}/ws/notifications/?token=${token}`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setNotifications((prev) => [data, ...prev]);
        toast.info(getNotificationText(data, "body", "New Notification"));
      } catch (error) {
        console.error("Notification parse error:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Notification socket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationClick = (notification) => {
    const requestId = notification?.message?.request_id;

    if (requestId) {
      navigate(`/user/request/${requestId}`);
    } else {
      navigate(STAFF_TEACHER_ROUTES.home);
    }

    handleNotificationClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: alpha("#ffffff", 0.94),
        color: "#0f172a",
        borderBottom: "1px solid #e2e8f0",
        backdropFilter: "blur(16px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 68, sm: 76 },
          px: { xs: 1.5, sm: 2.5 },
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "#ecfeff",
            color: "#0f766e",
            border: "1px solid #cffafe",
            flex: "0 0 auto",
          }}
        >
          <School />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#64748b",
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            Ansar Desk
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, mt: 0.25 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                color: "#0f172a",
                fontSize: { xs: 17, sm: 20 },
                fontWeight: 700,
                letterSpacing: 0,
                lineHeight: 1.2,
              }}
            >
              {pageTitle}
            </Typography>
          </Stack>
        </Box>

        <Tooltip title="Notifications">
          <IconButton
            aria-label="Notifications"
            onClick={handleNotificationOpen}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "#f8fafc",
              color: "#0f766e",
              border: "1px solid #dbeafe",
              "&:hover": { bgcolor: "#ecfeff" },
            }}
          >
            <Badge badgeContent={notifications.length} color="error" overlap="circular">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        <MuiMenu
          anchorEl={notificationAnchor}
          open={openNotificationMenu}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              width: 330,
              maxWidth: "calc(100vw - 24px)",
              maxHeight: 420,
              mt: 1,
              borderRadius: 3,
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
              border: "1px solid #e2e8f0",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
              Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              {notifications.length} pending
            </Typography>
          </Box>
          <Divider />

          {notifications.length === 0 ? (
            <MenuItem disabled sx={{ py: 2 }}>
              No Notifications
            </MenuItem>
          ) : (
            notifications.map((notification, index) => (
              <Box key={`${getNotificationText(notification, "title", "Notification")}-${index}`}>
                <MenuItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    alignItems: "flex-start",
                    whiteSpace: "normal",
                    px: 2,
                    py: 1.4,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                      {getNotificationText(notification, "title", "Notification")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#475569", mt: 0.25 }}>
                      {getNotificationText(notification, "body", "New Notification")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#0f766e",
                        display: "block",
                        fontWeight: 600,
                        mt: 0.75,
                      }}
                    >
                      Priority: {getNotificationText(notification, "priority", "N/A")}
                    </Typography>
                  </Box>
                </MenuItem>

                {index !== notifications.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </MuiMenu>
      </Toolbar>
    </AppBar>
  );
}

export default StaffTeacherHeader;
