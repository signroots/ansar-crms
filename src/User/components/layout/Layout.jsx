import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <Sidebar isOpen={isSidebarOpen} />

          {/* Scrollable Content */}
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              backgroundColor: "#f0f1f2",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    );
};

export default Layout;

