/* eslint-disable react/prop-types */
import { forwardRef, useEffect, useState } from "react";
import { Button, Dropdown, Offcanvas } from "react-bootstrap";
import { BsBell } from "react-icons/bs";
import { FaPowerOff } from "react-icons/fa6";
import { LuUser } from "react-icons/lu";
import { MdDarkMode, MdFullscreen, MdLightMode } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import NotificationBell from "../../../common/NotificationBell";
import { env } from "../../../V2/config/env";
import { ADMIN_LAYOUT_THEME_NAMES } from "./layoutTheme";
import { clearAuthSession, getAuthSession } from "../../../V2/shared/utils/authSession";

const styles = {
  header: (theme) => ({
    margin: "12px 12px 0",
    minHeight: "72px",
    padding: "12px 16px",
    background: theme.header.background,
    border: `1px solid ${theme.header.border}`,
    borderRadius: "18px",
    boxShadow: theme.header.shadow,
    color: theme.header.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
    zIndex: 10,
  }),
  left: {
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    gap: "12px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    gap: "10px",
  },
  brandMark: (theme) => ({
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: theme.header.brandMark,
    color: "#ffffff",
    fontWeight: 800,
    flexShrink: 0,
  }),
  brandCopy: {
    minWidth: 0,
  },
  brandTitle: (theme) => ({
    margin: 0,
    color: theme.header.text,
    fontSize: "16px",
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "0",
  }),
  brandSubtitle: (theme) => ({
    display: "block",
    marginTop: "2px",
    color: theme.header.muted,
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.2,
  }),
  actions: {
    alignItems: "center",
    gap: "10px",
  },
  iconButton: (theme) => ({
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    border: `1px solid ${theme.header.buttonBorder}`,
    background: theme.header.buttonBackground,
    color: theme.header.buttonColor,
    display: "grid",
    placeItems: "center",
    padding: 0,
    lineHeight: 1,
    transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
  }),
  notificationSlot: (theme) => ({
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    border: `1px solid ${theme.header.buttonBorder}`,
    background: theme.header.buttonBackground,
    display: "grid",
    placeItems: "center",
  }),
  dropdownMenu: (theme) => ({
    marginTop: "10px",
    padding: "8px",
    borderRadius: "14px",
    border: `1px solid ${theme.header.border}`,
    background: theme.header.background,
    boxShadow: theme.header.shadow,
  }),
  dropdownItem: {
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    fontWeight: 600,
  },
  panel: (theme) => ({
    background: theme.header.background,
    color: theme.header.text,
  }),
  notificationItem: (theme) => ({
    padding: "12px 0",
    borderBottom: `1px solid ${theme.header.border}`,
  }),
  notificationTitle: (theme) => ({
    color: theme.header.text,
    fontWeight: 700,
  }),
  notificationBody: (theme) => ({
    color: theme.header.muted,
    marginTop: "4px",
  }),
  notificationMeta: (theme) => ({
    color: theme.header.muted,
    display: "block",
    marginTop: "6px",
  }),
};

const ProfileToggle = forwardRef(({ children, onClick, style }, ref) => (
  <button
    aria-label="Open profile menu"
    onClick={(event) => {
      event.preventDefault();
      onClick(event);
    }}
    ref={ref}
    style={style}
    type="button"
  >
    {children}
  </button>
));

ProfileToggle.displayName = "ProfileToggle";

function Header({ theme, themeName, toggleSidebar, toggleTheme }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const isDarkMode = themeName === ADMIN_LAYOUT_THEME_NAMES.DARK;

  const enterFullScreen = () => {
    const el = document.documentElement;

    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const adminLogout = () => {
    clearAuthSession();
    toast.success("Logout Successfully");
    navigate("/login");
  };

  useEffect(() => {
    const { accessToken: token } = getAuthSession();

    if (!token) return undefined;

    const socket = new WebSocket(`${env.wsUrl}/ws/notifications/?token=${token}`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        toast.success(data?.message?.body || "New Notification");

        setNotifications((prev) => {
          const exists = prev.some(
            (notification) =>
              notification?.message?.body === data?.message?.body &&
              notification?.message?.title === data?.message?.title,
          );

          if (exists) return prev;

          return [data, ...prev];
        });
      } catch (err) {
        console.error("Invalid notification payload:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("Notification socket error:", err);
    };

    return () => socket.close();
  }, []);

  return (
    <header style={styles.header(theme)}>
      <div style={styles.left}>
        <button
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          style={styles.iconButton(theme)}
          type="button"
        >
          <RxHamburgerMenu size={22} />
        </button>

        <div style={styles.brand}>
          <div style={styles.brandMark(theme)}>A</div>
          <div style={styles.brandCopy}>
            <p style={styles.brandTitle(theme)}>Ansar</p>
            <span style={styles.brandSubtitle(theme)}>Admin Workspace</span>
          </div>
        </div>
      </div>

      <div className="d-lg-none d-flex" style={styles.actions}>
        <button
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          style={styles.iconButton(theme)}
          title={isDarkMode ? "Light mode" : "Dark mode"}
          type="button"
        >
          {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <button
          aria-label="Open notifications"
          onClick={() => setShowNotifications(true)}
          style={styles.iconButton(theme)}
          type="button"
        >
          <BsBell size={18} />
        </button>

        <button
          aria-label="Open profile"
          onClick={() => setShowProfile(true)}
          style={styles.iconButton(theme)}
          type="button"
        >
          <LuUser size={20} />
        </button>
      </div>

      <div className="d-none d-lg-flex" style={styles.actions}>
        <button
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          style={styles.iconButton(theme)}
          title={isDarkMode ? "Light mode" : "Dark mode"}
          type="button"
        >
          {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <button
          aria-label="Enter fullscreen"
          onClick={enterFullScreen}
          style={styles.iconButton(theme)}
          type="button"
        >
          <MdFullscreen size={23} />
        </button>

        <div style={styles.notificationSlot(theme)}>
          <NotificationBell iconColor={theme.header.buttonColor} notifications={notifications} />
        </div>

        <Dropdown align="end">
          <Dropdown.Toggle
            as={ProfileToggle}
            id="admin-profile-menu"
            style={styles.iconButton(theme)}
          >
            <LuUser size={20} />
          </Dropdown.Toggle>

          <Dropdown.Menu style={styles.dropdownMenu(theme)}>
            <Dropdown.Item onClick={adminLogout} style={styles.dropdownItem}>
              Logout <FaPowerOff />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Offcanvas
        data-bs-theme={themeName}
        onHide={() => setShowNotifications(false)}
        placement="end"
        show={showNotifications}
        style={styles.panel(theme)}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Notifications</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          {notifications.length === 0 ? (
            <p style={styles.notificationBody(theme)}>No notifications</p>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={`${notification?.message?.title || "notification"}-${index}`}
                style={styles.notificationItem(theme)}
              >
                <div style={styles.notificationTitle(theme)}>
                  {notification?.message?.title || "Notification"}
                </div>
                <div style={styles.notificationBody(theme)}>
                  {notification?.message?.body || "No message"}
                </div>
                <small style={styles.notificationMeta(theme)}>
                  Priority: {notification?.message?.priority || "N/A"}
                </small>
              </div>
            ))
          )}
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        data-bs-theme={themeName}
        onHide={() => setShowProfile(false)}
        placement="end"
        show={showProfile}
        style={styles.panel(theme)}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Profile</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <Button onClick={adminLogout} variant="danger">
            Logout <FaPowerOff />
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}

export default Header;
