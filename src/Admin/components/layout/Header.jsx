import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Button,
  Container,
  Dropdown,
  Offcanvas,
} from "react-bootstrap";

import { BsBell } from "react-icons/bs";
import { FaPowerOff } from "react-icons/fa6";
import { LuUser } from "react-icons/lu";
import { MdFullscreen } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import NotificationBell from "../../../common/NotificationBell";

function Header({ toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  // ================= FULLSCREEN =================
  const enterFullScreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  // ================= LOGOUT =================
  const adminLogout = () => {
    localStorage.removeItem("admin_access_token");
    toast.success("Logout Successfully");
    navigate("/login");
  };

  // ================= WEBSOCKET =================
  // ================= WEBSOCKET =================
useEffect(() => {

  // ✅ GET TOKEN
  const token = localStorage.getItem("access_token");

  // ✅ CHECK TOKEN
  if (!token) {
    console.log("No token found");
    return;
  }

  // ✅ CONNECT WEBSOCKET
  const socket = new WebSocket(
    `ws://127.0.0.1:8001/ws/notifications/?token=${token}`
  );

  socket.onopen = () => {
    console.log("✅ WebSocket Connected");
  };

 socket.onmessage = (event) => {

  console.log("🔥 RAW WS DATA:", event.data);

  try {

    const data = JSON.parse(event.data);

    console.log("✅ PARSED DATA:", data);

    // ✅ SHOW TOAST
    toast.success(
      data?.message?.body || "New Notification"
    );

    // ✅ STORE NOTIFICATION
    setNotifications((prev) => {

      const exists = prev.some(
        (n) =>
          n?.message?.body === data?.message?.body &&
          n?.message?.title === data?.message?.title
      );

      if (exists) return prev;

      return [data, ...prev];

    });

  } catch (err) {

    console.error("❌ Invalid WS data:", err);

  }
};

  socket.onerror = (err) => {
    console.error("❌ WebSocket error:", err);
  };

  socket.onclose = () => {
    console.log("⚠️ WebSocket closed");
  };

  return () => socket.close();

}, []);

  return (
    <Navbar expand="lg" bg="light">
      <Container fluid>

        {/* LEFT SIDE */}
        <div className="d-flex align-items-center">
          <button
            onClick={toggleSidebar}
            className="bg-transparent border-0 me-2"
          >
            <RxHamburgerMenu size={25} />
          </button>

          <Navbar.Brand className="fw-bold">Ansar</Navbar.Brand>
        </div>

        {/* MOBILE ICONS */}
        <div className="d-lg-none d-flex ms-auto align-items-center">

          <Button
            variant="link"
            className="p-0 text-dark me-3"
            onClick={() => setShowNotifications(true)}
          >
            <BsBell size={18} />
          </Button>

          <Button
            variant="link"
            className="p-0 text-dark"
            onClick={() => setShowProfile(true)}
          >
            <LuUser size={20} />
          </Button>
        </div>

        {/* RIGHT SIDE */}
        <Navbar.Collapse className="justify-content-end">
          <Nav>

            {/* FULLSCREEN */}
            <Nav.Item className="ms-2">
              <Button variant="link" className="p-0 text-dark">
                <MdFullscreen size={22} onClick={enterFullScreen} />
              </Button>
            </Nav.Item>

            {/* 🔔 NOTIFICATION BELL */}
            <Nav.Item className="ms-2">
              <NotificationBell notifications={notifications} />
            </Nav.Item>

            {/* PROFILE */}
            <Nav.Item className="ms-2">
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="p-0 text-dark">
                  <LuUser size={20} />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={adminLogout}
                    className="text-danger"
                  >
                    Logout <FaPowerOff />
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>

          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* ================= NOTIFICATIONS PANEL ================= */}
      <Offcanvas
        show={showNotifications}
        onHide={() => setShowNotifications(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Notifications</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          {notifications.length === 0 ? (
            <p className="text-secondary">No notifications</p>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="border-bottom py-2">

                <div className="fw-bold">
                  {n?.message?.title || "Notification"}
                </div>

                <div>
                  {n?.message?.body || "No message"}
                </div>

                <small className="text-muted">
                  Priority: {n?.message?.priority || "N/A"}
                </small>

              </div>
            ))
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* ================= PROFILE PANEL ================= */}
      <Offcanvas
        show={showProfile}
        onHide={() => setShowProfile(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Profile</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <Button variant="danger" onClick={adminLogout}>
            Logout
          </Button>
        </Offcanvas.Body>
      </Offcanvas>

    </Navbar>
  );
}

export default Header;