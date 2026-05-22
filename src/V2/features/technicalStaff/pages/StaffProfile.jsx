import { useEffect, useMemo, useState } from "react";

import AccountTree from "@mui/icons-material/AccountTree";
import Badge from "@mui/icons-material/Badge";
import Call from "@mui/icons-material/Call";
import HowToReg from "@mui/icons-material/HowToReg";
import Logout from "@mui/icons-material/Logout";
import Person from "@mui/icons-material/Person";
import SupportAgent from "@mui/icons-material/SupportAgent";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import ROUTE_PATHS from "../../../app/router/paths";
import { clearAuthSession, getAuthSession } from "../../../shared/utils/authSession";
import { apiService } from "../../../services/api/Api.service";

const getInitial = (name) => name?.trim()?.charAt(0)?.toUpperCase() || "?";

function StaffProfile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const staffId = useMemo(
    () => getAuthSession().staffId || localStorage.getItem("staff_id") || "",
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (!staffId) {
        setErrorMessage("Staff details are not available.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiService.get(`/api/api/get-user-details/${staffId}/`);

        if (isMounted) {
          setUser(data);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);

        if (isMounted) {
          setErrorMessage("Unable to load profile details.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [staffId]);

  const handleLogout = () => {
    clearAuthSession();
    navigate(ROUTE_PATHS.login, { replace: true });
  };

  const renderInfoRow = (label, value, Icon) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        borderRadius: 2,
        bgcolor: "#f8fafc",
        border: "1px solid #e2e8f0",
        px: 1.5,
        py: 1.25,
      }}
    >
      <Avatar sx={{ width: 34, height: 34, bgcolor: "#ecfeff", color: "#0f766e" }}>
        <Icon sx={{ fontSize: 19 }} />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: 11, fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#0f172a",
            fontSize: 13,
            fontWeight: 700,
            overflowWrap: "anywhere",
          }}
        >
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto" }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <Stack alignItems="center" spacing={1.25} sx={{ py: 6, px: 2, textAlign: "center" }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "#ecfeff", color: "#0f766e" }}>
              <CircularProgress size={24} thickness={4} sx={{ color: "#0f766e" }} />
            </Avatar>
            <Typography variant="subtitle1" sx={{ color: "#0f172a", fontWeight: 700 }}>
              Loading profile
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 320 }}>
              Fetching your staff details.
            </Typography>
          </Stack>
        </Card>
      </Box>
    );
  }

  if (errorMessage) {
    return (
      <Box sx={{ maxWidth: 640, mx: "auto" }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px dashed #cbd5e1",
            bgcolor: "#ffffff",
          }}
        >
          <Stack alignItems="center" spacing={1.25} sx={{ py: 6, px: 2, textAlign: "center" }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "#f8fafc", color: "#94a3b8" }}>
              <Person />
            </Avatar>
            <Typography variant="subtitle1" sx={{ color: "#0f172a", fontWeight: 700 }}>
              Profile unavailable
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 320 }}>
              {errorMessage}
            </Typography>
          </Stack>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 14px 36px rgba(15, 118, 110, 0.08)",
        }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack alignItems="center" spacing={1.25} sx={{ textAlign: "center", mb: 2 }}>
            <Avatar
              sx={{
                width: 78,
                height: 78,
                bgcolor: "#0f766e",
                color: "#ffffff",
                fontSize: 30,
                fontWeight: 700,
                boxShadow: "0 16px 34px rgba(15, 118, 110, 0.18)",
              }}
            >
              {getInitial(user?.name)}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#0f172a",
                  fontSize: { xs: 19, sm: 21 },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  overflowWrap: "anywhere",
                }}
              >
                {user?.name || "Unknown User"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.35 }}>
                {user?.section_for_staff || "Tech Support"}
              </Typography>
            </Box>

          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1,
            }}
          >
            {renderInfoRow("Staff ID", user?.staff_id, Badge)}
            {renderInfoRow("Role", user?.role, HowToReg)}
            {renderInfoRow("Section", user?.section_for_staff, AccountTree)}
            {renderInfoRow("Number", user?.mobile_number, Call)}
          </Box>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              mt: 2,
              minHeight: 48,
              borderRadius: 2,
              bgcolor: "#fff7ed",
              borderColor: "#fed7aa",
              color: "#c2410c",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#ffedd5",
                borderColor: "#fb923c",
                color: "#9a3412",
                boxShadow: "0 10px 24px rgba(234, 88, 12, 0.12)",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Card>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 1.5,
          color: "#94a3b8",
          textAlign: "center",
          fontWeight: 600,
        }}
      >
        Version 0.001 - Developers Signroots
      </Typography>
    </Box>
  );
}

export default StaffProfile;
