import { useEffect, useMemo, useState } from "react";

import Add from "@mui/icons-material/Add";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Article from "@mui/icons-material/Article";
import AssignmentLate from "@mui/icons-material/AssignmentLate";
import Business from "@mui/icons-material/Business";
import ChevronRight from "@mui/icons-material/ChevronRight";
import EventNote from "@mui/icons-material/EventNote";
import Inbox from "@mui/icons-material/Inbox";
import Notes from "@mui/icons-material/Notes";
import Schedule from "@mui/icons-material/Schedule";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import BASE_URL from "../../../shared/utils/baseUrl";

const STEPS = ["Pending", "In Progress", "Waiting", "Completed"];

const STATUS_STYLES = {
  Pending: {
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  "In Progress": {
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  Waiting: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  Completed: {
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
};

const TASK_TYPE_STYLES = {
  complaint: {
    label: "Complaint",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: AssignmentLate,
  },
  request: {
    label: "Request",
    color: "#0f766e",
    bg: "#ecfeff",
    border: "#bae6fd",
    icon: Article,
  },
};

const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.Pending;

const getTaskType = (item) => (item?.issue_complaint ? "complaint" : "request");

const getTypeStyle = (item) => TASK_TYPE_STYLES[getTaskType(item)] || TASK_TYPE_STYLES.request;

const getIssueName = (item) => item?.issue_request?.name || item?.issue_complaint?.name || "N/A";

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getDelayReasonText = (delayReason) => {
  if (Array.isArray(delayReason)) {
    return delayReason.map((item) => item?.reason || item?.name).filter(Boolean).join(", ");
  }

  if (typeof delayReason === "object" && delayReason !== null) {
    return delayReason.reason || delayReason.name || "";
  }

  return delayReason || "";
};

function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [delayReason, setDelayReason] = useState("");
  const navigate = useNavigate();

  const pendingComplaints = useMemo(
    () => complaints.filter((item) => item.status === "Pending"),
    [complaints],
  );

  const pendingRequests = useMemo(
    () => requests.filter((item) => item.status === "Pending"),
    [requests],
  );

  const activeItems = activeTab === 0 ? pendingComplaints : pendingRequests;
  const activeLabel = activeTab === 0 ? "Complaints" : "Requests";

  useEffect(() => {
    const staff_id = localStorage.getItem("staff_id");
    const token = localStorage.getItem("access_token");

    if (!staff_id) {
      console.error("Staff ID is not found in localStorage");
      return;
    }

    if (!token) {
      console.error("Access token is missing. Please login again.");
      return;
    }

    const config = {
      params: { staff_id },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get(`${BASE_URL}/api/sumbitted-request/list/`, config)
      .then((response) => setRequests(response.data))
      .catch((error) => console.error("Error fetching requests:", error));

    axios
      .get(`${BASE_URL}/api/sumbitted-complaint/list/`, config)
      .then((response) => setComplaints(response.data))
      .catch((error) => console.error("Error fetching complaints:", error));
  }, []);

  useEffect(() => {
    if (selectedItem?.delay_reason && selectedItem.status === "Waiting") {
      setDelayReason(selectedItem.delay_reason);
    } else {
      setDelayReason("");
    }
  }, [selectedItem]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedItem(null);
  };

  const handleListClick = (item) => {
    const stepIndex = STEPS.indexOf(item.status);
    setSelectedItem({ ...item, stepIndex });
  };

  const handleBackClick = () => setSelectedItem(null);

  const renderStatusChip = (status) => {
    const statusStyle = getStatusStyle(status);

    return (
      <Chip
        label={status || "Pending"}
        size="small"
        sx={{
          height: 28,
          borderRadius: 1.5,
          bgcolor: statusStyle.bg,
          border: `1px solid ${statusStyle.border}`,
          color: statusStyle.color,
          fontSize: 11,
          fontWeight: 700,
        }}
      />
    );
  };

  const renderTypeChip = (item) => {
    const typeStyle = getTypeStyle(item);
    const Icon = typeStyle.icon;

    return (
      <Chip
        icon={<Icon />}
        label={typeStyle.label}
        size="small"
        sx={{
          height: 28,
          borderRadius: 1.5,
          bgcolor: typeStyle.bg,
          border: `1px solid ${typeStyle.border}`,
          color: typeStyle.color,
          fontSize: 11,
          fontWeight: 700,
          "& .MuiChip-icon": { color: typeStyle.color },
        }}
      />
    );
  };

  const renderDetailRow = (label, value, Icon) => (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
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

      <Box sx={{ minWidth: 0, flex: 1 }}>
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

  const renderTaskCard = (item) => (
    <Card
      key={`${getTaskType(item)}-${item.id}`}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        overflow: "hidden",
        boxShadow: "0 12px 28px rgba(15, 118, 110, 0.08)",
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          {renderTypeChip(item)}
          {renderStatusChip(item.status)}
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
            {formatDate(item.date)}
          </Typography>
        </Stack>

        <Typography
          variant="subtitle1"
          sx={{
            color: "#0f172a",
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.25,
            mb: 1,
            overflowWrap: "anywhere",
          }}
        >
          {getIssueName(item)}
        </Typography>

        <Stack spacing={0.6}>
          <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600 }}>
            {item?.institution?.name || "Submitted item"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
            {formatTime(item.date) || "Time not available"}
          </Typography>
        </Stack>
      </Box>

      <Divider />

      <Button
        fullWidth
        endIcon={<ChevronRight />}
        onClick={() => handleListClick(item)}
        sx={{
          justifyContent: "space-between",
          minHeight: 48,
          px: 1.75,
          borderRadius: 0,
          color: "#0f766e",
          fontWeight: 700,
          textTransform: "none",
          "&:hover": { bgcolor: "#f0fdfa" },
        }}
      >
        View details
      </Button>
    </Card>
  );

  const renderEmptyState = () => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px dashed #cbd5e1",
        bgcolor: "#ffffff",
      }}
    >
      <Stack alignItems="center" spacing={1} sx={{ py: 6, px: 2, textAlign: "center" }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: "#f8fafc", color: "#94a3b8" }}>
          <Inbox />
        </Avatar>
        <Typography variant="subtitle1" sx={{ color: "#0f172a", fontWeight: 700 }}>
          No pending {activeLabel.toLowerCase()}
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 320 }}>
          Submitted {activeLabel.toLowerCase()} waiting for action will appear here.
        </Typography>
      </Stack>
    </Card>
  );

  const renderDetails = () => {
    const TypeIcon = getTypeStyle(selectedItem).icon;
    const delayReasonText = getDelayReasonText(delayReason);

    return (
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
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.75 }}>
            <IconButton
              aria-label="Back to list"
              onClick={handleBackClick}
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: "#f8fafc",
                color: "#334155",
                border: "1px solid #e2e8f0",
                "&:hover": { bgcolor: "#ecfeff" },
              }}
            >
              <ArrowBack />
            </IconButton>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                {renderTypeChip(selectedItem)}
                {renderStatusChip(selectedItem.status)}
              </Stack>
              <Typography
                variant="h6"
                sx={{
                  color: "#0f172a",
                  fontSize: { xs: 18, sm: 20 },
                  fontWeight: 700,
                  letterSpacing: 0,
                  lineHeight: 1.2,
                  overflowWrap: "anywhere",
                }}
              >
                {getIssueName(selectedItem)}
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
            {renderDetailRow(
              "Date and time",
              `${formatDate(selectedItem.date)}${formatTime(selectedItem.date) ? ` - ${formatTime(selectedItem.date)}` : ""}`,
              Schedule,
            )}
            {renderDetailRow("Type", getTypeStyle(selectedItem).label, TypeIcon)}
            {renderDetailRow("Issue", getIssueName(selectedItem), EventNote)}
            {renderDetailRow("Notes", selectedItem?.notes, Notes)}
            {renderDetailRow("Institution", selectedItem?.institution?.name, Business)}
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}>
              Status
            </Typography>
            <Stepper
              activeStep={selectedItem.stepIndex}
              orientation="vertical"
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                bgcolor: "#f8fafc",
                px: 1.5,
                py: 1,
              }}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>
                    <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                      {label}
                    </Typography>
                    {label === "Waiting" && selectedItem.status === "Waiting" && delayReasonText && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "#7c3aed",
                          mt: 0.25,
                          fontWeight: 600,
                        }}
                      >
                        {delayReasonText}
                      </Typography>
                    )}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      {!selectedItem && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            boxShadow: "0 14px 36px rgba(15, 118, 110, 0.08)",
            mb: 1.5,
          }}
        >
          <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: "#ecfeff", color: "#0f766e" }}>
                <Schedule />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Pending submissions
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#0f172a",
                    fontSize: { xs: 18, sm: 20 },
                    fontWeight: 700,
                    letterSpacing: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Complaints & Requests
                </Typography>
              </Box>
              <Chip
                label={pendingComplaints.length + pendingRequests.length}
                sx={{
                  minWidth: 42,
                  height: 34,
                  borderRadius: 2,
                  bgcolor: "#f0fdfa",
                  color: "#0f766e",
                  fontWeight: 700,
                  border: "1px solid #ccfbf1",
                }}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                mt: 1.5,
              }}
            >
              {[
                ["Total", pendingComplaints.length + pendingRequests.length],
                ["Complaints", pendingComplaints.length],
                ["Requests", pendingRequests.length],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    p: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#0f172a", fontSize: 18, fontWeight: 700 }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              minHeight: 48,
              "& .MuiTab-root": {
                minHeight: 48,
                color: "#64748b",
                fontSize: 13,
                fontWeight: 700,
                textTransform: "none",
              },
              "& .Mui-selected": {
                color: "#0f766e",
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#0f766e",
              },
            }}
          >
            <Tab label="Complaints" />
            <Tab label="Requests" />
          </Tabs>
        </Card>
      )}

      <CardContent sx={{ p: 0 }}>
        {selectedItem ? (
          renderDetails()
        ) : activeItems.length === 0 ? (
          renderEmptyState()
        ) : (
          <Stack spacing={1.25}>{activeItems.map(renderTaskCard)}</Stack>
        )}
      </CardContent>

      <SpeedDial
        ariaLabel="Create complaint or request"
        FabProps={{
          size: "medium",
        }}
        sx={{
          position: "fixed",
          right: 18,
          bottom: 98,
          "& .MuiFab-primary": {
            bgcolor: "#0f766e",
            border: "1px solid #99f6e4",
            boxShadow: "0 14px 32px rgba(15, 118, 110, 0.24)",
            transition: "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
            "&:hover": {
              bgcolor: "#115e59",
              transform: "translateY(-2px) scale(1.04)",
              boxShadow: "0 18px 38px rgba(15, 118, 110, 0.32)",
            },
          },
          "& .MuiSpeedDialAction-fab": {
            width: 44,
            height: 44,
            bgcolor: "#ffffff",
            color: "#0f766e",
            border: "1px solid #ccfbf1",
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.14)",
            transition: "transform 160ms ease, background-color 160ms ease, color 160ms ease",
            "&:hover": {
              bgcolor: "#ecfeff",
              color: "#0891b2",
              transform: "translateY(-1px) scale(1.05)",
            },
          },
          "& .MuiSpeedDialAction-staticTooltipLabel": {
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            color: "#0f172a",
            fontSize: 12,
            fontWeight: 700,
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
          },
        }}
        icon={<Add />}
      >
        <SpeedDialAction
          icon={<AssignmentLate />}
          tooltipTitle="Complaints"
          tooltipOpen
          onClick={() => navigate("/user/user-complaints")}
        />
        <SpeedDialAction
          icon={<Article />}
          tooltipTitle="Requests"
          tooltipOpen
          onClick={() => navigate("/user/user-requests")}
        />
      </SpeedDial>
    </Box>
  );
}

export default Home;
