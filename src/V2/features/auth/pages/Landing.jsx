import { useRef, useState } from "react";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Landing.css";
import { authApi } from "../../../services/api/endpoints/auth.api";
import { USER_ROLES } from "../../../shared/constants/roles";
import { getAuthenticatedHomePath, setAuthSession } from "../../../shared/utils/authSession";

function Login() {
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const usernameRef = useRef(null);
  const mobileRef = useRef(null);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter your username");
      usernameRef.current?.focus();
      return;
    }

    if (!mobileNumber.trim()) {
      setError("Please enter your password");
      mobileRef.current?.focus();
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await authApi.login({
        username: username.trim(),
        mobile_number: mobileNumber.trim(),
      });

      if (!data.access_token) {
        toast.error("Invalid credentials, please try again.");
        return;
      }

      const {
        access_token,
        role,
        staff_id,
        is_admin,
        type_of_issue_id,
        type_of_issue,
        profile_name,
        name,
        full_name,
        username: responseUsername,
      } = data;
      const isTechnicalAdmin = role === USER_ROLES.TECHNICAL_STAFF && is_admin === true;

      setAuthSession({
        accessToken: access_token,
        role,
        profileName: profile_name || name || full_name || responseUsername || username.trim(),
        staffId: staff_id,
        isAdmin: isTechnicalAdmin,
        typeOfIssueId: type_of_issue_id,
        typeOfIssue: type_of_issue,
      });

      if (
        ![
          USER_ROLES.SUPER_ADMIN,
          USER_ROLES.TECHNICAL_STAFF,
          USER_ROLES.STAFF,
          USER_ROLES.TEACHER,
          USER_ROLES.DEPARTMENT_HEAD,
          USER_ROLES.DEPARTMENT_ADMIN,
        ].includes(role)
      ) {
        toast.warning("Unknown role");
        return;
      }

      navigate(getAuthenticatedHomePath({ role, isAdmin: isTechnicalAdmin }), { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay" aria-hidden="true" />

      <main className="login-shell">
        <section className="login-brand-panel" aria-label="Ansar support desk">
          <div className="brand-mark">
            <img src="/ansarlogo.png" alt="Ansar Logo" />
          </div>
          <p className="login-eyebrow">ANSAR</p>
          <h1>Support Desk</h1>
          <p className="login-copy">
            Access requests, complaints, feedback, users, and department workflows from one secure
            workspace.
          </p>

          {/* <div className="login-status-row" aria-label="Available access roles">
            <span>Staff</span>
            <span>Technical</span>
            <span>Admin</span>
          </div> */}
        </section>

        <section className="login-card" aria-label="Sign in">
          <div className="login-card-header">
            <div className="login-card-logo">
              <img src="/ansarlogo.png" alt="Ansar Logo" />
            </div>
            <div>
              <h2>Sign In</h2>
              <p>Continue to Ansar Support Desk</p>
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-field">
              {/* <span>Username</span> */}
              <div
                className={`login-input-wrap ${
                  error.toLowerCase().includes("username") ? "is-error" : ""
                }`}
              >
                <FiUser aria-hidden="true" />
                <input
                  autoComplete="username"
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  ref={usernameRef}
                  type="text"
                  value={username}
                  style={{ margin: 0 }}
                />
              </div>
            </label>

            <label className="login-field">
              {/* <span>Password</span> */}
              <div
                className={`login-input-wrap ${
                  error.toLowerCase().includes("password") ? "is-error" : ""
                }`}
              >
                <FiLock aria-hidden="true" />
                <input
                  autoComplete="current-password"
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter password"
                  ref={mobileRef}
                  type={showPassword ? "text" : "password"}
                  value={mobileNumber}
                  style={{ margin: 0 }}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <button className="login-btn" disabled={loading} type="submit">
              <span>{loading ? "Signing in..." : "Sign In"}</span>
              <FiArrowRight aria-hidden="true" />
            </button>
          </form>
        </section>
      </main>

      <div className="page-footer">© {currentYear}. Powered by signrOots.</div>
    </div>
  );
}

export default Login;
