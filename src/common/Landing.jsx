import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Landing.css";
import BASE_URL from "../utils/baseUrl"; // Make sure this points to your API base

function Login() {
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState(""); // added state
  const [error, setError] = useState("");

  // Refs to move focus
  const usernameRef = useRef(null);
  const mobileRef = useRef(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validation
    if (!username.trim()) {
      setError("Please enter your username");
      usernameRef.current.focus();
      return;
    }

    if (!mobileNumber.trim()) {
      setError("Please enter your password");
      mobileRef.current.focus();
      return;
    }

    setError(""); // clear previous error

    try {
      // Call your API
      const response = await axios.post(`${BASE_URL}/login/`, {
        username: username.trim(),
        mobile_number: mobileNumber.trim(),
      });

      if (response.status === 200) {

  const data = response.data;

  // ✅ CHECK if login really succeeded
  if (!data.access_token) {
    toast.error("Invalid credentials, please try again.");
    return;
  }
  // ✅ CLEAR OLD DATA FIRST
  localStorage.clear();

  const { access_token, role, staff_id, is_admin , type_of_issue_id,type_of_issue,} = data;
localStorage.setItem("staff_id", staff_id);
  console.log("ROLE:", role);
  console.log("DATA:", data);

  // ✅ STORE ONE TOKEN ONLY (IMPORTANT)
  localStorage.setItem("access_token", access_token);
  localStorage.setItem("role", role);
localStorage.setItem("access_token", access_token);
localStorage.setItem("role", role);
localStorage.setItem("staff_id", staff_id);
  if (role === "admin") {

    navigate("/admin/dashboard", { replace: true });

  } else if (role === "Tech Support") {

  const isAdmin = is_admin === true;
  if (type_of_issue_id) {
  localStorage.setItem("type_of_issue_id", String(type_of_issue_id));
}

if (type_of_issue) {
  localStorage.setItem("type_of_issue", type_of_issue);
}

  localStorage.setItem("is_admin", JSON.stringify(isAdmin));

  if (isAdmin) {
    navigate("/admin/dashboard", { replace: true });
  }else {
      navigate("/tech-support/tech-support-home", { replace: true });
    }

  } else if (role === "Staff" || role === "Teacher") {

    localStorage.setItem("staff_id", staff_id);


    navigate("/user/user-home", { replace: true });

  } else {
    toast.warning("Unknown role");
  }

      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials, please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="bg-overlay"></div>

      <div className="login-card">
        <div className="text-center mb-3">
          <img src="/ansarlogo.png" alt="Ansar Logo" className="logo" />
          <h3 className="mb-0">ANSAR</h3>
          <h4 className="department">IT Department</h4>
        </div>

        <small className="text-muted d-block mb-3">
          Sign in to continue
        </small>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            autoComplete="username"
            ref={usernameRef}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              borderColor: error.toLowerCase().includes("username")
                ? "red"
                : "#ddd",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            ref={mobileRef}
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            style={{
              borderColor: error.toLowerCase().includes("password")
                ? "red"
                : "#ddd",
            }}
          />
          <button type="submit" className="login-btn">
            LOGIN
          </button>
        </form>
      </div>

      <div className="page-footer">© 2025. Powered by signrOots.</div>
    </div>
  );
}

export default Login;