 
import { Fragment, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Badge, Box, Divider, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ iconColor = "inherit", notifications = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    const complaintId = notification?.message?.complaint_id;

    if (complaintId) {
      navigate(`/admin/complaints/${complaintId}`);
    } else {
      navigate("/admin/complaints");
    }

    handleClose();
  };

  return (
    <Box>
      <IconButton onClick={handleOpen} sx={{ color: iconColor }}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        onClose={handleClose}
        open={open}
        PaperProps={{
          style: { width: 300, maxHeight: 400 },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem onClick={handleClose}>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <Fragment key={`${notification?.message?.title || "notification"}-${index}`}>
              <MenuItem
                alignItems="flex-start"
                onClick={() => handleNotificationClick(notification)}
                sx={{ whiteSpace: "normal", cursor: "pointer" }}
              >
                <Box>
                  <Typography fontWeight="bold" variant="subtitle2">
                    {notification?.message?.title || "Notification"}
                  </Typography>

                  <Typography variant="body2">
                    {notification?.message?.body || "New notification"}
                  </Typography>

                  <Typography color="text.secondary" variant="caption">
                    Priority: {notification?.message?.priority || "N/A"}
                  </Typography>
                </Box>
              </MenuItem>

              {index !== notifications.length - 1 && <Divider />}
            </Fragment>
          ))
        )}
      </Menu>
    </Box>
  );
};

export default NotificationBell;
