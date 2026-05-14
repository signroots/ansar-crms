/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";

import { STORAGE_KEYS } from "../../../V2/shared/constants/storageKeys";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { ADMIN_LAYOUT_THEME_NAMES, getAdminLayoutTheme } from "./layoutTheme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return ADMIN_LAYOUT_THEME_NAMES.LIGHT;

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

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [themeName, setThemeName] = useState(getInitialTheme);

  const theme = useMemo(() => getAdminLayoutTheme(themeName), [themeName]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: theme.shellBackground,
        transition: "background-color 0.2s ease",
      }}
    >
      <Header
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
          backgroundColor: theme.contentBackground,
          transition: "background-color 0.2s ease",
        }}
      >
        <Sidebar isOpen={isSidebarOpen} theme={theme} />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            backgroundColor: theme.contentBackground,
            transition: "background-color 0.2s ease",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
