import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Divider,
} from "@mui/material";
import CardMembership from "@mui/icons-material/CardMembership";
import CorporateFare from "@mui/icons-material/CorporateFare";
import Phone from "@mui/icons-material/Phone";
import WorkOutline from "@mui/icons-material/WorkOutline";
import { deepPurple, grey } from "@mui/material/colors";
import BASE_URL from "../../utils/baseUrl";
// import { Button } from 'bootstrap';
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const staffId = localStorage.getItem("staff_id") || "";
    if (staffId) {
      fetch(`${BASE_URL}/api/get-user-details/${staffId}/`)
        .then((response) => response.json())
        .then((data) => setUser(data))
        .catch((error) => console.error("Error fetching user details:", error));
    } else {
      console.error("No staff_id found in localStorage");
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("staff_id"); // Remove staff_id from storage
    navigate("/login"); // Redirect to login page
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #3f51b5, #2196f3)",
        }}
      >
        <CircularProgress sx={{ color: "#fff" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: 2,
        background: "linear-gradient(to bottom right,rgb(173, 185, 255),rgb(199, 230, 255))",
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          bgcolor: deepPurple[500],
          width: 80,
          height: 80,
          fontSize: 36,
          boxShadow: 3,
          marginBottom: 2,
        }}
      >
        {user.name ? user.name.charAt(0).toUpperCase() : "?"}
      </Avatar>

      {/* Card with user information */}
      <Card
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          padding: 2,
          backgroundColor: "#f0f0f0", // Lighter background for better contrast
          boxShadow: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            marginBottom: 2,
          }}
        >
          {user.name || "Unknown User"}
        </Typography>
        <Divider sx={{ marginBottom: 2 }} />

        <CardContent sx={{ padding: 0 }}>
          {/* Staff ID */}
          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CardMembership sx={{ color: grey[700], marginRight: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Staff ID:
              </Typography>
            </Box>
            <Typography variant="body1">{user.staff_id || "N/A"}</Typography>
          </Box>

          {/* Institution */}
          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CorporateFare sx={{ color: grey[700], marginRight: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Institution:
              </Typography>
            </Box>
            <Typography variant="body1">{user.institution || "N/A"}</Typography>
          </Box>

          {/* Department */}
          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <WorkOutline sx={{ color: grey[700], marginRight: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Department:
              </Typography>
            </Box>
            <Typography variant="body1">{user.department || "N/A"}</Typography>
          </Box>

          {/* Contact Number */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Phone sx={{ color: grey[700], marginRight: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Number:
              </Typography>
            </Box>
            <Typography variant="body1">{user.mobile_number || "N/A"}</Typography>
          </Box>
        </CardContent>
      </Card>
      {/* Logout Button */}
      <Button variant="contained" color="error" onClick={handleLogout} sx={{ marginTop: 2 }}>
        LOGOUT
      </Button>

      {/* Footer */}
      <Typography
        variant="caption"
        sx={{
          marginTop: 3,
          color: "#ffffffb3",
        }}
      >
        Version: 0.001 - Developers Signroots
      </Typography>
    </Box>
  );
}

export default UserProfile;
