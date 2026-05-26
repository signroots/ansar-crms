import { useEffect, useMemo, useState } from "react";

import ArrowBack from "@mui/icons-material/ArrowBack";
import AssignmentLate from "@mui/icons-material/AssignmentLate";
import Business from "@mui/icons-material/Business";
import CalendarMonth from "@mui/icons-material/CalendarMonth";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Inbox from "@mui/icons-material/Inbox";
import LocationOn from "@mui/icons-material/LocationOn";
import Notes from "@mui/icons-material/Notes";
import PriorityHigh from "@mui/icons-material/PriorityHigh";
import Schedule from "@mui/icons-material/Schedule";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Card,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";

import BASE_URL from "../../../shared/utils/baseUrl";

const STATUS_STEPS = ["Pending", "In Progress", "Waiting", "Completed"];

const STATUS_STYLES = {
  Pending: {
    color: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    help: "Submitted and waiting for review.",
  },
  "In Progress": {
    color: "#1d4ed8",
    bg: "#eff6ff",
    border: "#bfdbfe",
    help: "The assigned team has started working on it.",
  },
  Waiting: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    help: "Progress is paused until the noted reason is resolved.",
  },
  Completed: {
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    help: "The item has been completed.",
  },
};

const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.Pending;

const getStatusIndex = (status) => {
  const index = STATUS_STEPS.indexOf(status);

  return index >= 0 ? index : 0;
};

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

const formatDateTime = (value) => {
  const date = formatDate(value);
  const time = formatTime(value);

  return time ? `${date} - ${time}` : date;
};

const formatReasonTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date
    .toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
};

const normalizeReasons = (value) => (Array.isArray(value) ? value : []);

const emptyCounts = {
  Completed: 0,
  "In Progress": 0,
  Pending: 0,
  Waiting: 0,
};

const normalizeSubmittedResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      counts: data.reduce(
        (counts, item) => ({
          ...counts,
          [item.status]: (counts[item.status] || 0) + 1,
        }),
        { ...emptyCounts },
      ),
      results: data,
      total: data.length,
    };
  }

  const counts = data?.counts || {};
  const results = Array.isArray(data?.results) ? data.results : [];

  return {
    counts: {
      Completed: Number(counts.completed_count || 0),
      "In Progress": Number(counts.in_progress_count || counts.inprogress_count || 0),
      Pending: Number(counts.pending_count || 0),
      Waiting: Number(counts.on_hold_count || 0),
    },
    results,
    total: Number(counts.total_count || results.length),
  };
};

const getNamedText = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value.name || value.title || value.label || value.code || value.id || fallback;
  }

  return String(value);
};

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isMaintenanceItem = (item) =>
  [
    item?.type_of_issue?.name,
    item?.type_of_request?.name,
    item?.complaint_type?.name,
    item?.department?.name,
    item?.department,
  ].some((value) => ["maintenance", "maintanance"].includes(normalizeKey(getNamedText(value, ""))));

const isStageProgramItem = (item) => {
  const requestName = normalizeKey(getNamedText(item?.issue_request, ""));

  return (
    (requestName.includes("stage") && requestName.includes("program")) ||
    Boolean(item?.program_name || item?.program_date || item?.program_time)
  );
};

const getItemLocation = (item) =>
  getNamedText(item?.location || item?.location_name || item?.institution);

const getItemSubLocation = (item) =>
  getNamedText(
    item?.sub_location || item?.subLocation || item?.sub_location_name || item?.subLocationName,
  );

function SubmittedItemsPage({ endpoint, itemKind, itemLabel, getIssueName, typeColor }) {
  const [items, setItems] = useState([]);
  const [itemCounts, setItemCounts] = useState(emptyCounts);
  const [itemTotal, setItemTotal] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [focusedStep, setFocusedStep] = useState("Pending");

  const Icon = itemKind === "complaint" ? AssignmentLate : CalendarMonth;

  const selectedStatusIndex = getStatusIndex(selectedItem?.status);
  const selectedReasons = normalizeReasons(selectedItem?.delay_reason);
  const progressValue = selectedItem ? (selectedStatusIndex / (STATUS_STEPS.length - 1)) * 100 : 0;
  const focusedStatusStyle = getStatusStyle(focusedStep);
  const showMaintenanceDetails = selectedItem && isMaintenanceItem(selectedItem);
  const showStageProgramDetails =
    itemKind === "request" && selectedItem && isStageProgramItem(selectedItem);
  const getIssueTypeName = (item) =>
    item?.type_of_request?.name || item?.type_of_issue?.name || item?.department?.name || "";

  const statusCounts = useMemo(() => itemCounts, [itemCounts]);

  useEffect(() => {
    const resetPreview = () => {
      setSelectedItem(null);
      setFocusedStep("Pending");
    };

    window.addEventListener("staffTeacher:navigation", resetPreview);

    return () => {
      window.removeEventListener("staffTeacher:navigation", resetPreview);
    };
  }, []);

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

    axios
      .get(`${BASE_URL}${endpoint}`, {
        params: { staff_id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const normalizedData = normalizeSubmittedResponse(response.data);

        setItems(normalizedData.results);
        setItemCounts(normalizedData.counts);
        setItemTotal(normalizedData.total);
      })
      .catch((error) => {
        console.error(`Error fetching ${itemLabel.toLowerCase()}:`, error);
      });
  }, [endpoint, itemLabel]);

  const handleListClick = (item) => {
    setSelectedItem(item);
    setFocusedStep(item.status || "Pending");
  };

  const handleBackClick = () => {
    setSelectedItem(null);
    setFocusedStep("Pending");
  };

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

  const renderDetailRow = (label, value, RowIcon) => (
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
        <RowIcon sx={{ fontSize: 19 }} />
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

  const renderListCard = (item) => (
    <Card
      key={item.id}
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
          <Chip
            icon={<Icon />}
            label={itemLabel}
            size="small"
            sx={{
              height: 28,
              borderRadius: 1.5,
              bgcolor: typeColor.bg,
              border: `1px solid ${typeColor.border}`,
              color: typeColor.color,
              fontSize: 11,
              fontWeight: 700,
              "& .MuiChip-icon": { color: typeColor.color },
            }}
          />
          {renderStatusChip(item.status)}
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
            {formatDateTime(item.date)}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              flex: 1,
              color: "#0f172a",
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.25,
              overflowWrap: "anywhere",
              minWidth: 0,
            }}
          >
            {getIssueName(item)}
          </Typography>
          {getIssueTypeName(item) && (
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontSize: 12,
                fontWeight: 700,
                maxWidth: "42%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getIssueTypeName(item)}
            </Typography>
          )}
        </Stack>

        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
          {item?.institution?.name || "Submitted item"}
          {isMaintenanceItem(item) && getItemSubLocation(item)
            ? ` - ${getItemSubLocation(item)}`
            : ""}
        </Typography>
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
        View progress
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
          No {itemLabel.toLowerCase()} found
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 320 }}>
          Submitted {itemLabel.toLowerCase()} will appear here.
        </Typography>
      </Stack>
    </Card>
  );

  const renderProgress = () => (
    <Box
      sx={{
        mt: 1.5,
        border: "1px solid #e2e8f0",
        borderRadius: 3,
        bgcolor: "#f8fafc",
        p: 1.5,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 800 }}>
            Progress
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
            Tap a stage to view context
          </Typography>
        </Box>
        <Chip
          label={`${Math.round(progressValue)}%`}
          size="small"
          sx={{
            height: 30,
            minWidth: 52,
            borderRadius: 1.5,
            bgcolor: "#ecfeff",
            border: "1px solid #bae6fd",
            color: "#0f766e",
            fontWeight: 800,
          }}
        />
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progressValue}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: "#e2e8f0",
          mb: 1.5,
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            bgcolor: "#0f766e",
          },
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 0.75,
        }}
      >
        {STATUS_STEPS.map((step, index) => {
          const statusStyle = getStatusStyle(step);
          const isReached = index <= selectedStatusIndex;
          const isFocused = step === focusedStep;

          return (
            <ButtonBase
              key={step}
              onClick={() => setFocusedStep(step)}
              sx={{
                minHeight: 78,
                borderRadius: 2,
                border: `1px solid ${isFocused ? statusStyle.border : "#e2e8f0"}`,
                bgcolor: isReached ? statusStyle.bg : "#ffffff",
                color: isReached ? statusStyle.color : "#94a3b8",
                p: 0.75,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                boxShadow: isFocused ? "0 10px 24px rgba(15, 23, 42, 0.1)" : "none",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.1)",
                },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: isReached ? statusStyle.color : "#e2e8f0",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {index + 1}
              </Box>
              <Typography
                sx={{
                  fontSize: 11,
                  lineHeight: 1.15,
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                {step}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <Box
        sx={{
          mt: 1,
          borderRadius: 2,
          border: `1px solid ${focusedStatusStyle.border}`,
          bgcolor: focusedStatusStyle.bg,
          px: 1.25,
          py: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: focusedStatusStyle.color, fontWeight: 800 }}>
          {focusedStep}
        </Typography>
        <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>
          {focusedStatusStyle.help}
        </Typography>

        {focusedStep === "Waiting" && selectedReasons.length > 0 && (
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {selectedReasons.map((reason, index) => (
              <Box key={`${reason?.created_at || "reason"}-${index}`}>
                <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                  {reason.reason || "N/A"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  {formatReasonTime(reason.created_at)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );

  if (selectedItem) {
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
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.75 }}>
              <IconButton
                aria-label={`Back to ${itemLabel.toLowerCase()} list`}
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
                  <Chip
                    icon={<Icon />}
                    label={itemLabel}
                    size="small"
                    sx={{
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: typeColor.bg,
                      border: `1px solid ${typeColor.border}`,
                      color: typeColor.color,
                      fontSize: 11,
                      fontWeight: 700,
                      "& .MuiChip-icon": { color: typeColor.color },
                    }}
                  />
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
              {renderDetailRow("Date and time", formatDateTime(selectedItem.date), Schedule)}
              {renderDetailRow(itemLabel, getIssueName(selectedItem), Icon)}
              {renderDetailRow("Institution", selectedItem?.institution?.name, Business)}
              {showMaintenanceDetails &&
                renderDetailRow("Location", getItemLocation(selectedItem), LocationOn)}
              {showMaintenanceDetails &&
                renderDetailRow("Sub Location", getItemSubLocation(selectedItem), Business)}
              {showMaintenanceDetails &&
                renderDetailRow("Priority", selectedItem?.priority, PriorityHigh)}
              {showStageProgramDetails &&
                renderDetailRow("Program Name", selectedItem?.program_name, CalendarMonth)}
              {showStageProgramDetails &&
                renderDetailRow("Program Date", selectedItem?.program_date, CalendarMonth)}
              {showStageProgramDetails &&
                renderDetailRow("Program Time", selectedItem?.program_time, Schedule)}
              {renderDetailRow("Notes", selectedItem?.notes, Notes)}
            </Box>

            {renderProgress()}
          </Box>
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
          boxShadow: "0 14px 36px rgba(15, 118, 110, 0.08)",
          mb: 1.5,
        }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: typeColor.bg, color: typeColor.color }}>
              <Icon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Submitted work
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
                All {itemLabel}s
              </Typography>
            </Box>
            <Chip
              label={itemTotal}
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
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              mt: 1.5,
            }}
          >
            {[
              ["Pending", statusCounts.Pending || 0],
              ["Progress", statusCounts["In Progress"] || 0],
              ["Waiting", statusCounts.Waiting || 0],
              ["Completed", statusCounts.Completed || 0],
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
                <Typography variant="h6" sx={{ color: "#0f172a", fontSize: 18, fontWeight: 700 }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      {items.length === 0 ? (
        renderEmptyState()
      ) : (
        <Stack spacing={1.25}>{items.map(renderListCard)}</Stack>
      )}
    </Box>
  );
}

export default SubmittedItemsPage;
