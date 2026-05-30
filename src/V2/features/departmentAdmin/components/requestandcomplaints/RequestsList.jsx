import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Drawer,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Tooltip,
} from "antd";
import * as XLSX from "xlsx";
import { BiExport, BiRefresh } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";
import { FiEye, FiSearch } from "react-icons/fi";
import { LuCalendarClock, LuClock3, LuFileSymlink, LuListChecks } from "react-icons/lu";
import { toast } from "react-toastify";

import { apiService } from "../../../../services/api/Api.service";
import { ROLE_GROUPS, USER_ROLES } from "../../../../shared/constants/roles";
import { getAuthSession } from "../../../../shared/utils/authSession";
import CreateRequests from "./CreateRequests";

const { RangePicker } = DatePicker;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_DELAY = 500;
const REQUESTS_LIST_ENDPOINT = "/api/api/requests-list/";
const STATUS_OPTIONS = ["Pending", "In Progress", "Waiting", "Completed"];

const statusMeta = {
  Completed: {
    color: "success",
  },
  Pending: {
    color: "error",
  },
  "In Progress": {
    color: "processing",
  },
  Waiting: {
    color: "warning",
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
      "radial-gradient(circle at 10% 12%, rgba(59, 130, 246, 0.14), transparent 34%), linear-gradient(135deg, var(--admin-surface, #ffffff), var(--admin-surface-soft, #f8fafc))",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
    padding: "8px 10px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
    color: "#1d4ed8",
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
    fontWeight: 800,
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

const isMaintenanceRequest = (request) =>
  [request?.type_of_request?.name, request?.department?.name, request?.department].some((value) =>
    ["maintenance", "maintanance"].includes(normalizeKey(getNamedText(value, ""))),
  );

const isStageProgramRequest = (request) => {
  const requestName = normalizeKey(getNamedText(request?.issue_request, ""));

  return (
    (requestName.includes("stage") && requestName.includes("program")) ||
    Boolean(request?.program_name || request?.program_date || request?.program_time)
  );
};

const getRequestLocation = (request) =>
  getNamedText(request?.location || request?.location_name || request?.institution);

const getRequestSubLocation = (request) =>
  getNamedText(
    request?.sub_location ||
      request?.subLocation ||
      request?.sub_location_name ||
      request?.subLocationName,
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
    hour: withTime ? "2-digit" : undefined,
    minute: withTime ? "2-digit" : undefined,
    month: "short",
    year: "numeric",
  }).format(date);
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
      const timestamp = item?.created_at ? ` (${formatDate(item.created_at, true)})` : "";

      return `${reason}${timestamp}`;
    })
    .filter(Boolean)
    .join("; ");
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

const departmentAdminRequestsContext = {
  eyebrow: "Department Desk",
  title: "Department Requests",
  subtitle: "Review assigned service requests, event needs, and request resolution movement.",
};

const getStatusMeta = (status) => statusMeta[status] || { color: "default" };

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

const mapRequestForExport = (request) => ({
  "Request ID": getText(request.request_id || request.id),
  Date: formatDate(request.date, true),
  Institution: getText(request.institution?.name),
  Request: getText(request.issue_request?.name),
  Location: getRequestLocation(request),
  "Sub Location": getRequestSubLocation(request),
  Priority: getText(request.priority),
  Status: getText(request.status),
  "Requested By": getText(request.requested_by?.name),
  "Mobile Number": getText(request.requested_by?.mobile_number),
  "Program Name": getText(request.program_name),
  "Program Date": getText(request.program_date),
  "Program Time": getText(request.program_time),
  "Resolved By": getText(request.resolved_by?.name),
  "Resolved Date": formatDate(request.resolved_date, true),
  "Delay Reason": formatDelayReasonsText(request.delay_reason),
  Notes: getText(request.notes),
});

function RequestsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [exportRange, setExportRange] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
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

  const { isAdmin, role } = useMemo(() => getAuthSession(), []);
  const canUpdateStatus =
    ROLE_GROUPS.DEPARTMENT_ADMIN.includes(role) ||
    (role === USER_ROLES.TECHNICAL_STAFF && isAdmin);

  const fetchRequests = useCallback(async () => {
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

      const data = await apiService.get(REQUESTS_LIST_ENDPOINT, { params });
      const normalizedData = normalizeListResponse(data);

      setRequests(normalizedData.results);
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
      console.error("Error fetching requests:", fetchError);
      setError("Unable to load requests right now.");
      toast.error("Unable to load requests");
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
    fetchRequests();
  }, [fetchRequests]);

  const metrics = useMemo(() => {
    return [
      {
        accent: "#3b82f6",
        icon: LuFileSymlink,
        label: "Total requests",
        value: totalCount,
      },
      {
        accent: "#f59e0b",
        icon: LuClock3,
        label: "Pending",
        value: summaryCounts.pending,
      },
      {
        accent: "#2563eb",
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

  const exportRequests = async () => {
    if (!exportRange?.[0] || !exportRange?.[1]) {
      toast.warning("Select a date range before exporting");
      return;
    }

    setExporting(true);

    try {
      const startDate = exportRange[0].startOf("day").toDate();
      const endDate = exportRange[1].endOf("day").toDate();
      const filteredExportRows = requests.filter((request) => {
        const requestDate = new Date(request.date || request.created_at);

        return requestDate >= startDate && requestDate <= endDate;
      });

      if (!filteredExportRows.length) {
        toast.warning("No requests found in the selected date range");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(filteredExportRows.map(mapRequestForExport));
      const workbook = XLSX.utils.book_new();
      const startLabel = exportRange[0].format("YYYY-MM-DD");
      const endLabel = exportRange[1].format("YYYY-MM-DD");

      XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
      XLSX.writeFile(workbook, `requests_${startLabel}_to_${endLabel}.xlsx`);
      toast.success("Requests exported successfully");
      setIsExportModalOpen(false);
      setExportRange(null);
    } catch (exportError) {
      console.error("Error exporting requests:", exportError);
      toast.error("Unable to export requests");
    } finally {
      setExporting(false);
    }
  };

  const refreshFirstPage = () => {
    if (currentPage === 1) {
      fetchRequests();
      return;
    }

    setCurrentPage(1);
  };

  const markAsViewed = async (request) => {
    if (request.is_viewed || !request.id) {
      return;
    }

    try {
      await apiService.patch(`/api/api/requests/${request.id}/mark-as-viewed/`, {});
    } catch (viewError) {
      console.error("Error marking request as viewed:", viewError);
    }
  };

  const openRequestDetails = (request) => {
    markAsViewed(request);
    setSelectedRequest(request);
    setStatusRemark("");
    setStatusValue(request.status || "");
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setStatusRemark("");
    setStatusValue("");
  };

  const updateRequestStatus = async () => {
    if (!selectedRequest?.id || !statusValue || statusValue === selectedRequest.status) {
      return;
    }

    const hasExistingCompletedNote = hasCompletedNote(selectedRequest.completed_note);
    const nextCompletedNote = statusRemark.trim();

    if (statusValue === "Completed" && !hasExistingCompletedNote && !nextCompletedNote) {
      toast.warn("Please enter a completed note before completing the request.");
      return;
    }

    setStatusUpdating(true);

    try {
      await apiService.patch(`/api/api/request/${selectedRequest.id}/update-status-admin/`, {
        ...(statusValue === "Completed" && !hasExistingCompletedNote
          ? { completed_note: nextCompletedNote }
          : {}),
        status: statusValue,
      });

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === selectedRequest.id
            ? {
                ...request,
                ...(statusValue === "Completed" && !hasExistingCompletedNote
                  ? { completed_note: nextCompletedNote }
                  : {}),
                status: statusValue,
              }
            : request,
        ),
      );
      setSelectedRequest((currentRequest) => ({
        ...currentRequest,
        ...(statusValue === "Completed" && !hasExistingCompletedNote
          ? { completed_note: nextCompletedNote }
          : {}),
        status: statusValue,
      }));
      setSummaryCounts((currentCounts) =>
        updateCountForStatusChange(currentCounts, selectedRequest.status, statusValue),
      );
      toast.success("Request status updated");
    } catch (statusError) {
      console.error("Error updating request status:", statusError);
      toast.error("Unable to update request status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const columns = [
    {
      dataIndex: "request_id",
      key: "request_id",
      render: (_, request, index) => (
        <div>
          <strong>{request.request_id || `#${(currentPage - 1) * rowsPerPage + index + 1}`}</strong>
          <div style={styles.muted}>{formatDate(request.date)}</div>
        </div>
      ),
      title: "ID & DATE",
      width: 150,
    },
    {
      key: "institution",
      render: (_, request) => (
        <div>
          <strong>{getText(request.institution?.name)}</strong>
        </div>
      ),
      title: "Institution",
      width: 230,
    },
    {
      key: "issue",
      render: (_, request) => (
        <div>
          <strong>{getText(request.issue_request?.name)}</strong>
          <div style={styles.muted}>{getText(request.program_name, "")}</div>
        </div>
      ),
      title: "Request",
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
      render: (_, request) => (
        <div>
          <strong>{getText(request.resolved_by?.name)}</strong>
          <div style={styles.muted}>{formatDate(request.resolved_date)}</div>
        </div>
      ),
      title: "Assignee & DATE",
      width: 180,
    },
    {
      align: "right",
      key: "action",
      render: (_, request) => (
        <Tooltip title="View request">
          <button
            onClick={() => openRequestDetails(request)}
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

  const detailItems = selectedRequest
    ? [
        ["Request ID", selectedRequest.request_id || selectedRequest.id],
        ["Institution", selectedRequest.institution?.name],
        ["Requested By", selectedRequest.requested_by?.name],
        ["Mobile Number", selectedRequest.requested_by?.mobile_number],
        ["Request", selectedRequest.issue_request?.name],
        ...(isMaintenanceRequest(selectedRequest)
          ? [
              ["Location", getRequestLocation(selectedRequest)],
              ["Sub Location", getRequestSubLocation(selectedRequest)],
              ["Priority", selectedRequest.priority],
            ]
          : []),
        ["Status", selectedRequest.status],
        ["Created Date & Time", formatDate(selectedRequest.date, true)],
        ...(isStageProgramRequest(selectedRequest)
          ? [
              ["Program Name", selectedRequest.program_name],
              ["Program Date", selectedRequest.program_date],
              ["Program Time", selectedRequest.program_time],
            ]
          : []),
        ["Resolved By", selectedRequest.resolved_by?.name],
        ["Resolved Date & Time", formatDate(selectedRequest.resolved_date, true)],
        ["Delay Reason", selectedRequest.delay_reason],
        ["Notes", selectedRequest.notes],
      ]
    : [];

  const selectedRequestHasCompletedNote = hasCompletedNote(selectedRequest?.completed_note);

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
              <span style={styles.commentMeta}>{formatDate(item.created_at, true)}</span>
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
            <LuCalendarClock size={14} />
            {departmentAdminRequestsContext.eyebrow}
          </p>
          <h1 style={styles.title}>{departmentAdminRequestsContext.title}</h1>
          <p style={styles.subtitle}>{departmentAdminRequestsContext.subtitle}</p>
        </div>

        <div style={styles.actions}>
          <CreateRequests fetchRequests={refreshFirstPage} />
          <Button icon={<BiExport size={18} />} onClick={() => setIsExportModalOpen(true)}>
            Export
          </Button>
          <Button icon={<BiRefresh size={18} />} loading={loading} onClick={fetchRequests}>
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
            placeholder="Search requests"
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
            Showing {formatNumber(requests.length)} of {formatNumber(totalCount)} requests
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
              dataSource={requests}
              loading={loading}
              locale={{ emptyText: <Empty description="No requests found" /> }}
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
              rowKey={(record) => record.id || record.request_id}
              scroll={{ x: 1130 }}
            />
          </div>
        )}
      </section>

      <Drawer
        onClose={closeRequestDetails}
        open={Boolean(selectedRequest)}
        title="Request Details"
        width={680}
      >
        {selectedRequest ? (
          <>
            <div style={styles.detailHeader}>
              <div>
                <h2 style={styles.detailTitle}>
                  {selectedRequest.issue_request?.name || "Request"}
                </h2>
                <p style={styles.detailSubtitle}>
                  {getText(selectedRequest.institution?.name)}
                </p>
              </div>
              <Tag color={getStatusMeta(selectedRequest.status).color}>
                {getText(selectedRequest.status)}
              </Tag>
            </div>

            {canUpdateStatus && selectedRequest.status !== "Completed" ? (
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
                      if (value !== "Completed") {
                        setStatusRemark("");
                      }
                    }}
                  />
                  <Popconfirm
                    cancelText="Cancel"
                    description="This will update the request status."
                    okText="Update"
                    onConfirm={updateRequestStatus}
                    title="Update status?"
                  >
                    <Button
                      disabled={
                        !statusValue ||
                        statusValue === selectedRequest.status ||
                        (statusValue === "Completed" &&
                          !selectedRequestHasCompletedNote &&
                          !statusRemark.trim())
                      }
                      loading={statusUpdating}
                      type="primary"
                    >
                      Update
                    </Button>
                  </Popconfirm>
                </div>
                {statusValue === "Completed" && !selectedRequestHasCompletedNote ? (
                  <Input.TextArea
                    placeholder="Enter completed note"
                    rows={3}
                    value={statusRemark}
                    onChange={(event) => setStatusRemark(event.target.value)}
                  />
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
        onOk={exportRequests}
        open={isExportModalOpen}
        title="Export Requests"
      >
        <p style={styles.muted}>
          Select a created-date range. The export uses the loaded requests and writes an Excel file.
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

export default RequestsList;
