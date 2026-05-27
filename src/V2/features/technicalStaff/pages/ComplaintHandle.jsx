import { useEffect, useMemo, useState } from "react";

import ArrowBack from "@mui/icons-material/ArrowBack";
import Assignment from "@mui/icons-material/Assignment";
import Business from "@mui/icons-material/Business";
import Call from "@mui/icons-material/Call";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Inbox from "@mui/icons-material/Inbox";
import LocationOn from "@mui/icons-material/LocationOn";
import Notes from "@mui/icons-material/Notes";
import Person from "@mui/icons-material/Person";
import PriorityHigh from "@mui/icons-material/PriorityHigh";
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
  Cancelled: {
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0",
  },
};

const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.Cancelled;

const getComplaintName = (complaint) => complaint?.issue_complaint?.name || "N/A";

const getIssueTypeName = (complaint) =>
  complaint?.type_of_issue?.name || complaint?.department?.name || "";

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

const isMaintenanceComplaint = (complaint) =>
  [
    complaint?.type_of_issue?.name,
    complaint?.complaint_type?.name,
    complaint?.department?.name,
    complaint?.department,
  ].some((value) => ["maintenance", "maintanance"].includes(normalizeKey(getNamedText(value, ""))));

const getComplaintLocation = (complaint) =>
  getNamedText(complaint?.location || complaint?.location_name || complaint?.institution);

const getComplaintSubLocation = (complaint) =>
  getNamedText(
    complaint?.sub_location ||
      complaint?.subLocation ||
      complaint?.sub_location_name ||
      complaint?.subLocationName,
  );

const normalizeList = (value) => (Array.isArray(value) ? value : []);

const parseCompletedNotes = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    return JSON.parse(value.replace(/'/g, '"').replace(/None/g, "null"));
  } catch (error) {
    console.error("Error parsing completed_note:", error);
    return [];
  }
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

function ComplaintHandle() {
  const [complaints, setComplaints] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [delayReasons, setDelayReasons] = useState([]);
  const [newDelayReason, setNewDelayReason] = useState("");
  const [completedReasons, setCompletedReasons] = useState([]);
  const [newCompletedReason, setNewCompletedReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [statusValue, setStatusValue] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const statusCounts = useMemo(
    () =>
      complaints.reduce(
        (counts, complaint) => ({
          ...counts,
          [complaint.status]: (counts[complaint.status] || 0) + 1,
        }),
        {},
      ),
    [complaints],
  );

  const contactNumber = selectedTask?.complainted_by?.mobile_number || "";
  const showMaintenanceDetails = selectedTask && isMaintenanceComplaint(selectedTask);

  useEffect(() => {
    setDelayReasons(normalizeList(selectedTask?.delay_reason));
    setCompletedReasons(parseCompletedNotes(selectedTask?.completed_note));
    setNewDelayReason("");
    setNewCompletedReason("");
    setRemarks("");
    setStatusValue(selectedTask?.status || "");
  }, [selectedTask]);

  useEffect(() => {
    let isMounted = true;

    const fetchComplaints = async ({ showLoading = false } = {}) => {
      const staffId = localStorage.getItem("staff_id");

      if (showLoading) {
        setIsInitialLoading(true);
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/complaints-list/tech-support/`, {
          params: { staff_id: staffId },
        });
        const nextComplaints = normalizeList(response.data);

        if (isMounted) {
          setComplaints(nextComplaints);
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        if (isMounted && showLoading) {
          setIsInitialLoading(false);
        }
      }
    };

    fetchComplaints({ showLoading: true });

    const intervalId = setInterval(() => {
      fetchComplaints();
    }, 3600000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  const handleStatusChange = async (newStatus) => {
    const staffId = localStorage.getItem("staff_id");
    const nextRemark = newStatus === "Completed" ? remarks.trim() : remarks;

    try {
      await axios.patch(`${BASE_URL}/api/complaint/${selectedTask.id}/update-status/`, {
        status: newStatus,
        staff_id: staffId,
        ...(nextRemark ? { completed_note: nextRemark } : {}),
      });

      setSelectedTask((currentTask) =>
        currentTask
          ? { ...currentTask, completed_note: nextRemark || currentTask.completed_note, status: newStatus }
          : currentTask,
      );
      setComplaints((prevComplaints) =>
        prevComplaints.map((task) =>
          task.id === selectedTask.id
            ? { ...task, completed_note: nextRemark || task.completed_note, status: newStatus }
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
      setRemarks("");
      return;
    }

    setConfirmDialog({
      open: true,
      action: () => handleStatusChange(newStatus),
    });
  };

  const handleCompletedStatusUpdate = () => {
    if (!remarks.trim()) {
      toast.warn("Please enter a remark before completing the complaint.");
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

  const handleDelayReasonChange = (event) => {
    setNewDelayReason(event.target.value);
  };

  const handleCompletedReasonChange = (event) => {
    setNewCompletedReason(event.target.value || "");
  };

  const handleSubmitDelayReason = async () => {
    const staffId = localStorage.getItem("staff_id");

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/complaint/${selectedTask.id}/update-delay-reason/`,
        {
          delay_reason: newDelayReason,
          staff_id: staffId,
        },
      );
      const updatedDelayReasons = normalizeList(response.data.delay_reason);

      setSelectedTask((prev) => ({
        ...prev,
        delay_reason: updatedDelayReasons,
      }));
      setDelayReasons(updatedDelayReasons);
      setNewDelayReason("");
      toast.success("Reason updated successfully");
    } catch (error) {
      console.error("Error submitting delay reason:", error);
    }
  };

  const handleNoteSubmit = async () => {
    const staffId = localStorage.getItem("staff_id");

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/complaint/${selectedTask.id}/update-completed-reason/`,
        {
          staff_id: staffId,
          completed_note: newCompletedReason,
        },
      );
      const parsedNotes = parseCompletedNotes(response.data.completed_note);

      setSelectedTask((prev) => ({
        ...prev,
        completed_note: parsedNotes,
      }));
      setCompletedReasons(parsedNotes);
      setNewCompletedReason("");
      toast.success("Notes updated successfully");
    } catch (error) {
      console.error("Error submitting completed reason:", error);
    }
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setNewDelayReason("");
    setNewCompletedReason("");
    setRemarks("");
    setStatusValue("");
  };

  const renderStatusChip = (status) => {
    const statusStyle = getStatusStyle(status);

    return (
      <Chip
        label={status || "N/A"}
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
            textTransform: "none",
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

    if (selectedTask.status === "Completed") {
      return (
        <Select value={selectedTask.status} disabled fullWidth>
          <MenuItem disabled value="Completed">
            Completed
          </MenuItem>
        </Select>
      );
    }

    return (
      <Select value={selectedTask.status || "Cancelled"} disabled fullWidth>
        <MenuItem disabled value={selectedTask.status || "Cancelled"}>
          {selectedTask.status || "Cancelled"}
        </MenuItem>
      </Select>
    );
  };

  const renderHistoryList = ({ items, emptyText, getText }) => (
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
      {items.length > 0 ? (
        items.map((item, index) => (
          <Box
            key={`${item?.created_at || "history"}-${index}`}
            sx={{
              p: 1.25,
              borderBottom: index === items.length - 1 ? "none" : "1px solid #e2e8f0",
            }}
          >
            <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 600 }}>
              {getText(item) || "N/A"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
              {formatDateTime(item.created_at)}
            </Typography>
          </Box>
        ))
      ) : (
        <Typography variant="body2" sx={{ color: "#64748b", p: 1.5 }}>
          {emptyText}
        </Typography>
      )}
    </Box>
  );

  const renderComplaintCard = (task) => (
    <Card
      key={task.id}
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
            icon={<ReportProblem />}
            label="Complaint"
            size="small"
            sx={{
              height: 28,
              borderRadius: 1.5,
              bgcolor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: 11,
              fontWeight: 700,
              "& .MuiChip-icon": { color: "#b91c1c" },
            }}
          />
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
            {getComplaintName(task)}
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
          {isMaintenanceComplaint(task) && getComplaintSubLocation(task)
            ? ` - ${getComplaintSubLocation(task)}`
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
                  <Chip
                    icon={<ReportProblem />}
                    label="Complaint"
                    size="small"
                    sx={{
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      fontSize: 11,
                      fontWeight: 700,
                      "& .MuiChip-icon": { color: "#b91c1c" },
                    }}
                  />
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
                  {getComplaintName(selectedTask)}
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
              {renderDetailRow("Complaint", getComplaintName(selectedTask), ReportProblem)}
              {renderDetailRow("Complained by", selectedTask?.complainted_by?.name, Person)}
              {showMaintenanceDetails &&
                renderDetailRow("Location", getComplaintLocation(selectedTask), LocationOn)}
              {showMaintenanceDetails &&
                renderDetailRow("Sub Location", getComplaintSubLocation(selectedTask), Business)}
              {showMaintenanceDetails &&
                renderDetailRow("Priority", selectedTask?.priority, PriorityHigh)}
              {renderDetailRow("Remark", selectedTask?.remark, Notes)}
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

            {statusValue === "Completed" && selectedTask.status !== "Completed" && (
              <Box sx={{ mt: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}
                >
                  Completion Remark
                </Typography>
                <TextField
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  fullWidth
                  placeholder="Enter remark before completing"
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
                  disabled={!remarks.trim()}
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

            {selectedTask.status === "Waiting" && (
              <Box sx={{ mt: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}
                >
                  Delay Reason
                </Typography>
                {renderHistoryList({
                  items: delayReasons,
                  emptyText: "No delay reasons available.",
                  getText: (item) => item.reason,
                })}
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
                {newDelayReason.trim().length > 0 && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmitDelayReason}
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
                    Submit Delay Reason
                  </Button>
                )}
              </Box>
            )}

            {selectedTask.status === "Completed" && (
              <Box sx={{ mt: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}
                >
                  Completed Note
                </Typography>
                {renderHistoryList({
                  items: completedReasons,
                  emptyText: "No completed notes available.",
                  getText: (item) => item.completed_note,
                })}
                <TextField
                  value={newCompletedReason}
                  onChange={handleCompletedReasonChange}
                  fullWidth
                  placeholder="Enter completed reason"
                  multiline
                  minRows={2}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#ffffff",
                    },
                  }}
                />
                {newCompletedReason.trim().length > 0 && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleNoteSubmit}
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
                    Submit Completed Note
                  </Button>
                )}
              </Box>
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
                <ReportProblem />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ color: "#0f172a", fontWeight: 700 }}>
                  Update status?
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  This will change the selected complaint.
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ px: 2.25, pt: 1.75, pb: 1 }}>
            <DialogContentText sx={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
              Please confirm before updating the complaint status. You can continue from the details
              page after this action.
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
            <Avatar sx={{ width: 44, height: 44, bgcolor: "#ecfeff", color: "#0f766e" }}>
              <ReportProblem />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Complaint queue
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
                All Complaints
              </Typography>
            </Box>
            <Chip
              label={isInitialLoading ? "..." : complaints.length}
              sx={{
                minWidth: 42,
                height: 34,
                borderRadius: 2,
                bgcolor: "#ecfeff",
                color: "#0f766e",
                fontWeight: 700,
                border: "1px solid #bae6fd",
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
              ["Pending", isInitialLoading ? "..." : statusCounts.Pending || 0],
              ["Progress", isInitialLoading ? "..." : statusCounts["In Progress"] || 0],
              ["Waiting", isInitialLoading ? "..." : statusCounts.Waiting || 0],
              ["Completed", isInitialLoading ? "..." : statusCounts.Completed || 0],
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
              Loading complaints
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 320 }}>
              Checking complaints assigned to you.
            </Typography>
          </Stack>
        </Card>
      ) : complaints.length === 0 ? (
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
              No complaints available
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 320 }}>
              Assigned complaints will appear here.
            </Typography>
          </Stack>
        </Card>
      ) : (
        <Stack spacing={1.25}>{complaints.map(renderComplaintCard)}</Stack>
      )}
    </Box>
  );
}

export default ComplaintHandle;
