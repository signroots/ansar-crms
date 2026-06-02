import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Drawer,
  Empty,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import * as XLSX from "xlsx";
import { BiExport, BiRefresh } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";
import {
  FiAlertOctagon,
  FiAlertTriangle,
  FiArrowDownCircle,
  FiEye,
  FiMinusCircle,
  FiSearch,
} from "react-icons/fi";
import { LuBuilding2, LuClock3, LuListChecks } from "react-icons/lu";
import { toast } from "react-toastify";

import { apiService } from "../../../../services/api/Api.service";
import { ROLE_GROUPS, USER_ROLES } from "../../../../shared/constants/roles";
import { getAuthSession } from "../../../../shared/utils/authSession";
import CreateComplaints from "./CreateComplaints";

const { RangePicker } = DatePicker;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_DELAY = 500;
const COMPLAINTS_LIST_ENDPOINT = "/api/api/complaints-list/";
const STATUS_OPTIONS = ["Pending", "In Progress", "Waiting", "Completed"];

const statusMeta = {
  Completed: {
    color: "success",
    accent: "#0cb899",
  },
  Pending: {
    color: "error",
    accent: "#ef4444",
  },
  "In Progress": {
    color: "processing",
    accent: "#3b82f6",
  },
  Waiting: {
    color: "warning",
    accent: "#f59e0b",
  },
};

const styles = {
  page: {
    display: "grid",
    gap: "18px",
    color: "var(--admin-text, #101828)",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "16px",
    alignItems: "end",
    padding: "22px",
    borderRadius: "22px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background:
      "radial-gradient(circle at 10% 12%, rgba(239, 68, 68, 0.14), transparent 34%), linear-gradient(135deg, var(--admin-surface, #ffffff), var(--admin-surface-soft, #f8fafc))",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
    padding: "8px 10px",
    borderRadius: "999px",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "16px 0 0",
    color: "var(--admin-text, #101828)",
    fontSize: "34px",
    fontWeight: 850,
    lineHeight: 1.1,
    letterSpacing: "0",
  },
  subtitle: {
    maxWidth: "720px",
    margin: "10px 0 0",
    color: "var(--admin-muted, #667085)",
    fontSize: "14px",
    lineHeight: 1.65,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "10px",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "14px",
  },
  metric: (accent) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "14px",
    minHeight: "112px",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface, #ffffff)",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
    "--metric-accent": accent,
  }),
  metricLabel: {
    margin: 0,
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  metricValue: {
    margin: "8px 0 0",
    color: "var(--admin-text, #101828)",
    fontSize: "30px",
    fontWeight: 850,
    lineHeight: 1,
  },
  metricIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    color: "var(--metric-accent)",
    background: "color-mix(in srgb, var(--metric-accent) 14%, transparent)",
    flexShrink: 0,
  },
  panel: {
    borderRadius: "20px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface, #ffffff)",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
    overflow: "hidden",
  },
  toolbar: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 1fr) 190px auto",
    gap: "12px",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid var(--admin-border, #e2e8f0)",
  },
  tableWrap: {
    padding: "0 16px 16px",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    padding: "14px 16px",
    borderTop: "1px solid var(--admin-border, #e2e8f0)",
  },
  muted: {
    color: "var(--admin-muted, #667085)",
    fontSize: "13px",
    fontWeight: 500,
  },
  dateBlock: {
    display: "grid",
    gap: "2px",
    // marginTop: "7px",
  },
  dateCaption: {
    color: "var(--admin-muted, #667085)",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  dateValue: {
    color: "var(--admin-text, #101828)",
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: 1.25,
  },
  timeValue: {
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 700,
    lineHeight: 1.25,
  },
  dateEmpty: {
    display: "block",
    // marginTop: "7px",
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 500,
  },
  iconButton: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface-soft, #f8fafc)",
    color: "var(--admin-text, #101828)",
    display: "grid",
    placeItems: "center",
  },
  detailHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "14px",
    padding: "16px",
    borderRadius: "16px",
    background: "var(--admin-surface-soft, #f8fafc)",
    border: "1px solid var(--admin-border, #e2e8f0)",
  },
  detailTitle: {
    margin: 0,
    color: "var(--admin-text, #101828)",
    fontSize: "20px",
    fontWeight: 850,
  },
  detailSubtitle: {
    margin: "6px 0 0",
    color: "var(--admin-muted, #667085)",
    fontSize: "13px",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "16px",
  },
  detailItem: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface, #ffffff)",
  },
  detailLabel: {
    display: "block",
    marginBottom: "6px",
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  detailValue: {
    color: "var(--admin-text, #101828)",
    fontSize: "14px",
    fontWeight: 700,
    wordBreak: "break-word",
  },
  commentList: {
    display: "grid",
    gap: "10px",
  },
  commentItem: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface-soft, #f8fafc)",
  },
  commentText: {
    margin: 0,
    color: "var(--admin-text, #101828)",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  commentMeta: {
    display: "block",
    marginTop: "6px",
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 600,
  },
  statusEditor: {
    display: "grid",
    gap: "8px",
    marginTop: "16px",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface, #ffffff)",
  },
  statusEditorRow: {
    display: "grid",
    gridTemplateColumns: "minmax(180px, 1fr) auto",
    gap: "10px",
    alignItems: "center",
  },
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

const getText = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const hasCompletedNote = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => hasCompletedNote(item?.completed_note || item?.reason || item));
  }

  return value !== null && value !== undefined && String(value).trim() !== "";
};

const priorityMeta = {
  emergency: {
    color: "#dc2626",
    Icon: FiAlertOctagon,
    label: "Emergency",
  },
  medium: {
    color: "#d97706",
    Icon: FiMinusCircle,
    label: "Medium",
  },
  low: {
    color: "#16a34a",
    Icon: FiArrowDownCircle,
    label: "Low",
  },
};

const getPriorityMeta = (priority) => {
  const normalizedPriority = normalizeKey(priority);

  return priorityMeta[normalizedPriority];
};

const renderPriorityIcon = (priority) => {
  const priorityText = String(priority || "").trim();
  const meta = getPriorityMeta(priorityText);

  if (!priorityText || !meta) {
    return null;
  }

  const PriorityIcon = meta.Icon;

  return (
    <Tooltip title={`Priority: ${meta.label}`}>
      <PriorityIcon
        aria-label={`Priority: ${meta.label}`}
        style={{
          color: meta.color,
          marginLeft: 6,
          position: "relative",
          top: 2,
        }}
      />
    </Tooltip>
  );
};

const getNamedText = (value, fallback = "N/A") => {
  if (value && typeof value === "object") {
    return getText(value.name || value.title || value.label || value.code || value.id, fallback);
  }

  return getText(value, fallback);
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

const formatDate = (value, withTime = false) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour12: true,
    hour: withTime ? "2-digit" : undefined,
    minute: withTime ? "2-digit" : undefined,
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTimeParts = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    date: new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      hour12: true,
      minute: "2-digit",
    }).format(date),
  };
};

const formatDateTimeText = (value) => {
  const parts = formatDateTimeParts(value);

  if (!parts) {
    return "N/A";
  }

  return `${parts.date} at ${parts.time}`;
};

const normalizeDelayReasons = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  return [{ reason: value }];
};

const formatDelayReasonsText = (value) => {
  const reasons = normalizeDelayReasons(value);

  if (!reasons.length) {
    return "N/A";
  }

  return reasons
    .map((item) => {
      const reason = getText(item?.reason || item, "");
      const timestamp = item?.created_at ? ` (${formatDateTimeText(item.created_at)})` : "";

      return `${reason}${timestamp}`;
    })
    .filter(Boolean)
    .join("; ");
};

const renderDateTimeCell = (value, label, emptyText = "N/A") => {
  const parts = formatDateTimeParts(value);

  if (!parts) {
    return <span style={styles.dateEmpty}>{emptyText}</span>;
  }

  return (
    <div style={styles.dateBlock}>
      {/* <span style={styles.dateCaption}>{label}</span> */}
      <span style={styles.dateValue}>{parts.date} - {parts.time}</span>
      {/* <span style={styles.timeValue}>Time: {parts.time}</span> */}
    </div>
  );
};

const normalizeListResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      completedCount: 0,
      inProgressCount: 0,
      onHoldCount: 0,
      pendingCount: 0,
      results: data,
    };
  }

  return {
    count: Number(data?.count || data?.results?.length || 0),
    completedCount: Number(data?.completed_count || 0),
    inProgressCount: Number(data?.in_progress_count || 0),
    onHoldCount: Number(data?.on_hold_count || 0),
    pendingCount: Number(data?.pending_count || 0),
    results: Array.isArray(data?.results) ? data.results : [],
  };
};

const departmentAdminComplaintsContext = {
  eyebrow: "Department Desk",
  title: "Department Complaints",
  subtitle: "Review assigned complaints, inspect resolution status, and track department workload.",
};

const getStatusMeta = (status) => statusMeta[status] || { color: "default", accent: "#64748b" };

const getCountKeyFromStatus = (status) => {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (normalizedStatus === "pending") {
    return "pending";
  }

  if (normalizedStatus === "in progress") {
    return "inProgress";
  }

  if (normalizedStatus === "completed") {
    return "completed";
  }

  if (normalizedStatus === "waiting" || normalizedStatus === "on hold") {
    return "onHold";
  }

  return "";
};

const updateCountForStatusChange = (currentCounts, previousStatus, nextStatus) => {
  const previousKey = getCountKeyFromStatus(previousStatus);
  const nextKey = getCountKeyFromStatus(nextStatus);

  if (!previousKey && !nextKey) {
    return currentCounts;
  }

  const nextCounts = { ...currentCounts };

  if (previousKey) {
    nextCounts[previousKey] = Math.max(0, nextCounts[previousKey] - 1);
  }

  if (nextKey) {
    nextCounts[nextKey] += 1;
  }

  return nextCounts;
};

const mapComplaintForExport = (complaint) => ({
  "Complaint ID": getText(complaint.complaint_id || complaint.id),
  Date: formatDate(complaint.date, true),
  Institution: getText(complaint.institution?.name),
  Complaint: getText(complaint.issue_complaint?.name),
  "Type of Issue": getText(complaint.type_of_issue?.name),
  Location: getComplaintLocation(complaint),
  "Sub Location": getComplaintSubLocation(complaint),
  Priority: getText(complaint.priority),
  Status: getText(complaint.status),
  "Complained By": getText(complaint.complainted_by?.name),
  "Mobile Number": getText(complaint.complainted_by?.mobile_number),
  "Attended By": getText(complaint.resolved_by?.name),
  "Resolved Date": formatDate(complaint.resolved_date, true),
  "Delay Reason": formatDelayReasonsText(complaint.delay_reason),
  Remark: getText(complaint.remark),
  Notes: getText(complaint.notes),
  "Completed Note": getText(complaint.completed_note),
});

function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [exportRange, setExportRange] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusDelayReason, setStatusDelayReason] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [summaryCountsLoaded, setSummaryCountsLoaded] = useState(false);
  const [summaryCounts, setSummaryCounts] = useState({
    completed: 0,
    inProgress: 0,
    onHold: 0,
    pending: 0,
  });
  const [totalCount, setTotalCount] = useState(0);

  const { isAdmin, role, staffId } = useMemo(() => getAuthSession(), []);
  const canUpdateStatus =
    ROLE_GROUPS.DEPARTMENT_ADMIN.includes(role) ||
    (role === USER_ROLES.TECHNICAL_STAFF && isAdmin);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: currentPage,
        page_size: rowsPerPage,
      };

      const searchTerm = debouncedSearch.trim();

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const data = await apiService.get(COMPLAINTS_LIST_ENDPOINT, { params });
      const normalizedData = normalizeListResponse(data);

      setComplaints(normalizedData.results);
      setTotalCount(normalizedData.count);
      setSummaryCounts((currentCounts) => {
        const nextCounts = {
          completed: normalizedData.completedCount,
          inProgress: normalizedData.inProgressCount,
          onHold: normalizedData.onHoldCount,
          pending: normalizedData.pendingCount,
        };

        return currentCounts.completed === nextCounts.completed &&
          currentCounts.inProgress === nextCounts.inProgress &&
          currentCounts.onHold === nextCounts.onHold &&
          currentCounts.pending === nextCounts.pending
          ? currentCounts
          : nextCounts;
      });
      setSummaryCountsLoaded(true);
    } catch (fetchError) {
      console.error("Error fetching complaints:", fetchError);
      setError("Unable to load complaints right now.");
      toast.error("Unable to load complaints");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, rowsPerPage, statusFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const metrics = useMemo(() => {
    return [
      {
        accent: "#ef4444",
        icon: FiAlertTriangle,
        label: "Total complaints",
        value: totalCount,
      },
      {
        accent: "#f59e0b",
        icon: LuClock3,
        label: "Pending",
        value: summaryCounts.pending,
      },
      {
        accent: "#3b82f6",
        icon: LuListChecks,
        label: "In progress",
        value: summaryCounts.inProgress,
      },
      {
        accent: "#f97316",
        icon: LuClock3,
        label: "Waiting",
        value: summaryCounts.onHold,
      },
      {
        accent: "#0cb899",
        icon: FaCheckCircle,
        label: "Completed",
        value: summaryCounts.completed,
      },
    ];
  }, [summaryCounts, totalCount]);

  const exportComplaints = async () => {
    if (!exportRange?.[0] || !exportRange?.[1]) {
      toast.warning("Select a date range before exporting");
      return;
    }

    setExporting(true);

    try {
      const startDate = exportRange[0].startOf("day").toDate();
      const endDate = exportRange[1].endOf("day").toDate();
      const filteredExportRows = complaints.filter((complaint) => {
        const complaintDate = new Date(complaint.date || complaint.created_at);

        return complaintDate >= startDate && complaintDate <= endDate;
      });

      if (!filteredExportRows.length) {
        toast.warning("No complaints found in the selected date range");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(filteredExportRows.map(mapComplaintForExport));
      const workbook = XLSX.utils.book_new();
      const startLabel = exportRange[0].format("YYYY-MM-DD");
      const endLabel = exportRange[1].format("YYYY-MM-DD");

      XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints");
      XLSX.writeFile(workbook, `complaints_${startLabel}_to_${endLabel}.xlsx`);
      toast.success("Complaints exported successfully");
      setIsExportModalOpen(false);
      setExportRange(null);
    } catch (exportError) {
      console.error("Error exporting complaints:", exportError);
      toast.error("Unable to export complaints");
    } finally {
      setExporting(false);
    }
  };

  const refreshFirstPage = () => {
    if (currentPage === 1) {
      fetchComplaints();
      return;
    }

    setCurrentPage(1);
  };

  const openComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusDelayReason("");
    setStatusValue(complaint.status || "");
    setStatusRemark("");
  };

  const closeComplaintDetails = () => {
    setSelectedComplaint(null);
    setStatusDelayReason("");
    setStatusRemark("");
    setStatusValue("");
  };

  const updateComplaintStatus = async () => {
    if (!selectedComplaint?.id || !statusValue || statusValue === selectedComplaint.status) {
      return;
    }

    const hasExistingCompletedNote = hasCompletedNote(selectedComplaint.completed_note);
    const isMovingToWaiting = statusValue === "Waiting" && selectedComplaint.status !== "Waiting";
    const nextDelayReason = statusDelayReason.trim();
    const nextCompletedNote = statusRemark.trim();

    if (isMovingToWaiting && !nextDelayReason) {
      toast.warn("Please enter a delay reason before moving to waiting.");
      return;
    }

    if (statusValue === "Completed" && !hasExistingCompletedNote && !nextCompletedNote) {
      toast.warn("Please enter a completed note before completing the complaint.");
      return;
    }

    setStatusUpdating(true);

    try {
      const delayReasonResponse = isMovingToWaiting
        ? await apiService.patch(`/api/api/complaint/${selectedComplaint.id}/update-delay-reason/`, {
            delay_reason: nextDelayReason,
            staff_id: staffId,
          })
        : null;
      const updatedDelayReasons = delayReasonResponse
        ? normalizeDelayReasons(delayReasonResponse.delay_reason)
        : normalizeDelayReasons(selectedComplaint.delay_reason);

      await apiService.patch(`/api/api/complaint/${selectedComplaint.id}/update-status-admin/`, {
        ...(statusValue === "Completed" && !hasExistingCompletedNote
          ? { completed_note: nextCompletedNote }
          : {}),
        status: statusValue,
      });

      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint.id === selectedComplaint.id
            ? {
                ...complaint,
                ...(isMovingToWaiting ? { delay_reason: updatedDelayReasons } : {}),
                ...(statusValue === "Completed" && !hasExistingCompletedNote
                  ? { completed_note: nextCompletedNote }
                  : {}),
                status: statusValue,
              }
            : complaint,
        ),
      );
      setSelectedComplaint((currentComplaint) => ({
        ...currentComplaint,
        ...(isMovingToWaiting ? { delay_reason: updatedDelayReasons } : {}),
        ...(statusValue === "Completed" && !hasExistingCompletedNote
          ? { completed_note: nextCompletedNote }
          : {}),
        status: statusValue,
      }));
      setStatusDelayReason("");
      setSummaryCounts((currentCounts) =>
        updateCountForStatusChange(currentCounts, selectedComplaint.status, statusValue),
      );
      toast.success("Complaint status updated");
    } catch (statusError) {
      console.error("Error updating complaint status:", statusError);
      toast.error("Unable to update complaint status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const submitComplaintDelayReason = async () => {
    if (!selectedComplaint?.id || selectedComplaint.status !== "Waiting") {
      return;
    }

    const nextDelayReason = statusDelayReason.trim();

    if (!nextDelayReason) {
      toast.warn("Please enter a delay reason.");
      return;
    }

    setStatusUpdating(true);

    try {
      const delayReasonResponse = await apiService.patch(
        `/api/api/complaint/${selectedComplaint.id}/update-delay-reason/`,
        {
          delay_reason: nextDelayReason,
          staff_id: staffId,
        },
      );
      const updatedDelayReasons = normalizeDelayReasons(delayReasonResponse.delay_reason);

      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint.id === selectedComplaint.id
            ? {
                ...complaint,
                delay_reason: updatedDelayReasons,
              }
            : complaint,
        ),
      );
      setSelectedComplaint((currentComplaint) => ({
        ...currentComplaint,
        delay_reason: updatedDelayReasons,
      }));
      setStatusDelayReason("");
      toast.success("Reason updated successfully");
    } catch (reasonError) {
      console.error("Error submitting delay reason:", reasonError);
      toast.error("Unable to update delay reason");
    } finally {
      setStatusUpdating(false);
    }
  };

  const columns = [
    {
      dataIndex: "date_id",
      key: "date_id",
      render: (_, complaint, index) => (
        <div>
          <strong>
            {complaint.complaint_id || `#${(currentPage - 1) * rowsPerPage + index + 1}`}
          </strong>
          {renderDateTimeCell(complaint.date, "Created", "Created date not found")}
        </div>
      ),
      title: "ID & DATE",
      width: 190,
    },
    {
      key: "institution",
      render: (_, complaint) => (
        <div>
          <strong>{getText(complaint.institution?.name)}</strong>
        </div>
      ),
      title: "Institution",
      width: 230,
    },
    {
      key: "issue",
      render: (_, complaint) => (
        <div>
          <strong>
            {getText(complaint.issue_complaint?.name)}
            {renderPriorityIcon(complaint.priority)}
          </strong>
          <div style={styles.muted}>{getText(complaint.type_of_issue?.name)}</div>
        </div>
      ),
      title: "Complaint",
      width: 240,
    },
    {
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusMeta(status).color}>{getText(status)}</Tag>,
      title: "Status",
      width: 140,
    },
    {
      key: "attended_by",
      render: (_, complaint) => (
        <div>
          <strong>{getText(complaint.resolved_by?.name)}</strong>
          {renderDateTimeCell(complaint.resolved_date, "Resolved", "Not resolved yet")}
        </div>
      ),
      title: "Assignee & DATE",
      width: 210,
    },
    {
      align: "right",
      key: "action",
      render: (_, complaint) => (
        <Tooltip title="View complaint">
          <button
            onClick={() => openComplaintDetails(complaint)}
            style={styles.iconButton}
            type="button"
          >
            <FiEye size={17} />
          </button>
        </Tooltip>
      ),
      title: "",
      width: 70,
    },
  ];

  const detailItems = selectedComplaint
    ? [
        ["Complaint ID", selectedComplaint.complaint_id || selectedComplaint.id],
        ["Institution", selectedComplaint.institution?.name],
        ["Complained By", selectedComplaint.complainted_by?.name],
        ["Mobile Number", selectedComplaint.complainted_by?.mobile_number],
        ["Complaint", selectedComplaint.issue_complaint?.name],
        ["Type of Issue", selectedComplaint.type_of_issue?.name],
        ["Category", selectedComplaint.category],
        ...(isMaintenanceComplaint(selectedComplaint)
          ? [
              ["Location", getComplaintLocation(selectedComplaint)],
              ["Sub Location", getComplaintSubLocation(selectedComplaint)],
              ["Priority", selectedComplaint.priority],
            ]
          : []),
        ["Status", selectedComplaint.status],
        ["Created Date & Time", formatDateTimeText(selectedComplaint.date)],
        ["Attend Date & Time", formatDateTimeText(selectedComplaint.attend_date)],
        ["Attended By", selectedComplaint.resolved_by?.name],
        ["Resolved Date & Time", formatDateTimeText(selectedComplaint.resolved_date)],
        ["Delay Reason", selectedComplaint.delay_reason],
        ["Remark", selectedComplaint.remark],
        ["Notes", selectedComplaint.notes],
        ["Completed Note", selectedComplaint.completed_note],
      ]
    : [];

  const selectedComplaintHasCompletedNote = hasCompletedNote(selectedComplaint?.completed_note);

  const renderDetailValue = (label, value) => {
    if (label !== "Delay Reason") {
      return <span style={styles.detailValue}>{getText(value)}</span>;
    }

    const reasons = normalizeDelayReasons(value);

    if (!reasons.length) {
      return <span style={styles.detailValue}>N/A</span>;
    }

    return (
      <div style={styles.commentList}>
        {reasons.map((item, index) => (
          <article key={`${item?.created_at || "delay"}-${index}`} style={styles.commentItem}>
            <p style={styles.commentText}>{getText(item?.reason || item)}</p>
            {item?.created_at ? (
              <span style={styles.commentMeta}>{formatDateTimeText(item.created_at)}</span>
            ) : null}
          </article>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            <LuBuilding2 size={14} />
            {departmentAdminComplaintsContext.eyebrow}
          </p>
          <h1 style={styles.title}>{departmentAdminComplaintsContext.title}</h1>
          <p style={styles.subtitle}>{departmentAdminComplaintsContext.subtitle}</p>
        </div>

        <div style={styles.actions}>
          <CreateComplaints onCreated={refreshFirstPage} />
          <Button icon={<BiExport size={18} />} onClick={() => setIsExportModalOpen(true)}>
            Export
          </Button>
          <Button icon={<BiRefresh size={18} />} loading={loading} onClick={fetchComplaints}>
            Refresh
          </Button>
        </div>
      </section>

      <section style={styles.metrics}>
        {metrics.map(({ accent, icon: Icon, label, value }) => (
          <article key={label} style={styles.metric(accent)}>
            <div>
              <p style={styles.metricLabel}>{label}</p>
              <h2 style={styles.metricValue}>
                {loading && !summaryCountsLoaded ? "-" : formatNumber(value)}
              </h2>
            </div>
            <div style={styles.metricIcon}>
              <Icon size={22} />
            </div>
          </article>
        ))}
      </section>

      <section style={styles.panel}>
        <div style={styles.toolbar}>
          <Input
            allowClear
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search complaints"
            prefix={<FiSearch />}
            value={search}
          />

          <Select
            onChange={(value) => {
              setCurrentPage(1);
              setStatusFilter(value);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "Pending", value: "Pending" },
              { label: "In Progress", value: "In Progress" },
              { label: "Waiting", value: "Waiting" },
              { label: "Completed", value: "Completed" },
            ]}
            value={statusFilter}
          />

          <span style={styles.muted}>
            Showing {formatNumber(complaints.length)} of {formatNumber(totalCount)} complaints
          </span>
        </div>

        {error ? (
          <div style={{ padding: "16px" }}>
            <Empty description={error} />
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <Table
              columns={columns}
              dataSource={complaints}
              loading={loading}
              locale={{ emptyText: <Empty description="No complaints found" /> }}
              pagination={{
                current: currentPage,
                pageSize: rowsPerPage,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                showSizeChanger: true,
                total: totalCount,
              }}
              onChange={(pagination) => {
                const nextPageSize = pagination.pageSize || 10;

                setRowsPerPage(nextPageSize);
                setCurrentPage(nextPageSize === rowsPerPage ? pagination.current || 1 : 1);
              }}
              rowKey={(record) => record.id || record.complaint_id}
              scroll={{ x: 1130 }}
            />
          </div>
        )}
      </section>

      <Drawer
        onClose={closeComplaintDetails}
        open={Boolean(selectedComplaint)}
        title="Complaint Details"
        width={680}
      >
        {selectedComplaint ? (
          <>
            <div style={styles.detailHeader}>
              <div>
                <h2 style={styles.detailTitle}>
                  {selectedComplaint.issue_complaint?.name || "Complaint"}
                </h2>
                <p style={styles.detailSubtitle}>
                  {getText(selectedComplaint.institution?.name)}
                </p>
              </div>
              <Tag color={getStatusMeta(selectedComplaint.status).color}>
                {getText(selectedComplaint.status)}
              </Tag>
            </div>

            {canUpdateStatus && selectedComplaint.status !== "Completed" ? (
              <div style={styles.statusEditor}>
                <span style={styles.detailLabel}>Update Status</span>
                <div style={styles.statusEditorRow}>
                  <Select
                    options={STATUS_OPTIONS.map((status) => ({
                      label: status,
                      value: status,
                    }))}
                    value={statusValue || undefined}
                    onChange={(value) => {
                      setStatusValue(value);
                      if (value !== "Waiting") {
                        setStatusDelayReason("");
                      }
                      if (value !== "Completed") {
                        setStatusRemark("");
                      }
                    }}
                  />
                  <Button
                    disabled={
                      !statusValue ||
                      statusValue === selectedComplaint.status ||
                      (statusValue === "Waiting" &&
                        selectedComplaint.status !== "Waiting" &&
                        !statusDelayReason.trim()) ||
                      (statusValue === "Completed" &&
                        !selectedComplaintHasCompletedNote &&
                        !statusRemark.trim())
                    }
                    loading={statusUpdating}
                    onClick={updateComplaintStatus}
                    type="primary"
                  >
                    Update
                  </Button>
                </div>
                {statusValue === "Completed" && !selectedComplaintHasCompletedNote ? (
                  <Input.TextArea
                    placeholder="Enter completed note"
                    rows={3}
                    value={statusRemark}
                    onChange={(event) => setStatusRemark(event.target.value)}
                  />
                ) : null}
                {statusValue === "Waiting" ? (
                  <Input.TextArea
                    placeholder="Enter delay reason"
                    rows={3}
                    value={statusDelayReason}
                    onChange={(event) => setStatusDelayReason(event.target.value)}
                  />
                ) : null}
                {statusValue === "Waiting" && selectedComplaint.status === "Waiting" ? (
                  <Button
                    disabled={!statusDelayReason.trim()}
                    loading={statusUpdating}
                    onClick={submitComplaintDelayReason}
                    type="primary"
                  >
                    Submit Delay Reason
                  </Button>
                ) : null}
              </div>
            ) : null}

            <div style={styles.detailGrid}>
              {detailItems.map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    ...styles.detailItem,
                    ...(label === "Delay Reason" ? { gridColumn: "1 / -1" } : {}),
                  }}
                >
                  <span style={styles.detailLabel}>{label}</span>
                  {renderDetailValue(label, value)}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Drawer>

      <Modal
        confirmLoading={exporting}
        okText="Export Excel"
        onCancel={() => setIsExportModalOpen(false)}
        onOk={exportComplaints}
        open={isExportModalOpen}
        title="Export Complaints"
      >
        <p style={styles.muted}>
          Select a created-date range. The export uses the complaints API and writes an Excel file.
        </p>
        <RangePicker
          onChange={setExportRange}
          style={{ width: "100%", height: "50px" }}
          value={exportRange}
        />
      </Modal>
    </div>
  );
}

export default ComplaintsList;
