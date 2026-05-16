import { useState } from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Article from "@mui/icons-material/Article";
import AssignmentLate from "@mui/icons-material/AssignmentLate";
import Home from "@mui/icons-material/Home";
import { Link } from "react-router-dom";

function BottomNavbar() {
  const [value, setValue] = useState(0);

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderRadius: "13px 13px 0px 0px",
        overflow: "hidden",
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
        sx={{
          backgroundColor: "#ffffff",
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<Home />}
          component={Link}
          to="/user/user-home"
        />
        <BottomNavigationAction
          label="Complaint"
          icon={<AssignmentLate />}
          component={Link}
          to="/user/user-all-complaints"
        />
        <BottomNavigationAction
          label="Request"
          icon={<Article />}
          component={Link}
          to="/user/user-all-requests"
        />
        <BottomNavigationAction
          label="Profile"
          icon={<AccountCircle />}
          component={Link}
          to="/user/user-profile"
        />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNavbar;
