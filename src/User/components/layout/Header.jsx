import React, { useState, useEffect } from "react";

import {
  Navbar,
  Nav,
  Button,
  Container,
  Dropdown,
  Offcanvas,
  Badge,
} from "react-bootstrap";

import { BsBell } from "react-icons/bs";
import { FaPowerOff } from "react-icons/fa6";
import { LuUser } from "react-icons/lu";
import { MdFullscreen } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

function Header({ toggleSidebar }) {

  // ================= STATES =================
  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const navigate = useNavigate();

  // ================= FULL SCREEN =================
  const enterFullScreen = () => {

    if (document.documentElement.requestFullscreen) {

      document.documentElement.requestFullscreen();

    } else if (
      document.documentElement.mozRequestFullScreen
    ) {

      document.documentElement.mozRequestFullScreen();

    } else if (
      document.documentElement.webkitRequestFullscreen
    ) {

      document.documentElement.webkitRequestFullscreen();

    } else if (
      document.documentElement.msRequestFullscreen
    ) {

      document.documentElement.msRequestFullscreen();

    }
  };

  // ================= LOGOUT =================
  const adminLogout = () => {

    localStorage.removeItem(
      "admin_access_token"
    );

    toast.success("Logout Successfully");

    navigate("/admin/auth");

  };

  // ================= WEBSOCKET =================
  useEffect(() => {

    // ✅ GET TOKEN
    const token = localStorage.getItem(
      "admin_access_token"
    );

    console.log("TOKEN:", token);

    // ❌ TOKEN NOT FOUND
    if (!token) {

      console.log("❌ No Token Found");

      return;

    }

    // ✅ WEBSOCKET CONNECT
    const socket = new WebSocket(
      `ws://127.0.0.1:8001/ws/notifications/?token=${token}`
    );

    // ================= CONNECT =================
    socket.onopen = () => {

      console.log(
        "✅ WebSocket Connected"
      );

    };

    // ================= RECEIVE =================
    socket.onmessage = (event) => {

      console.log(
        "🔥 RAW MESSAGE:",
        event.data
      );

      try {

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

      } catch (error) {

        console.log(
          "❌ JSON ERROR:",
          error
        );

      }
    };

    // ================= ERROR =================
    socket.onerror = (error) => {

      console.log(
        "❌ SOCKET ERROR:",
        error
      );

    };

    // ================= CLOSE =================
    socket.onclose = () => {

      console.log(
        "⚠️ WebSocket Closed"
      );

    };

    // ================= CLEANUP =================
    return () => {

      socket.close();

    };

  }, []);

  // ================= CLICK NOTIFICATION =================
  const handleNotificationClick = (
    notification
  ) => {

    console.log(
      "🔔 CLICKED:",
      notification
    );

    const requestId =
      notification?.message?.request_id;

    if (requestId) {

      navigate(
        `/admin/request/${requestId}`
      );

    }

    setShowNotifications(false);

  };

  return (

    <Navbar expand="lg" bg="light">

      <Container fluid>

        {/* ================= LEFT ================= */}
        <div className="d-flex align-items-center">

          <button
            onClick={toggleSidebar}
            className="bg-transparent border-0 me-2"
          >

            <RxHamburgerMenu size={25} />

          </button>

          <Navbar.Brand
            href="#"
            className="text-dark fw-bold"
          >
            Ansar
          </Navbar.Brand>

        </div>

        {/* ================= MOBILE ================= */}
        <div className="d-lg-none d-flex ms-auto align-items-center">

          {/* 🔔 NOTIFICATION */}
          <Button
            variant="link"
            className="p-0 text-dark me-3 position-relative"
            onClick={() =>
              setShowNotifications(true)
            }
          >

            <BsBell
              style={{
                fontSize: "20px",
              }}
            />

            {/* BADGE */}
            {notifications.length > 0 && (

              <Badge
                bg="danger"
                pill
                className="position-absolute top-0 start-100 translate-middle"
              >
                {notifications.length}
              </Badge>

            )}

          </Button>

          {/* 👤 PROFILE */}
          <Button
            variant="link"
            className="p-0 text-dark"
            onClick={() =>
              setShowProfile(true)
            }
          >

            <LuUser
              style={{
                fontSize: "20px",
              }}
            />

          </Button>

        </div>

        {/* ================= RIGHT ================= */}
        <Navbar.Collapse
          id="navbar-nav"
          className="justify-content-end"
        >

          <Nav>

            {/* FULL SCREEN */}
            <Nav.Item className="ms-2">

              <Button
                variant="link"
                className="p-0 text-dark"
              >

                <MdFullscreen
                  style={{
                    fontSize: "22px",
                  }}
                  onClick={enterFullScreen}
                />

              </Button>

            </Nav.Item>

            {/* ================= DESKTOP NOTIFICATION ================= */}
            <Nav.Item className="d-none d-lg-inline ms-2">

              <Button
                variant="link"
                className="p-0 text-dark position-relative"
                onClick={() =>
                  setShowNotifications(true)
                }
              >

                <BsBell
                  style={{
                    fontSize: "20px",
                  }}
                />

                {/* BADGE */}
                {notifications.length > 0 && (

                  <Badge
                    bg="danger"
                    pill
                    className="position-absolute top-0 start-100 translate-middle"
                  >
                    {notifications.length}
                  </Badge>

                )}

              </Button>

            </Nav.Item>

            {/* ================= PROFILE ================= */}
            <Nav.Item className="d-none d-lg-inline ms-2">

              <Dropdown align="end">

                <Dropdown.Toggle
                  variant="link"
                  className="p-0 text-dark border-0"
                >

                  <LuUser
                    style={{
                      fontSize: "20px",
                    }}
                  />

                </Dropdown.Toggle>

                <Dropdown.Menu className="mt-4">

                  <Dropdown.Item
                    href="#"
                    onClick={adminLogout}
                    className="text-danger"
                    style={{
                      fontSize: "13px",
                    }}
                  >

                    Logout{" "}

                    <FaPowerOff
                      style={{
                        fontSize: "13px",
                      }}
                    />

                  </Dropdown.Item>

                </Dropdown.Menu>

              </Dropdown>

            </Nav.Item>

          </Nav>

        </Navbar.Collapse>

      </Container>

      {/* ================= NOTIFICATION OFFCANVAS ================= */}
      <Offcanvas
        show={showNotifications}
        onHide={() =>
          setShowNotifications(false)
        }
        placement="end"
      >

        <Offcanvas.Header closeButton>

          <Offcanvas.Title>
            Notifications
          </Offcanvas.Title>

        </Offcanvas.Header>

        <Offcanvas.Body>

          {notifications.length === 0 ? (

            <p className="text-secondary">
              No Notifications
            </p>

          ) : (

            notifications.map(
              (
                notification,
                index
              ) => (

                <div
                  key={index}
                  className="border rounded p-3 mb-3 shadow-sm"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    handleNotificationClick(
                      notification
                    )
                  }
                >

                  {/* TITLE */}
                  <h6 className="mb-1">

                    {
                      notification?.message
                        ?.title ||
                        "Notification"
                    }

                  </h6>

                  {/* BODY */}
                  <p
                    className="mb-1 text-secondary"
                    style={{
                      fontSize: "14px",
                    }}
                  >

                    {
                      notification?.message
                        ?.body ||
                        "New Notification"
                    }

                  </p>

                  {/* PRIORITY */}
                  <small className="text-danger">

                    Priority :{" "}

                    {
                      notification?.message
                        ?.priority ||
                        "N/A"
                    }

                  </small>

                </div>

              )
            )

          )}

        </Offcanvas.Body>

      </Offcanvas>

      {/* ================= PROFILE OFFCANVAS ================= */}
      <Offcanvas
        show={showProfile}
        onHide={() =>
          setShowProfile(false)
        }
        placement="end"
      >

        <Offcanvas.Header closeButton>

          <Offcanvas.Title>
            Profile
          </Offcanvas.Title>

        </Offcanvas.Header>

        <Offcanvas.Body>

          <Button
            variant="danger"
            onClick={adminLogout}
          >
            Logout
          </Button>

        </Offcanvas.Body>

      </Offcanvas>

    </Navbar>

  );
}

export default Header;