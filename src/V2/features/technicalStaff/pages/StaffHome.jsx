import { useEffect, useMemo, useState } from "react";

import ArrowBack from "@mui/icons-material/ArrowBack";
import Assignment from "@mui/icons-material/Assignment";
import Business from "@mui/icons-material/Business";
import Call from "@mui/icons-material/Call";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Inbox from "@mui/icons-material/Inbox";
import Notes from "@mui/icons-material/Notes";
import Person from "@mui/icons-material/Person";
import ReportProblem from "@mui/icons-material/ReportProblem";
import Schedule from "@mui/icons-material/Schedule";
import WhatsApp from "@mui/icons-material/WhatsApp";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import { toast } from "react-toastify";

import BASE_URL from "../../../shared/utils/baseUrl";

const TASK_TYPE_STYLES = {
  complaint: {
    label: "Complaint",
    color: "#b91c1c",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: ReportProblem,
  },
  request: {
    label: "Request",
    color: "#0f766e",
    bg: "#ecfeff",
    border: "#bae6fd",
    icon: Assignment,
  },
};

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

const getTaskKey = (task) => `${task?.type || "task"}-${task?.id}`;

const isSameTask = (firstTask, secondTask) =>
  firstTask?.id === secondTask?.id && firstTask?.type === secondTask?.type;

const mergeUniqueTasks = (previousTasks, incomingTasks) => {
  const existingKeys = new Set(previousTasks.map(getTaskKey));
  const newTasks = incomingTasks.filter((task) => !existingKeys.has(getTaskKey(task)));

  return [...previousTasks, ...newTasks];
};

const getTaskType = (task) => task?.type || (task?.issue_complaint ? "complaint" : "request");

const getTypeStyle = (task) => TASK_TYPE_STYLES[getTaskType(task)] || TASK_TYPE_STYLES.request;

const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.Pending;

const getIssueName = (task) => task?.issue_complaint?.name || task?.issue_request?.name || "N/A";

const getIssueTypeName = (task) =>
  task?.type_of_issue?.name || task?.type_of_request?.name || task?.department?.name || "";

const getNamedText = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value.name || value.title || value.label || value.code || value.id || fallback;
  }

  return String(value);
};

const hasCompletedNote = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => hasCompletedNote(item?.completed_note || item?.reason || item));
  }

  if (value && typeof value === "object") {
    return hasCompletedNote(value.completed_note || value.reason);
  }

  return value !== null && value !== undefined && String(value).trim() !== "";
};

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isMaintenanceTask = (task) =>
  [task?.type_of_issue?.name, task?.type_of_request?.name].some((value) =>
    ["maintenance", "maintanance"].includes(normalizeKey(value)),
  );

const getTaskSubLocation = (task) =>
  getNamedText(
    task?.sub_location || task?.subLocation || task?.sub_location_name || task?.subLocationName,
  );

const getPerson = (task) => task?.complainted_by || task?.requested_by || null;

const getPersonLabel = (task) =>
  getTaskType(task) === "complaint" ? "Reported by" : "Requested by";

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

function StaffHome() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [delayReasons, setDelayReasons] = useState([]);
  const [completionRemark, setCompletionRemark] = useState("");
  const [newDelayReason, setNewDelayReason] = useState("");
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const pendingTasks = useMemo(
    () => serviceRequests.filter((task) => task.status === "Pending"),
    [serviceRequests],
  );

  const pendingComplaintsCount = useMemo(
    () => pendingTasks.filter((task) => getTaskType(task) === "complaint").length,
    [pendingTasks],
  );

  const pendingRequestsCount = pendingTasks.length - pendingComplaintsCount;

  const selectedTypeStyle = getTypeStyle(selectedTask);
  const selectedPerson = getPerson(selectedTask);
  const hasSelectedCompletedNote = hasCompletedNote(selectedTask?.completed_note);
  const contactNumber = selectedPerson?.mobile_number || "";

  useEffect(() => {
    setDelayReasons(Array.isArray(selectedTask?.delay_reason) ? selectedTask.delay_reason : []);
    setCompletionRemark("");
    setNewDelayReason("");
    setShowSubmitButton(false);
    setStatusValue(selectedTask?.status || "");
  }, [selectedTask?.id, selectedTask?.type, selectedTask?.delay_reason, selectedTask?.status]);

  useEffect(() => {
    let isMounted = true;

    const fetchComplaints = async () => {
      const staffId = localStorage.getItem("staff_id");

      try {
        const response = await axios.get(`${BASE_URL}/api/complaints-list/tech-support/`, {
          params: { staff_id: staffId },
        });
        const complaints = response.data.map((item) => ({ ...item, type: "complaint" }));

        if (isMounted) {
          setServiceRequests((prevRequests) => mergeUniqueTasks(prevRequests, complaints));
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    const fetchRequests = async () => {
      const staffId = localStorage.getItem("staff_id");

      try {
        const response = await axios.get(`${BASE_URL}/api/requests-list/tech-support/`, {
          params: { staff_id: staffId },
        });
        const requests = response.data.map((item) => ({ ...item, type: "request" }));

        if (isMounted) {
          setServiceRequests((prevRequests) => mergeUniqueTasks(prevRequests, requests));
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    const fetchInitialTasks = async () => {
      setIsInitialLoading(true);
      await Promise.allSettled([fetchComplaints(), fetchRequests()]);

      if (isMounted) {
        setIsInitialLoading(false);
      }
    };

    fetchInitialTasks();

    const intervalId = setInterval(() => {
      fetchComplaints();
      fetchRequests();
    }, 3600000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleDelayReasonChange = (event) => {
    const value = event.target.value;

    setNewDelayReason(value);
    setShowSubmitButton(value.trim().length > 0);
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  const handleStatusChange = async (newStatus) => {
    const staffId = localStorage.getItem("staff_id");
    const isComplaint = selectedTask.type === "complaint";
    const nextCompletedNote =
      newStatus === "Completed" && !hasCompletedNote(selectedTask?.completed_note)
        ? completionRemark.trim()
        : "";
    const endpoint = isComplaint
      ? `${BASE_URL}/api/complaint/${selectedTask.id}/update-status/`
      : `${BASE_URL}/api/request/${selectedTask.id}/update-status/`;

    try {
      await axios.patch(endpoint, {
        status: newStatus,
        staff_id: staffId,
        ...(nextCompletedNote ? { completed_note: nextCompletedNote } : {}),
      });

      setSelectedTask((currentTask) =>
        currentTask
          ? {
              ...currentTask,
              ...(nextCompletedNote ? { completed_note: nextCompletedNote } : {}),
              status: newStatus,
            }
          : currentTask,
      );
      setServiceRequests((prevRequests) =>
        prevRequests.map((task) =>
          isSameTask(task, selectedTask)
            ? {
                ...task,
                ...(nextCompletedNote ? { completed_note: nextCompletedNote } : {}),
                status: newStatus,
              }
            : task,
        ),
      );
      setStatusValue(newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAttendClick = () => {
    setConfirmDialog({
      open: true,
      action: () => handleStatusChange("In Progress"),
    });
  };

  const handleDropdownChange = (event) => {
    const newStatus = event.target.value;

    setStatusValue(newStatus);

    if (newStatus === "Completed") {
      if (hasSelectedCompletedNote) {
        setConfirmDialog({
          open: true,
          action: () => handleStatusChange(newStatus),
        });
        return;
      }

      setCompletionRemark("");
      return;
    }

    if (newStatus === "In Progress" || newStatus === "Completed" || newStatus === "Waiting") {
      setConfirmDialog({
        open: true,
        action: () => handleStatusChange(newStatus),
      });
      return;
    }

    handleStatusChange(newStatus);
  };

  const handleCompletedStatusUpdate = () => {
    if (hasSelectedCompletedNote) {
      toast.warn("Completed note already exists.");
      return;
    }

    if (!completionRemark.trim()) {
      toast.warn("Please enter a completed note before completing.");
      return;
    }

    setConfirmDialog({
      open: true,
      action: () => handleStatusChange("Completed"),
    });
  };

  const handleDialogClose = (confirm) => {
    setConfirmDialog({ open: false, action: null });

    if (!confirm) {
      setStatusValue(selectedTask?.status || "");
      return;
    }

    if (confirm && confirmDialog.action) {
      confirmDialog.action();
    }
  };

  const handleSubmit = async () => {
    const staffId = localStorage.getItem("staff_id");
    const isComplaint = selectedTask.type === "complaint";
    const endpoint = isComplaint
      ? `${BASE_URL}/api/complaint/${selectedTask.id}/update-delay-reason/`
      : `${BASE_URL}/api/request/${selectedTask.id}/update-delay-reason/`;

    try {
      const response = await axios.patch(endpoint, {
        delay_reason: newDelayReason,
        staff_id: staffId,
      });

      const updatedDelayReasons = Array.isArray(response.data.delay_reason)
        ? response.data.delay_reason
        : [];

      setSelectedTask((prev) => ({
        ...prev,
        delay_reason: updatedDelayReasons,
      }));
      setDelayReasons(updatedDelayReasons);
      setNewDelayReason("");
      setShowSubmitButton(false);
      toast.success("Reason updated successfully");
    } catch (error) {
      console.error("Error submitting delay reason:", error);
    }
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setCompletionRemark("");
    setNewDelayReason("");
    setShowSubmitButton(false);
    setStatusValue("");
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

  const renderTypeChip = (task) => {
    const typeStyle = getTypeStyle(task);
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
      <Avatar
        sx={{
          width: 34,
          height: 34,
          bgcolor: "#ecfeff",
          color: "#0f766e",
        }}
      >
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

  const renderStatusControl = () => {
    if (selectedTask.status === "Pending") {
      return (
        <Button
          variant="contained"
          fullWidth
          onClick={handleAttendClick}
          sx={{
            minHeight: 48,
            borderRadius: 2,
            bgcolor: "#0f766e",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { bgcolor: "#115e59", boxShadow: "none" },
          }}
        >
          Attend
        </Button>
      );
    }

    if (selectedTask.status === "Waiting") {
      return (
        <Select value={statusValue || selectedTask.status} onChange={handleDropdownChange} fullWidth>
          <MenuItem disabled hidden value="Waiting">
            Waiting
          </MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      );
    }

    if (selectedTask.status === "In Progress") {
      return (
        <Select value={statusValue || selectedTask.status} onChange={handleDropdownChange} fullWidth>
          <MenuItem disabled hidden value="In Progress">
            In Progress
          </MenuItem>
          <MenuItem value="Waiting">Waiting</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      );
    }

    return (
      <Select value={selectedTask.status} onChange={handleDropdownChange} disabled fullWidth>
        <MenuItem disabled value="Completed">
          Completed
        </MenuItem>
      </Select>
    );
  };

  const renderTaskCard = (task) => (
    <Card
      key={getTaskKey(task)}
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
          {renderTypeChip(task)}
          {renderStatusChip(task.status)}
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
            {formatDateTime(task.date)}
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
            {getIssueName(task)}
          </Typography>
          {getIssueTypeName(task) && (
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
              {getIssueTypeName(task)}
            </Typography>
          )}
        </Stack>

        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
          {task?.institution?.name || task?.department?.name || "N/A"}
          {isMaintenanceTask(task) && getTaskSubLocation(task)
            ? ` - ${getTaskSubLocation(task)}`
            : ""}
        </Typography>
      </Box>

      <Divider />

      <Button
        fullWidth
        endIcon={<ChevronRight />}
        onClick={() => handleViewDetails(task)}
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

  if (selectedTask) {
    const TypeIcon = selectedTypeStyle.icon;

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
                aria-label="Back to list"
                onClick={handleBackToList}
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
                  {renderTypeChip(selectedTask)}
                  {renderStatusChip(selectedTask.status)}
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
                  {getIssueName(selectedTask)}
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
              {renderDetailRow("Date and time", formatDateTime(selectedTask.date), Schedule)}
              {renderDetailRow("Institution", selectedTask?.institution?.name, Business)}
              {renderDetailRow("Department", selectedTask?.department?.name, Assignment)}
              {renderDetailRow(selectedTypeStyle.label, getIssueName(selectedTask), TypeIcon)}
              {renderDetailRow(getPersonLabel(selectedTask), selectedPerson?.name, Person)}
              {isMaintenanceTask(selectedTask) &&
                renderDetailRow("Department Admin", getTaskSubLocation(selectedTask), Business)}
            </Box>

            <Box sx={{ mt: 1.25 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                <Notes sx={{ color: "#64748b", fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                  Notes
                </Typography>
              </Stack>
              <Box
                sx={{
                  minHeight: 112,
                  maxHeight: 180,
                  overflowY: "auto",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  p: 1.5,
                }}
              >
                <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.6 }}>
                  {selectedTask?.notes || "No additional notes provided."}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 1.5 }}>
              <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}>
                Status
              </Typography>
              {renderStatusControl()}
            </Box>

            {statusValue === "Completed" &&
              selectedTask?.status !== "Completed" &&
              !hasSelectedCompletedNote && (
              <Box sx={{ mt: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}
                >
                  Completed Note
                </Typography>
                <TextField
                  value={completionRemark}
                  onChange={(event) => setCompletionRemark(event.target.value)}
                  fullWidth
                  placeholder="Enter completed note"
                  multiline
                  minRows={3}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#ffffff",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCompletedStatusUpdate}
                  disabled={!completionRemark.trim()}
                  sx={{
                    mt: 1,
                    minHeight: 46,
                    borderRadius: 2,
                    bgcolor: "#0f766e",
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#115e59", boxShadow: "none" },
                  }}
                >
                  Update Status
                </Button>
              </Box>
            )}

            {selectedTask?.status === "Waiting" && (
              <Box sx={{ mt: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}
                >
                  Delay Reason
                </Typography>

                <Box
                  sx={{
                    maxHeight: 190,
                    overflowY: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                    mb: 1,
                  }}
                >
                  {delayReasons.length > 0 ? (
                    delayReasons.map((remarks, index) => (
                      <Box
                        key={`${remarks?.created_at || "reason"}-${index}`}
                        sx={{
                          p: 1.25,
                          borderBottom:
                            index === delayReasons.length - 1 ? "none" : "1px solid #e2e8f0",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 600 }}>
                          {remarks.reason}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                          {formatDateTime(remarks.created_at)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: "#64748b", p: 1.5 }}>
                      No delay reasons available.
                    </Typography>
                  )}
                </Box>

                <TextField
                  value={newDelayReason}
                  onChange={handleDelayReasonChange}
                  fullWidth
                  placeholder="Enter delay reason"
                  multiline
                  minRows={2}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#ffffff",
                    },
                  }}
                />
              </Box>
            )}

            {selectedTask?.status === "Waiting" && showSubmitButton && (
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
                sx={{
                  mt: 1,
                  minHeight: 46,
                  borderRadius: 2,
                  bgcolor: "#0f766e",
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#115e59", boxShadow: "none" },
                }}
              >
                Submit Delay Reason
              </Button>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                disabled={!contactNumber}
                href={contactNumber ? `https://wa.me/${contactNumber}` : undefined}
                target="_blank"
                startIcon={<WhatsApp />}
                sx={{
                  minHeight: 48,
                  borderRadius: 2,
                  bgcolor: "#f0fdf4",
                  borderColor: "#86efac",
                  color: "#15803d",
                  fontWeight: 700,
                  boxShadow: "none",
                  textTransform: "none",
                  "& .MuiButton-startIcon": { mr: 0.75 },
                  "&:hover": {
                    bgcolor: "#dcfce7",
                    borderColor: "#22c55e",
                    color: "#166534",
                    boxShadow: "0 10px 24px rgba(34, 197, 94, 0.14)",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#f8fafc",
                    borderColor: "#e2e8f0",
                  },
                }}
              >
                WhatsApp
              </Button>

              <Button
                variant="outlined"
                fullWidth
                disabled={!contactNumber}
                href={contactNumber ? `tel:${contactNumber}` : undefined}
                target="_blank"
                startIcon={<Call />}
                sx={{
                  minHeight: 48,
                  borderRadius: 2,
                  bgcolor: "#eff6ff",
                  borderColor: "#bfdbfe",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  boxShadow: "none",
                  textTransform: "none",
                  "& .MuiButton-startIcon": { mr: 0.75 },
                  "&:hover": {
                    bgcolor: "#dbeafe",
                    borderColor: "#60a5fa",
                    color: "#1e40af",
                    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.14)",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#f8fafc",
                    borderColor: "#e2e8f0",
                  },
                }}
              >
                Call
              </Button>
            </Stack>
          </Box>
        </Card>

        <Dialog
          open={confirmDialog.open}
          onClose={() => handleDialogClose(false)}
          PaperProps={{
            sx: {
              width: "calc(100% - 32px)",
              maxWidth: 380,
              borderRadius: 3,
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
            },
          }}
        >
          <DialogTitle sx={{ px: 2.25, pt: 2.25, pb: 0 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha("#0f766e", 0.1),
                  color: "#0f766e",
                }}
              >
                <Schedule />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ color: "#0f172a", fontWeight: 700 }}>
                  Update status?
                  <Typography className="block" variant="caption" sx={{ color: "#64748b" }}>
                    This will change the selected task.
                  </Typography>
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ px: 2.25, pt: 1.75, pb: 1 }} className="pt-2">
            <DialogContentText sx={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
              Please confirm before updating the task status. You can continue from the details page
              after this action.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 2.25, pb: 2.25, gap: 1 }}>
            <Button
              onClick={() => handleDialogClose(false)}
              variant="outlined"
              sx={{
                minHeight: 42,
                borderRadius: 2,
                borderColor: "#cbd5e1",
                color: "#475569",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDialogClose(true)}
              variant="contained"
              autoFocus
              sx={{
                minHeight: 42,
                borderRadius: 2,
                bgcolor: "#0f766e",
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { bgcolor: "#115e59", boxShadow: "none" },
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
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
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: "#ecfeff",
                color: "#0f766e",
              }}
            >
              <Schedule />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Pending work
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
            {/* <Chip
              label={isInitialLoading ? "..." : pendingTasks.length}
              sx={{
                minWidth: 42,
                height: 34,
                borderRadius: 2,
                bgcolor: "#f0fdfa",
                color: "#0f766e",
                fontWeight: 700,
                border: "1px solid #ccfbf1",
              }}
            /> */}
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
              ["Total", isInitialLoading ? "..." : pendingTasks.length],
              ["Complaints", isInitialLoading ? "..." : pendingComplaintsCount],
              ["Requests", isInitialLoading ? "..." : pendingRequestsCount],
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

      {isInitialLoading ? (
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
              Loading assigned tasks
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 320 }}>
              Checking complaints and requests assigned to you.
            </Typography>
          </Stack>
        </Card>
      ) : pendingTasks.length === 0 ? (
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
              No pending tasks
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 320 }}>
              New assigned complaints and requests will appear here.
            </Typography>
          </Stack>
        </Card>
      ) : (
        <Stack spacing={1.25}>{pendingTasks.map(renderTaskCard)}</Stack>
      )}
    </Box>
  );
}

export default StaffHome;
