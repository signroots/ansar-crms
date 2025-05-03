import React, { useState } from "react";
import { Container } from "react-bootstrap";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  ThemeProvider,
} from "@mui/material";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import theme from "../../common/theme";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../utils/baseUrl";


function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ staffId: "", password: "" });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const navigate = useNavigate();

  const handleChange = (e) =>
  {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    try
    {
      const response = await axios.post(`${ BASE_URL }/api/userlogin/`, {
        staff_id: formData.staffId,
        mobile_number: formData.password,
      });

      const user = response.data;

      if (user.role === "Department Head" || user.role === "Staff" || user.role === "Teacher")
      {
        localStorage.setItem("user_access_token", response.data.access_token);
        localStorage.setItem("staff_id", response.data.staff_id);
        toast.success("Login successful!");
        navigate("/user/user-home");
      } else if (user.role === "Tech Support")
      {
        localStorage.setItem("ts_access_token", response.data.access_token);
        localStorage.setItem("staff_id", response.data.staff_id);
        toast.success("Login successful!");
        navigate("/tech-support/tech-support-home");
      } else
      {
        toast.error("Access denied. Invalid role.");
      }
    } catch (error)
    {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Login failed!");
    }
  };


  return (
    <ThemeProvider theme={theme}>
      <Container
        fluid
        className="d-flex justify-content-center align-items-center vh-100"
        style={{
          background: "white",
        }}
      >
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: 0,
            bgcolor: "transparent",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            width: "100%",
            maxWidth: 380,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" component="h1" sx={{ textAlign: "start" }}>
            Ansar
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: "start" }}>
            <small>Login to your account</small>
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Staff Id"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                type="text"
                fullWidth
                required
                variant="outlined"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility}>
                        {showPassword ? (
                          <AiOutlineEyeInvisible color="#877bdc" />
                        ) : (
                          <AiOutlineEye color="#877bdc" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Button
              type="submit"
              className="w-100"
              variant="contained"
              sx={{
                background:
                  "linear-gradient(135deg,rgb(165, 130, 255),rgb(108, 123, 255))",
                borderRadius: 2,
                padding: "0.75rem",
                color: "white",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, rgb(161, 74, 255),rgb(74, 141, 255))",
                },
              }}
            >
              Login
            </Button>
          </form>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Auth;
