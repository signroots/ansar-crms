import { forwardRef } from "react";
import { Dropdown } from "react-bootstrap";
import { FaPowerOff } from "react-icons/fa6";
import { LuUser } from "react-icons/lu";
import { MdDarkMode, MdFullscreen, MdLightMode } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { clearAuthSession, getAuthSession } from "../../../shared/utils/authSession";
import { ADMIN_LAYOUT_THEME_NAMES } from "../../superAdmin/components/layout/layoutTheme";

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
    display: "flex",
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

function DepartmentAdminHeader({ isMobile = false, theme, themeName, toggleSidebar, toggleTheme }) {
  const navigate = useNavigate();
  const { typeOfIssue } = getAuthSession();
  const isDarkMode = themeName === ADMIN_LAYOUT_THEME_NAMES.DARK;

  const enterFullScreen = () => {
    const el = document.documentElement;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  };

  const logout = () => {
    clearAuthSession();
    toast.success("Logout Successfully");
    navigate("/login");
  };

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
          <div style={styles.brandMark(theme, isMobile)}>D</div>
          <div style={styles.brandCopy}>
            <p style={styles.brandTitle(theme, isMobile)}>Department Admin</p>
            <span style={styles.brandSubtitle(theme, isMobile)}>
              {typeOfIssue || "Operations Workspace"}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.actions(isMobile)}>
        <button
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
          style={styles.iconButton(theme, isMobile)}
          title={isDarkMode ? "Light mode" : "Dark mode"}
          type="button"
        >
          {isDarkMode ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
        </button>

        {!isMobile ? (
          <button
            aria-label="Enter fullscreen"
            onClick={enterFullScreen}
            style={styles.iconButton(theme, isMobile)}
            type="button"
          >
            <MdFullscreen size={23} />
          </button>
        ) : null}

        <Dropdown align="end">
          <Dropdown.Toggle
            as={ProfileToggle}
            id="department-admin-profile-menu"
            style={styles.iconButton(theme, isMobile)}
          >
            <LuUser size={20} />
          </Dropdown.Toggle>

          <Dropdown.Menu style={styles.dropdownMenu(theme)}>
            <Dropdown.Item onClick={logout} style={styles.dropdownItem}>
              Logout <FaPowerOff />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}

export default DepartmentAdminHeader;
