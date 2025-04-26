import React from "react";
import { LuUsers } from "react-icons/lu";
import { MdDashboard} from "react-icons/md";
import { PiWarningCircle } from "react-icons/pi";
import { TbFileSymlink, TbUserStar } from "react-icons/tb";
import { Link, useLocation } from "react-router-dom";
import { MdFeedback } from "react-icons/md";

const Sidebar = ({ isOpen }) => {
  

  const sidebarStyle = {
    width: isOpen ? "240px" : "60px",
    backgroundColor: "#223349",
    color: "#9b9b9d",
    height: "100%",
    transition: "width 0.3s",
    overflow: "hidden",
    borderRadius:"0px"
  };

  const ulStyle = {
    listStyle: "none",
    padding: 5,
    margin: 0,
  };

  const sidebarItemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    cursor: "pointer",
    transition: "background-color 0.3s, color 0.3s",
    color: "#9b9b9d",
    fontSize: "14px",
  };

  const sidebarItemHoverStyle = {
    backgroundColor: "#d8ecff",
    color: "#fff",
  };

  return (
    <aside className="card" style={sidebarStyle}>
      <ul style={ulStyle}>
        {/* Dashboard Item */}
        <Link to="/admin/dashboard" style={{ textDecoration: "none" }}>
          <li
            className="sidebarItem"
            style={sidebarItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = sidebarItemHoverStyle.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9b9b9d";
            }}
          >
            <MdDashboard
              style={{ fontSize: "17px", marginRight: isOpen ? "15px" : "0" }}
            />
            {isOpen && <span>Dashboard</span>}
          </li>
        </Link>

        {/* complaint Item */}
        <Link to="/admin/complaints" style={{ textDecoration: "none" }}>
          <li
            className="sidebarItem"
            style={sidebarItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = sidebarItemHoverStyle.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9b9b9d";
            }}
          >
            <PiWarningCircle
              style={{ fontSize: "17px", marginRight: isOpen ? "15px" : "0" }}
            />
            {isOpen && <span>Complaints</span>}
          </li>
        </Link>

        {/* Request Item */}
        <Link to="/admin/requests" style={{ textDecoration: "none" }}>
          <li
            className="sidebarItem"
            style={sidebarItemStyle}
            onMouseEnter={(e) =>
            {
              e.currentTarget.style.color = sidebarItemHoverStyle.color;
            }}
            onMouseLeave={(e) =>
            {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9b9b9d";
            }}
          >
            <TbFileSymlink
              style={{ fontSize: "17px", marginRight: isOpen ? "15px" : "0" }}
            />
            {isOpen && <span>Requests</span>}
          </li>
        </Link>

        {/* Users Item */}
        <Link to="/admin/user-manage" style={{ textDecoration: "none" }}>
          <li
            className="sidebarItem"
            style={sidebarItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = sidebarItemHoverStyle.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9b9b9d";
            }}
          >
            <LuUsers
              style={{ fontSize: "17px", marginRight: isOpen ? "15px" : "0" }}
            />
            {isOpen && <span>Users</span>}
          </li>
        </Link>
        {/* Feedback Item */}
        <Link to="" style={{ textDecoration: "none" }}>
          <li
            className="sidebarItem"
            style={sidebarItemStyle}
            onMouseEnter={(e) =>
            {
              e.currentTarget.style.color = sidebarItemHoverStyle.color;
            }}
            onMouseLeave={(e) =>
            {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9b9b9d";
            }}
          >
            <MdFeedback
              style={{ fontSize: "17px", marginRight: isOpen ? "15px" : "0" }}
            />
            {isOpen && <span>Feedback</span>}
          </li>
        </Link>

        {/* Staff Item */}
        {/* <Link to="/admin/staff-manage" style={{ textDecoration: "none" }}>
          <li
            className="sidebarItem"
            style={sidebarItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = sidebarItemHoverStyle.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9b9b9d";
            }}
          >
            <TbUserStar
              style={{ fontSize: "17px", marginRight: isOpen ? "15px" : "0" }}
            />
            {isOpen && <span>Super Admin</span>}
          </li>
        </Link> */}

        {/* Logout Item */}
        {/* <li
          className="sidebarItem"
          style={sidebarItemStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = sidebarItemHoverStyle.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#9b9b9d";
          }}
        >
          <FaPowerOff
            style={{ fontSize: "16px", marginRight: isOpen ? "15px" : "0" }}
          />
          {isOpen && <span>Logout</span>}
        </li> */}
      </ul>
    </aside>
  );
};

export default Sidebar;
