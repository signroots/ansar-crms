/* eslint-disable react/prop-types */
import { LuUsers } from "react-icons/lu";
import { MdDashboard, MdFeedback } from "react-icons/md";
import { PiWarningCircle } from "react-icons/pi";
import { TbFileSymlink } from "react-icons/tb";
import { NavLink } from "react-router-dom";

import ROUTE_PATHS from "../../../V2/app/router/paths";
import { USER_ROLES } from "../../../V2/shared/constants/roles";
import { getAuthSession } from "../../../V2/shared/utils/authSession";

const superAdminMenu = [
  {
    label: "Dashboard",
    path: ROUTE_PATHS.superAdmin.dashboard,
    icon: MdDashboard,
  },
  {
    label: "Complaints",
    path: ROUTE_PATHS.superAdmin.complaints,
    icon: PiWarningCircle,
  },
  {
    label: "Requests",
    path: ROUTE_PATHS.superAdmin.requests,
    icon: TbFileSymlink,
  },
  {
    label: "Users",
    path: ROUTE_PATHS.superAdmin.users,
    icon: LuUsers,
  },
  // {
  //   label: "Staff",
  //   path: ROUTE_PATHS.superAdmin.staff,
  //   icon: TbUserStar,
  // },
  {
    label: "Feedback",
    path: ROUTE_PATHS.superAdmin.feedback,
    icon: MdFeedback,
  },
];

const departmentAdminMenu = [
  {
    label: "Dashboard",
    path: ROUTE_PATHS.departmentAdmin.dashboard,
    icon: MdDashboard,
  },
  {
    label: "Complaints",
    path: ROUTE_PATHS.departmentAdmin.complaints,
    icon: PiWarningCircle,
  },
  {
    label: "Requests",
    path: ROUTE_PATHS.departmentAdmin.requests,
    icon: TbFileSymlink,
  },
  {
    label: "Users",
    path: ROUTE_PATHS.departmentAdmin.users,
    icon: LuUsers,
  },
];

const getSidebarContext = () => {
  const { role, isAdmin } = getAuthSession();
  const isDepartmentAdmin =
    role === USER_ROLES.DEPARTMENT_ADMIN || (role === USER_ROLES.TECHNICAL_STAFF && isAdmin);

  if (isDepartmentAdmin) {
    return {
      label: "Department Admin",
      caption: "Operations",
      menuItems: departmentAdminMenu,
    };
  }

  return {
    label: "Super Admin",
    caption: "Control Center",
    menuItems: superAdminMenu,
  };
};

const styles = {
  sidebar: (isOpen, theme) => ({
    width: isOpen ? "280px" : "88px",
    height: "calc(100% - 24px)",
    margin: "12px 0 12px 12px",
    padding: isOpen ? "16px" : "14px 10px",
    background: theme.sidebar.background,
    border: `1px solid ${theme.sidebar.border}`,
    borderRadius: "18px",
    color: theme.sidebar.text,
    transition: "width 0.22s ease, padding 0.22s ease, background 0.2s ease",
    overflow: "hidden",
    boxShadow: theme.sidebar.shadow,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  }),
  sectionLabel: (theme) => ({
    margin: "4px 8px 12px",
    color: theme.sidebar.muted,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  }),
  nav: {
    display: "grid",
    gap: "8px",
  },
  navItem: (isOpen, isActive, theme) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: isOpen ? "flex-start" : "center",
    gap: "12px",
    minHeight: "46px",
    padding: isOpen ? "0 12px" : "0",
    borderRadius: "14px",
    background: isActive ? theme.sidebar.navActiveBackground : theme.sidebar.navBackground,
    color: isActive ? theme.sidebar.navActiveText : theme.sidebar.navText,
    border: `1px solid ${isActive ? theme.sidebar.navActiveBorder : theme.sidebar.navBorder}`,
    textDecoration: "none",
    transition: "background 0.18s ease, color 0.18s ease, transform 0.18s ease",
    boxShadow: isActive ? theme.sidebar.navActiveShadow : "none",
  }),
  icon: {
    width: "20px",
    height: "20px",
    flexShrink: 0,
  },
  navText: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0",
  },
  footer: (theme) => ({
    marginTop: "auto",
    padding: "12px",
    borderRadius: "14px",
    background: theme.sidebar.footerBackground,
    border: `1px solid ${theme.sidebar.footerBorder}`,
    color: theme.sidebar.footerText,
    fontSize: "12px",
    lineHeight: 1.45,
  }),
};

function Sidebar({ isOpen, theme }) {
  const { label, caption, menuItems } = getSidebarContext();

  return (
    <aside style={styles.sidebar(isOpen, theme)} aria-label={`${label} sidebar`}>
      {isOpen && <div style={styles.sectionLabel(theme)}>{caption}</div>}

      <nav style={styles.nav} aria-label={`${label} navigation`}>
        {menuItems.map(({ icon: Icon, label: itemLabel, path }) => (
          <NavLink
            key={path}
            to={path}
            title={isOpen ? undefined : itemLabel}
            style={({ isActive }) => styles.navItem(isOpen, isActive, theme)}
          >
            <Icon style={styles.icon} aria-hidden="true" />
            {isOpen && <span style={styles.navText}>{itemLabel}</span>}
          </NavLink>
        ))}
      </nav>

      {isOpen && (
        <div style={styles.footer(theme)}>
          Manage requests, complaints, users, and service workflows from one place.
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
