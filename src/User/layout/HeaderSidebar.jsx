import React, {
  useState,
  useEffect
} from 'react';

import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  CssBaseline,
  useMediaQuery,
  useTheme,
  Badge,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';

import {
  Menu as MenuIcon,
  Notifications,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

function HeaderSidebar()
{
  // ================= STATES =================
  const [openSidebar, setOpenSidebar] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [anchorEl, setAnchorEl] =
    useState(null);

  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down('sm')
  );

  const navigate = useNavigate();

  const openNotificationMenu =
    Boolean(anchorEl);

  // ================= SIDEBAR =================
  const toggleSidebar = () =>
  {
    setOpenSidebar(!openSidebar);
  };

  // ================= LOGOUT =================
  const Logout = () =>
  {
    localStorage.removeItem(
      "user_access_token"
    );

    localStorage.removeItem(
      "staff_id"
    );

    toast.success(
      'Logout Successfully'
    );

    navigate('/user/user-login');
  };

  // ================= WEBSOCKET =================
  useEffect(() =>
  {
    const token =
      localStorage.getItem(
        "user_access_token"
      );

    if (!token)
    {
      console.log(
        "❌ No Token Found"
      );

      return;
    }

    console.log(
      "✅ TOKEN:",
      token
    );

    // ✅ WEBSOCKET CONNECT
    const socket = new WebSocket(
      `ws://127.0.0.1:8001/ws/notifications/?token=${token}`
    );

    // ================= CONNECT =================
    socket.onopen = () =>
    {
      console.log(
        "✅ WebSocket Connected"
      );
    };

    // ================= RECEIVE =================
    socket.onmessage = (event) =>
    {
      console.log(
        "🔥 RAW MESSAGE:",
        event.data
      );

      try
      {
        const data = JSON.parse(
          event.data
        );

        console.log(
          "✅ PARSED:",
          data
        );

        // ✅ SAVE NOTIFICATION
        setNotifications((prev) => [
          data,
          ...prev,
        ]);

        // ✅ TOAST
        toast.info(
          data?.message?.body ||
          "New Notification"
        );

      } catch (error)
      {
        console.log(
          "❌ JSON ERROR:",
          error
        );
      }
    };

    // ================= ERROR =================
    socket.onerror = (error) =>
    {
      console.log(
        "❌ SOCKET ERROR:",
        error
      );
    };

    // ================= CLOSE =================
    socket.onclose = () =>
    {
      console.log(
        "⚠️ WebSocket Closed"
      );
    };

    // ================= CLEANUP =================
    return () =>
    {
      socket.close();
    };

  }, []);

  // ================= OPEN MENU =================
  const handleNotificationOpen =
    (event) =>
    {
      setAnchorEl(
        event.currentTarget
      );
    };

  // ================= CLOSE MENU =================
  const handleNotificationClose =
    () =>
    {
      setAnchorEl(null);
    };

  // ================= CLICK NOTIFICATION =================
  const handleNotificationClick =
    (notification) =>
    {
      console.log(
        "🔔 CLICKED:",
        notification
      );

      const requestId =
        notification?.message
          ?.request_id;

      if (requestId)
      {
        navigate(
          `/user/request/${requestId}`
        );

      } else
      {
        navigate(
          '/user/user-home'
        );
      }

      handleNotificationClose();
    };

  return (

    <Box
      sx={{
        display: 'flex',
        width: '100%'
      }}
    >

      {/* ================= SIDEBAR ================= */}
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,

          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing:
              'border-box',
          },
        }}

        variant={
          isMobile
            ? 'temporary'
            : 'persistent'
        }

        anchor="left"

        open={openSidebar}

        onClose={() =>
          setOpenSidebar(false)
        }

        ModalProps={{
          keepMounted: true,
        }}
      >

        <List>

          <ListItem>
            <ListItemText primary="Developer" />
          </ListItem>

          <ListItem>
            <ListItemText primary="About" />
          </ListItem>

          <ListItem
            onClick={Logout}
            sx={{
              cursor: 'pointer'
            }}
          >
            <ListItemText primary="Logout" />
          </ListItem>

        </List>

      </Drawer>

      {/* ================= HEADER ================= */}
      <CssBaseline />

      <AppBar
        position="sticky"

        sx={{
          zIndex: (theme) =>
            theme.zIndex.drawer + 1,

          backgroundColor: 'white',

          boxShadow: 'none',
        }}
      >

        <Toolbar>

          {/* ================= MOBILE MENU ================= */}
          {isMobile && (

            <IconButton
              edge="start"
              aria-label="menu"
              onClick={toggleSidebar}

              sx={{
                mr: 1,
                color: 'black'
              }}
            >

              <MenuIcon />

            </IconButton>

          )}

          {/* ================= LOGO ================= */}
          <Typography
            variant="h6"
            noWrap

            sx={{
              color: 'black',
              flexGrow: 1,
            }}
          >
            Ansar
          </Typography>

          {/* ================= NOTIFICATION ICON ================= */}
          <IconButton
            onClick={
              handleNotificationOpen
            }
          >

            <Badge
              badgeContent={
                notifications.length
              }
              color="error"
            >

              <Notifications
                sx={{
                  color: 'black'
                }}
              />

            </Badge>

          </IconButton>

          {/* ================= NOTIFICATION MENU ================= */}
          <Menu
            anchorEl={anchorEl}

            open={
              openNotificationMenu
            }

            onClose={
              handleNotificationClose
            }

            PaperProps={{
              style: {
                width: 320,
                maxHeight: 400,
              },
            }}
          >

            {notifications.length === 0 ? (

              <MenuItem>
                No Notifications
              </MenuItem>

            ) : (

              notifications.map(
                (
                  notification,
                  index
                ) => (

                  <Box key={index}>

                    <MenuItem
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }

                      sx={{
                        whiteSpace:
                          'normal',

                        alignItems:
                          'flex-start',
                      }}
                    >

                      <Box>

                        {/* TITLE */}
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                        >

                          {
                            notification
                              ?.message
                              ?.title ||

                            "Notification"
                          }

                        </Typography>

                        {/* BODY */}
                        <Typography
                          variant="body2"
                        >

                          {
                            notification
                              ?.message
                              ?.body ||

                            "New Notification"
                          }

                        </Typography>

                        {/* PRIORITY */}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >

                          Priority :

                          {" "}

                          {
                            notification
                              ?.message
                              ?.priority ||

                            "N/A"
                          }

                        </Typography>

                      </Box>

                    </MenuItem>

                    {/* DIVIDER */}
                    {index !==
                      notifications.length - 1 && (
                        <Divider />
                      )}

                  </Box>

                )
              )

            )}

          </Menu>

        </Toolbar>

      </AppBar>

    </Box>

  );
}

export default HeaderSidebar;