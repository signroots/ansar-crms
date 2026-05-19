import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mui/material";

import { STORAGE_KEYS } from "../../../shared/constants/storageKeys";
import {
  ADMIN_LAYOUT_THEME_NAMES,
  getAdminLayoutTheme,
} from "../../superAdmin/components/layout/layoutTheme";
import DepartmentAdminHeader from "./DepartmentAdminHeader";
import DepartmentAdminSidebar from "./DepartmentAdminSidebar";

const getInitialTheme = () => {
  if (typeof window === "undefined") {
    return ADMIN_LAYOUT_THEME_NAMES.LIGHT;
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEYS.UI_THEME);

  if (storedTheme === ADMIN_LAYOUT_THEME_NAMES.DARK) {
    return ADMIN_LAYOUT_THEME_NAMES.DARK;
  }

  if (storedTheme === ADMIN_LAYOUT_THEME_NAMES.LIGHT) {
    return ADMIN_LAYOUT_THEME_NAMES.LIGHT;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? ADMIN_LAYOUT_THEME_NAMES.DARK
    : ADMIN_LAYOUT_THEME_NAMES.LIGHT;
};

function DepartmentAdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [themeName, setThemeName] = useState(getInitialTheme);
  const isMobile = useMediaQuery("(max-width: 899px)");

  const theme = useMemo(() => getAdminLayoutTheme(themeName), [themeName]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const toggleTheme = () => {
    setThemeName((currentTheme) =>
      currentTheme === ADMIN_LAYOUT_THEME_NAMES.DARK
        ? ADMIN_LAYOUT_THEME_NAMES.LIGHT
        : ADMIN_LAYOUT_THEME_NAMES.DARK,
    );
  };

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.UI_THEME, themeName);
    document.documentElement.dataset.adminTheme = themeName;
  }, [themeName]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden",
        backgroundColor: theme.shellBackground,
        transition: "background-color 0.2s ease",
        "--admin-bg": theme.contentBackground,
        "--admin-surface": theme.name === "dark" ? "#111827" : "#ffffff",
        "--admin-surface-soft": theme.name === "dark" ? "#172033" : "#f8fafc",
        "--admin-surface-muted": theme.name === "dark" ? "#1f2937" : "#eef2f7",
        "--admin-border": theme.name === "dark" ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
        "--admin-text": theme.header.text,
        "--admin-muted": theme.header.muted,
        "--admin-shadow":
          theme.name === "dark"
            ? "0 18px 45px rgba(0, 0, 0, 0.28)"
            : "0 18px 45px rgba(16, 24, 40, 0.08)",
      }}
    >
      <DepartmentAdminHeader
        isMobile={isMobile}
        theme={theme}
        themeName={themeName}
        toggleSidebar={toggleSidebar}
        toggleTheme={toggleTheme}
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          minWidth: 0,
          position: "relative",
          backgroundColor: theme.contentBackground,
          transition: "background-color 0.2s ease",
        }}
      >
        {isMobile && isSidebarOpen ? (
          <button
            aria-label="Close sidebar"
            onClick={closeSidebar}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              border: 0,
              padding: 0,
              background: "rgba(15, 23, 42, 0.42)",
              backdropFilter: "blur(4px)",
            }}
            type="button"
          />
        ) : null}

        <DepartmentAdminSidebar
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onNavigate={closeSidebar}
          theme={theme}
        />

        <main
          style={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            padding: isMobile ? "14px 10px 18px" : "24px",
            backgroundColor: theme.contentBackground,
            transition: "background-color 0.2s ease",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default DepartmentAdminLayout;
