 
import { forwardRef, useEffect, useState } from "react";
import { Button, Dropdown, Offcanvas } from "react-bootstrap";
import { BsBell } from "react-icons/bs";
import { FaPowerOff } from "react-icons/fa6";
import { LuUser } from "react-icons/lu";
import { MdDarkMode, MdFullscreen, MdLightMode } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import NotificationBell from "../../../../shared/components/NotificationBell";
import { env } from "../../../../config/env";
import { ADMIN_LAYOUT_THEME_NAMES } from "./layoutTheme";
import { clearAuthSession, getAuthSession } from "../../../../shared/utils/authSession";

const styles = {
  header: (theme, isMobile) => ({
    margin: isMobile ? "8px 8px 0" : "12px 12px 0",
    minHeight: isMobile ? "62px" : "72px",
    padding: isMobile ? "10px" : "12px 16px",
    background: theme.header.background,
    border: `1px solid ${theme.header.border}`,
    borderRadius: isMobile ? "14px" : "18px",
    boxShadow: theme.header.shadow,
    color: theme.header.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: isMobile ? "8px" : "16px",
    transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
    zIndex: 10,
    minWidth: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
  }),
  left: (isMobile) => ({
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    gap: isMobile ? "8px" : "12px",
    flexShrink: 1,
  }),
  brand: (isMobile) => ({
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    gap: isMobile ? "8px" : "10px",
  }),
  brandMark: (theme, isMobile) => ({
    width: isMobile ? "36px" : "40px",
    height: isMobile ? "36px" : "40px",
    borderRadius: isMobile ? "10px" : "12px",
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
  brandTitle: (theme, isMobile) => ({
    margin: 0,
    color: theme.header.text,
    fontSize: isMobile ? "15px" : "16px",
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "0",
  }),
  brandSubtitle: (theme, isMobile) => ({
    display: isMobile ? "none" : "block",
    marginTop: "2px",
    color: theme.header.muted,
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.2,
  }),
  actions: (isMobile) => ({
    alignItems: "center",
    gap: isMobile ? "6px" : "10px",
    flexShrink: 0,
  }),
  iconButton: (theme, isMobile) => ({
    width: isMobile ? "38px" : "42px",
    height: isMobile ? "38px" : "42px",
    borderRadius: isMobile ? "10px" : "12px",
    border: `1px solid ${theme.header.buttonBorder}`,
    background: theme.header.buttonBackground,
    color: theme.header.buttonColor,
    display: "grid",
    placeItems: "center",
    padding: 0,
    lineHeight: 1,
    transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
  }),
  profileButton: (theme, isMobile) => ({
    minWidth: isMobile ? "38px" : "auto",
    height: isMobile ? "38px" : "42px",
    maxWidth: isMobile ? "38px" : "220px",
    borderRadius: isMobile ? "10px" : "12px",
    border: `1px solid ${theme.header.buttonBorder}`,
    background: theme.header.buttonBackground,
    color: theme.header.buttonColor,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: isMobile ? 0 : "0 12px",
    lineHeight: 1,
    transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease",
  }),
  profileName: (isMobile) => ({
    display: isMobile ? "none" : "inline-block",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "13px",
    fontWeight: 800,
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

function Header({ isMobile = false, theme, themeName, toggleSidebar, toggleTheme }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const isDarkMode = themeName === ADMIN_LAYOUT_THEME_NAMES.DARK;
  const session = getAuthSession();
  const profileName =
    session.profileName || (session.role === "admin" ? "Super Admin" : session.role) || "Admin";

  const enterFullScreen = () => {
    const el = document.documentElement;

    if (el.requestFullscreen) {el.requestFullscreen();}
    else if (el.webkitRequestFullscreen) {el.webkitRequestFullscreen();}
    else if (el.msRequestFullscreen) {el.msRequestFullscreen();}
  };

  const adminLogout = () => {
    clearAuthSession();
    toast.success("Logout Successfully");
    navigate("/login");
  };

  useEffect(() => {
    const { accessToken: token } = getAuthSession();

    if (!token) {return undefined;}

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

          if (exists) {return prev;}

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
    <header style={styles.header(theme, isMobile)}>
      <div style={styles.left(isMobile)}>
        <button
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          style={styles.iconButton(theme, isMobile)}
          type="button"
        >
          <RxHamburgerMenu size={isMobile ? 20 : 22} />
        </button>

        <div style={styles.brand(isMobile)}>
          <div style={styles.brandMark(theme, isMobile)}>A</div>
          <div style={styles.brandCopy}>
            <p style={styles.brandTitle(theme, isMobile)}>Ansar</p>
            <span style={styles.brandSubtitle(theme, isMobile)}>Admin Workspace</span>
          </div>
        </div>
      </div>

      <div className="d-lg-none d-flex" style={styles.actions(isMobile)}>
        <button
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          style={styles.iconButton(theme, isMobile)}
          title={isDarkMode ? "Light mode" : "Dark mode"}
          type="button"
        >
          {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <button
          aria-label="Open notifications"
          onClick={() => setShowNotifications(true)}
          style={styles.iconButton(theme, isMobile)}
          type="button"
        >
          <BsBell size={18} />
        </button>

        <button
          aria-label="Open profile"
          onClick={() => setShowProfile(true)}
          style={styles.iconButton(theme, isMobile)}
          type="button"
        >
          <LuUser size={20} />
        </button>
      </div>

      <div className="d-none d-lg-flex" style={styles.actions(isMobile)}>
        <button
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          style={styles.iconButton(theme, isMobile)}
          title={isDarkMode ? "Light mode" : "Dark mode"}
          type="button"
        >
          {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        <button
          aria-label="Enter fullscreen"
          onClick={enterFullScreen}
          style={styles.iconButton(theme, isMobile)}
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
            style={styles.profileButton(theme, isMobile)}
          >
            <LuUser size={20} />
            {/* <span style={styles.profileName(isMobile)} title={profileName}>
              {profileName}
            </span> */}
          </Dropdown.Toggle>

          <Dropdown.Menu style={styles.dropdownMenu(theme)}>
            <Dropdown.ItemText style={styles.dropdownItem}>{profileName}</Dropdown.ItemText>
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
          <p style={styles.notificationTitle(theme)}>{profileName}</p>
          <Button onClick={adminLogout} variant="danger">
            Logout <FaPowerOff />
          </Button>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
}

export default Header;
