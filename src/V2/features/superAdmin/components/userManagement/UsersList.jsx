import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Popconfirm, Select, Table, Tag, Tooltip } from "antd";
import { FiCopy, FiEdit2, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import { LuRefreshCw, LuShieldCheck, LuUserCog, LuUserRoundCheck } from "react-icons/lu";
import { toast } from "react-toastify";

import { apiService } from "../../../../services/api/Api.service";
import { USER_ROLES } from "../../../../shared/constants/roles";
import UserAdd from "./UserAdd";
import UserEdit from "./UserEdit";

const USERS_ENDPOINT = "/api/api/users/";
const USER_DELETE_ENDPOINT = (id) => `/api/api/users/delete/${id}/`;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const SEARCH_DEBOUNCE_DELAY = 500;

const ROLE_FILTER_OPTIONS = [
  { label: "All roles", value: "all" },
  { label: "Staff", value: USER_ROLES.STAFF },
  { label: "Teacher", value: USER_ROLES.TEACHER },
  { label: "Tech Support", value: USER_ROLES.TECHNICAL_STAFF },
  { label: "Tech Admin", value: USER_ROLES.DEPARTMENT_ADMIN },
];

const roleTagColors = {
  [USER_ROLES.STAFF]: "blue",
  [USER_ROLES.TEACHER]: "cyan",
  [USER_ROLES.TECHNICAL_STAFF]: "purple",
  [USER_ROLES.DEPARTMENT_ADMIN]: "green",
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
      "radial-gradient(circle at 12% 12%, rgba(12, 184, 153, 0.14), transparent 34%), linear-gradient(135deg, var(--admin-surface, #ffffff), var(--admin-surface-soft, #f8fafc))",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
    padding: "8px 10px",
    borderRadius: "999px",
    background: "rgba(12, 184, 153, 0.12)",
    color: "#047857",
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
    display: "inline-grid",
    placeItems: "center",
  },
  actionGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

const getText = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const normalizeUsersResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
    };
  }

  return {
    count: Number(data?.count || data?.results?.length || data?.data?.length || 0),
    results: Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.users)
          ? data.users
          : [],
  };
};

const roleContext = {
  eyebrow: "Access Control",
  title: "User Management",
  subtitle: "Create users, review role access, maintain staff IDs, and keep contact data clean.",
};

function UsersList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
      };
      const searchTerm = debouncedSearch.trim();

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (roleFilter !== "all") {
        params.role = roleFilter;
      }

      const data = await apiService.get(USERS_ENDPOINT, { params });
      const normalizedData = normalizeUsersResponse(data);

      setUsers(normalizedData.results);
      setTotalCount(normalizedData.count);
    } catch (fetchError) {
      console.error("Error fetching users:", fetchError);
      setError("Unable to load users right now.");
      toast.error("Unable to load users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, pageSize, roleFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(search);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const metrics = useMemo(() => {
    const loadedCounts = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {
        [USER_ROLES.STAFF]: 0,
        [USER_ROLES.TEACHER]: 0,
        [USER_ROLES.TECHNICAL_STAFF]: 0,
      },
    );

    return [
      {
        accent: "#0cb899",
        icon: FiUsers,
        label: "Total users",
        value: totalCount,
      },
      {
        accent: "#3b82f6",
        icon: LuUserRoundCheck,
        label: "Loaded staff",
        value: loadedCounts[USER_ROLES.STAFF],
      },
      {
        accent: "#8b5cf6",
        icon: LuUserCog,
        label: "Loaded tech",
        value: loadedCounts[USER_ROLES.TECHNICAL_STAFF],
      },
      {
        accent: "#f59e0b",
        icon: LuShieldCheck,
        label: "Loaded teachers",
        value: loadedCounts[USER_ROLES.TEACHER],
      },
    ];
  }, [totalCount, users]);

  const copyMobileNumber = async (mobileNumber) => {
    if (!mobileNumber) {
      toast.warning("No mobile number found");
      return;
    }

    try {
      await navigator.clipboard.writeText(mobileNumber);
      toast.success("Mobile number copied");
    } catch (copyError) {
      console.error("Clipboard error:", copyError);
      toast.error("Unable to copy mobile number");
    }
  };

  const deleteUser = async (user) => {
    if (!user?.id) {
      return;
    }

    setDeletingId(user.id);

    try {
      await apiService.delete(USER_DELETE_ENDPOINT(user.id));
      toast.success("User deleted successfully");
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
      setTotalCount((currentTotal) => Math.max(0, currentTotal - 1));
    } catch (deleteError) {
      console.error("Error deleting user:", deleteError);
      toast.error("Unable to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setSelectedUser(null);
    setEditOpen(false);
  };

  const refreshFirstPage = () => {
    if (currentPage === 1) {
      fetchUsers();
      return;
    }

    setCurrentPage(1);
  };

  const columns = [
    {
      key: "name",
      render: (_, user) => (
        <div>
          <strong>{getText(user.name)}</strong>
          <div style={styles.muted}>{getText(user.staff_id)}</div>
        </div>
      ),
      title: "Name & ID",
      width: 210,
    },
    {
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <div style={{ display: "grid", gap: "6px" }}>
          <Tag color={roleTagColors[role] || "default"} className="w-fit"             styles={{ root: { width: "fit-content" } }}
>
            {getText(role)}
          </Tag>
        </div>
      ),
      title: "Role",
      width: 150,
    },
    {
      key: "institution",
      render: (_, user) => (
        <div>
          <strong>{getText(user.institution?.name)}</strong>
          <div style={styles.muted}>{getText(user.department?.name)}</div>
        </div>
      ),
      title: "Institution & Department",
      width: 260,
    },
    {
      key: "section",
      render: (_, user) => getText(user.section_for_staff || user.typeofissue?.name),
      title: "Section",
      width: 160,
    },
    {
      dataIndex: "mobile_number",
      key: "mobile_number",
      render: (mobileNumber) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>{getText(mobileNumber)}</span>
          {mobileNumber ? (
            <Tooltip title="Copy mobile number">
              <button
                onClick={() => copyMobileNumber(mobileNumber)}
                style={styles.iconButton}
                type="button"
              >
                <FiCopy size={15} />
              </button>
            </Tooltip>
          ) : null}
        </div>
      ),
      title: "Mobile",
      width: 170,
    },
    {
      align: "right",
      key: "actions",
      render: (_, user) => (
        <div style={styles.actionGroup}>
          <Tooltip title="Edit user">
            <button onClick={() => openEdit(user)} style={styles.iconButton} type="button">
              <FiEdit2 size={15} />
            </button>
          </Tooltip>

          <Popconfirm
            cancelText="Cancel"
            description="This user will be removed from the system."
            okButtonProps={{ danger: true, loading: deletingId === user.id }}
            okText="Delete"
            onConfirm={() => deleteUser(user)}
            title="Delete user?"
          >
            <Tooltip title="Delete user">
              <button style={{ ...styles.iconButton, color: "#ef4444" }} type="button">
                <FiTrash2 size={15} />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
      title: "",
      width: 110,
    },
  ];

  return (
    <div style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            <FiUsers size={14} />
            {roleContext.eyebrow}
          </p>
          <h1 style={styles.title}>{roleContext.title}</h1>
          <p style={styles.subtitle}>{roleContext.subtitle}</p>
        </div>

        <div style={styles.actions}>
          <UserAdd onUserAdded={refreshFirstPage} />
          <Button icon={<LuRefreshCw size={17} />} loading={loading} onClick={() => fetchUsers()}>
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
            placeholder="Search users"
            prefix={<FiSearch />}
            value={search}
          />

          <Select
            onChange={(value) => {
              setCurrentPage(1);
              setRoleFilter(value);
            }}
            options={ROLE_FILTER_OPTIONS}
            value={roleFilter}
          />

          <span style={styles.muted}>
            Showing {formatNumber(users.length)} of {formatNumber(totalCount)} users
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
              dataSource={users}
              loading={loading}
              locale={{ emptyText: <Empty description="No users found" /> }}
              pagination={{
                current: currentPage,
                pageSize,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                showSizeChanger: true,
                total: totalCount,
              }}
              onChange={(pagination) => {
                const nextPageSize = pagination.pageSize || 10;

                setPageSize(nextPageSize);
                setCurrentPage(nextPageSize === pageSize ? pagination.current || 1 : 1);
              }}
              rowKey={(record) => record.id || record.staff_id}
              scroll={{ x: 1060 }}
            />
          </div>
        )}
      </section>

      <UserEdit open={editOpen} user={selectedUser} onClose={closeEdit} onUpdate={fetchUsers} />
    </div>
  );
}

export default UsersList;
