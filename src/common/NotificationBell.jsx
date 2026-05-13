import React, { useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ notifications = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // ✅ CLICK HANDLER
  const handleNotificationClick = (n) => {
    const complaintId = n?.message?.complaint_id;

    if (complaintId) {
      // 👉 navigate to complaint page
      navigate(`/admin/complaints/${complaintId}`);
    } else {
      // fallback
      navigate("/admin/complaints");
    }

    handleClose();
  };

  return (
    <Box>
      {/* 🔔 Bell */}
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* 📩 Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { width: 300, maxHeight: 400 },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem onClick={handleClose}>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((n, i) => (
            <React.Fragment key={i}>
              <MenuItem
                onClick={() => handleNotificationClick(n)}
                alignItems="flex-start"
                sx={{ whiteSpace: "normal", cursor: "pointer" }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {n?.message?.title || "Notification"}
                  </Typography>

                  <Typography variant="body2">
                    {n?.message?.body || "New notification"}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Priority: {n?.message?.priority || "N/A"}
                  </Typography>
                </Box>
              </MenuItem>

              {i !== notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </Menu>
    </Box>
  );
};

export default NotificationBell;