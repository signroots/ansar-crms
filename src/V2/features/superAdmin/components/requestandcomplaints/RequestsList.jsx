import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Drawer,
  Empty,
  Input,
  Modal,
  Pagination,
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

const priorityMeta = {
  Emergency: "error",
  High: "error",
  Low: "success",
  Medium: "warning",
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

const normalizeListResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
    };
  }

  return {
    count: Number(data?.count || data?.results?.length || 0),
    results: Array.isArray(data?.results) ? data.results : [],
  };
};

const getRoleContext = () => {
  const { isAdmin, role, typeOfIssue } = getAuthSession();
  const isDepartmentAdmin =
    role === USER_ROLES.DEPARTMENT_ADMIN || (role === USER_ROLES.TECHNICAL_STAFF && isAdmin);

  if (isDepartmentAdmin) {
    return {
      eyebrow: typeOfIssue || "Department Desk",
      title: "Department Requests",
      subtitle: "Review assigned service requests, event needs, and request resolution movement.",
    };
  }

  return {
    eyebrow: "Request Desk",
    title: "Requests",
    subtitle: "Track service requests, program needs, assigned staff, and completion status.",
  };
};

const getStatusMeta = (status) => statusMeta[status] || { color: "default" };

const getPriorityTagColor = (priority) => priorityMeta[priority] || "default";

const getRequestSearchText = (request) =>
  [
    request.request_id,
    request.department?.name,
    request.institution?.name,
    request.issue_request?.name,
    request.status,
    request.priority,
    request.requested_by?.name,
    request.resolved_by?.name,
    request.program_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const mapRequestForExport = (request) => ({
  "Request ID": getText(request.request_id || request.id),
  Date: formatDate(request.date, true),
  Institution: getText(request.institution?.name),
  Department: getText(request.department?.name),
  Request: getText(request.issue_request?.name),
  Priority: getText(request.priority),
  Status: getText(request.status),
  "Requested By": getText(request.requested_by?.name),
  "Mobile Number": getText(request.requested_by?.mobile_number),
  "Program Name": getText(request.program_name),
  "Program Date": getText(request.program_date),
  "Program Time": getText(request.program_time),
  "Resolved By": getText(request.resolved_by?.name),
  "Resolved Date": formatDate(request.resolved_date, true),
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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusValue, setStatusValue] = useState("");

  const roleContext = useMemo(() => getRoleContext(), []);
  const { role } = useMemo(() => getAuthSession(), []);
  const canUpdateStatus = ROLE_GROUPS.SUPER_ADMIN.includes(role);
  const totalCount = requests.length;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiService.get(REQUESTS_LIST_ENDPOINT);
      const normalizedData = normalizeListResponse(data);

      setRequests(normalizedData.results);
    } catch (fetchError) {
      console.error("Error fetching requests:", fetchError);
      setError("Unable to load requests right now.");
      toast.error("Unable to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesSearch = !searchTerm || getRequestSearchText(request).includes(searchTerm);

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;

    return filteredRequests.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredRequests, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredRequests.length / rowsPerPage));

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, filteredRequests.length, rowsPerPage]);

  const metrics = useMemo(() => {
    const statusCounts = requests.reduce(
      (acc, request) => {
        acc[request.status] = (acc[request.status] || 0) + 1;
        return acc;
      },
      {
        Completed: 0,
        "In Progress": 0,
        Pending: 0,
        Waiting: 0,
      },
    );

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
        value: statusCounts.Pending,
      },
      {
        accent: "#2563eb",
        icon: LuListChecks,
        label: "In progress",
        value: statusCounts["In Progress"],
      },
      {
        accent: "#0cb899",
        icon: FaCheckCircle,
        label: "Completed",
        value: statusCounts.Completed,
      },
    ];
  }, [requests, totalCount]);

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
    setStatusValue(request.status || "");
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setStatusValue("");
  };

  const updateRequestStatus = async () => {
    if (!selectedRequest?.id || !statusValue || statusValue === selectedRequest.status) {
      return;
    }

    setStatusUpdating(true);

    try {
      await apiService.patch(`/api/api/request/${selectedRequest.id}/update-status-admin/`, {
        status: statusValue,
      });

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === selectedRequest.id ? { ...request, status: statusValue } : request,
        ),
      );
      setSelectedRequest((currentRequest) => ({
        ...currentRequest,
        status: statusValue,
      }));
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
      title: "Request",
      width: 150,
    },
    {
      key: "institution",
      render: (_, request) => (
        <div>
          <strong>{getText(request.institution?.name)}</strong>
          <div style={styles.muted}>{getText(request.department?.name)}</div>
        </div>
      ),
      title: "Institution & Department",
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
      title: "Request Type",
      width: 240,
    },
    {
      dataIndex: "priority",
      key: "priority",
      render: (priority) => <Tag color={getPriorityTagColor(priority)}>{getText(priority)}</Tag>,
      title: "Priority",
      width: 120,
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
      title: "Attended By",
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
        [
          "Department & Institution",
          `${getText(selectedRequest.department?.name)} - ${getText(selectedRequest.institution?.name)}`,
        ],
        ["Requested By", selectedRequest.requested_by?.name],
        ["Mobile Number", selectedRequest.requested_by?.mobile_number],
        ["Request", selectedRequest.issue_request?.name],
        ["Priority", selectedRequest.priority],
        ["Status", selectedRequest.status],
        ["Created Date & Time", formatDate(selectedRequest.date, true)],
        ["Program Name", selectedRequest.program_name],
        ["Program Date", selectedRequest.program_date],
        ["Program Time", selectedRequest.program_time],
        ["Resolved By", selectedRequest.resolved_by?.name],
        ["Resolved Date & Time", formatDate(selectedRequest.resolved_date, true)],
        ["Notes", selectedRequest.notes],
      ]
    : [];

  return (
    <div style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            <LuCalendarClock size={14} />
            {roleContext.eyebrow}
          </p>
          <h1 style={styles.title}>{roleContext.title}</h1>
          <p style={styles.subtitle}>{roleContext.subtitle}</p>
        </div>

        <div style={styles.actions}>
          <CreateRequests fetchRequests={fetchRequests} />
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
              <h2 style={styles.metricValue}>{loading ? "-" : formatNumber(value)}</h2>
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
            placeholder="Search loaded requests"
            prefix={<FiSearch />}
            value={search}
          />

          <Select
            onChange={setStatusFilter}
            options={[
              { label: "All statuses", value: "all" },
              { label: "Pending", value: "Pending" },
              { label: "In Progress", value: "In Progress" },
              { label: "Waiting", value: "Waiting" },
              { label: "Completed", value: "Completed" },
            ]}
            value={statusFilter}
          />

          <span style={styles.muted}>
            Showing {formatNumber(paginatedRequests.length)} of{" "}
            {formatNumber(filteredRequests.length)} filtered
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
              dataSource={paginatedRequests}
              loading={loading}
              locale={{ emptyText: <Empty description="No requests found" /> }}
              pagination={false}
              rowKey={(record) => record.id || record.request_id}
              scroll={{ x: 1130 }}
            />
          </div>
        )}

        <div style={styles.pagination}>
          <Pagination
            current={currentPage}
            onChange={(page) => setCurrentPage(page)}
            pageSize={rowsPerPage}
            showSizeChanger={false}
            total={filteredRequests.length}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={styles.muted}>Rows</span>
            <Select
              onChange={(value) => {
                setRowsPerPage(value);
                setCurrentPage(1);
              }}
              options={PAGE_SIZE_OPTIONS.map((value) => ({
                label: `${value} / page`,
                value,
              }))}
              style={{ width: 128 }}
              value={rowsPerPage}
            />
          </div>
        </div>
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
                  {getText(selectedRequest.institution?.name)} -{" "}
                  {getText(selectedRequest.department?.name)}
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
                    onChange={setStatusValue}
                  />
                  <Popconfirm
                    cancelText="Cancel"
                    description="This will update the request status."
                    okText="Update"
                    onConfirm={updateRequestStatus}
                    title="Update status?"
                  >
                    <Button
                      disabled={!statusValue || statusValue === selectedRequest.status}
                      loading={statusUpdating}
                      type="primary"
                    >
                      Update
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ) : null}

            <div style={styles.detailGrid}>
              {detailItems.map(([label, value]) => (
                <div key={label} style={styles.detailItem}>
                  <span style={styles.detailLabel}>{label}</span>
                  <span style={styles.detailValue}>{getText(value)}</span>
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
