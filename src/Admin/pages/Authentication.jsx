import { useState } from "react";
import { Grid, TextField, Button, Card } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authApi } from "../../V2/services/api/endpoints/auth.api";
import { USER_ROLES } from "../../V2/shared/constants/roles";
import { setAuthSession } from "../../V2/shared/utils/authSession";

const theme = createTheme({
  palette: {
    primary: {
      main: "#7563b2",
    },
    secondary: {
      main: "#a08fd8",
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      fontSize: "2rem",
      color: "#333",
    },
    subtitle1: {
      color: "#757575",
    },
  },
});

function Authentication() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await authApi.adminLogin({
        username,
        password,
      });

      if (data.access_token) {
        setAuthSession({
          accessToken: data.access_token,
          role: USER_ROLES.SUPER_ADMIN,
        });
        navigate("/admin/dashboard");
      }
    } catch {
      toast.error("Invalid credentials, please try again.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: "#f0f1f2",
          minHeight: "100vh",
          padding: 2,
        }}
      >
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <Card
            sx={{
              padding: 3,
              boxShadow: 1,
              borderRadius: 1,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0px 4px 20px rgba(87, 0, 193, 0)",
              },
            }}
          >
            <h4 className="text-center">Ansar Admin Panel</h4>
            <p className="text-center mb-3">Welcome Back!</p>
            <small className="text-center mb-0   text-secondary">
              Sign in to continue to Ansar.
            </small>
            {/* Form Section */}
            <form onSubmit={handleLogin}>
              {/* Name Field */}
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                margin="normal"
                type="name"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                margin="normal"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: "5px",
                  backgroundColor: "#877bdc",
                }}
              >
                Login
              </Button>
            </form>
          </Card>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default Authentication;
