import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Landing.css";
import { authApi } from "../V2/services/api/endpoints/auth.api";
import { USER_ROLES } from "../V2/shared/constants/roles";
import { setAuthSession } from "../V2/shared/utils/authSession";

function Login() {
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");

  const usernameRef = useRef(null);
  const mobileRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

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

    setError("");

    try {
      const data = await authApi.login({
        username: username.trim(),
        mobile_number: mobileNumber.trim(),
      });

      if (!data.access_token) {
        toast.error("Invalid credentials, please try again.");
        return;
      }

      const { access_token, role, staff_id, is_admin, type_of_issue_id, type_of_issue } = data;
      const isTechnicalAdmin = role === USER_ROLES.TECHNICAL_STAFF && is_admin === true;

      setAuthSession({
        accessToken: access_token,
        role,
        staffId: staff_id,
        isAdmin: isTechnicalAdmin,
        typeOfIssueId: type_of_issue_id,
        typeOfIssue: type_of_issue,
      });

      if (role === USER_ROLES.SUPER_ADMIN) {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === USER_ROLES.TECHNICAL_STAFF) {
        if (isTechnicalAdmin) {
          navigate("/tech-admin/dashboard", { replace: true });
        } else {
          navigate("/tech-support/tech-support-home", { replace: true });
        }
      } else if (
        role === USER_ROLES.STAFF ||
        role === USER_ROLES.TEACHER ||
        role === USER_ROLES.DEPARTMENT_HEAD
      ) {
        navigate("/user/user-home", { replace: true });
      } else {
        toast.warning("Unknown role");
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

        <small className="text-muted d-block mb-3">Sign in to continue</small>

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
              borderColor: error.toLowerCase().includes("username") ? "red" : "#ddd",
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
              borderColor: error.toLowerCase().includes("password") ? "red" : "#ddd",
            }}
          />
          <button type="submit" className="login-btn">
            LOGIN
          </button>
        </form>
      </div>

      <div className="page-footer">(c) 2025. Powered by signrOots.</div>
    </div>
  );
}

export default Login;
