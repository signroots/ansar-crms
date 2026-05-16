import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Pagination, Popconfirm, Select, Table, Tag, Tooltip } from "antd";
import { FiCopy, FiEdit2, FiSearch, FiTrash2, FiUsers } from "react-icons/fi";
import { LuRefreshCw, LuShieldCheck, LuUserCog, LuUserRoundCheck } from "react-icons/lu";
import { toast } from "react-toastify";

import { apiService } from "../../../../services/api/Api.service";
import { USER_ROLES } from "../../../../shared/constants/roles";
import { getAuthSession } from "../../../../shared/utils/authSession";
import UserAdd from "./UserAdd";
import UserEdit from "./UserEdit";

const USERS_ENDPOINT = "/api/api/users/";
const USER_DELETE_ENDPOINT = (id) => `/api/api/users/delete/${id}/`;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const USERS_FETCH_PAGE_SIZE = 100;

const ROLE_FILTER_OPTIONS = [
  { label: "All roles", value: "all" },
  { label: "Admin", value: USER_ROLES.DEPARTMENT_ADMIN },
  { label: "Staff", value: USER_ROLES.STAFF },
  { label: "Teacher", value: USER_ROLES.TEACHER },
  { label: "Tech Support", value: USER_ROLES.TECHNICAL_STAFF },
];

const roleTagColors = {
  [USER_ROLES.DEPARTMENT_ADMIN]: "gold",
  [USER_ROLES.STAFF]: "blue",
  [USER_ROLES.TEACHER]: "cyan",
  [USER_ROLES.TECHNICAL_STAFF]: "purple",
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

const getUserKey = (user) => user.id || user.staff_id || user.mobile_number || user.name;

const dedupeUsers = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = getUserKey(item);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getUserSearchText = (user) =>
  [
    user.name,
    user.staff_id,
    user.role,
    user.mobile_number,
    user.institution?.name,
    user.department?.name,
    user.section_for_staff,
    user.typeofissue?.name,
    user.type_of_issue?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const matchesUserRole = (user, roleFilter) => {
  if (roleFilter === "all") {
    return true;
  }

  if (roleFilter === USER_ROLES.DEPARTMENT_ADMIN) {
    return user.role === USER_ROLES.DEPARTMENT_ADMIN || Boolean(user.is_admin);
  }

  return user.role === roleFilter;
};

const getRoleContext = () => {
  const { isAdmin, role, typeOfIssue } = getAuthSession();
  const isDepartmentAdmin =
    role === USER_ROLES.DEPARTMENT_ADMIN || (role === USER_ROLES.TECHNICAL_STAFF && isAdmin);

  if (isDepartmentAdmin) {
    return {
      eyebrow: typeOfIssue || "Department Team",
      title: "Department Users",
      subtitle: "Manage the staff and technical users connected with your department workflow.",
    };
  }

  return {
    eyebrow: "Access Control",
    title: "User Management",
    subtitle: "Create users, review role access, maintain staff IDs, and keep contact data clean.",
  };
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  const roleContext = useMemo(() => getRoleContext(), []);

  const fetchUsers = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const firstPageData = await apiService.get(USERS_ENDPOINT, {
        params: {
          page: 1,
          page_size: USERS_FETCH_PAGE_SIZE,
        },
      });
      const firstPage = normalizeUsersResponse(firstPageData);
      const totalFromApi = firstPage.count;
      const effectivePageSize = firstPage.results.length || USERS_FETCH_PAGE_SIZE;
      const totalPages =
        totalFromApi > firstPage.results.length ? Math.ceil(totalFromApi / effectivePageSize) : 1;

      let allUsers = firstPage.results;

      if (totalPages > 1) {
        const pageRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
          apiService.get(USERS_ENDPOINT, {
            params: {
              page: index + 2,
              page_size: USERS_FETCH_PAGE_SIZE,
            },
          }),
        );
        const pageResponses = await Promise.all(pageRequests);

        allUsers = [
          ...firstPage.results,
          ...pageResponses.flatMap((response) => normalizeUsersResponse(response).results),
        ];
      }

      setUsers(dedupeUsers(allUsers));
    } catch (fetchError) {
      console.error("Error fetching users:", fetchError);
      setError("Unable to load users right now.");
      toast.error("Unable to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, search]);

  const filteredUsers = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = matchesUserRole(user, roleFilter);
      const matchesSearch = !searchTerm || getUserSearchText(user).includes(searchTerm);

      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredUsers, pageSize]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, filteredUsers.length, pageSize]);

  const metrics = useMemo(() => {
    const loadedCounts = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        if (user.is_admin) {
          acc.adminUsers += 1;
        }
        return acc;
      },
      {
        [USER_ROLES.STAFF]: 0,
        [USER_ROLES.TEACHER]: 0,
        [USER_ROLES.TECHNICAL_STAFF]: 0,
        adminUsers: 0,
      },
    );

    return [
      {
        accent: "#0cb899",
        icon: FiUsers,
        label: "Total users",
        value: users.length,
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
        label: "Loaded admins",
        value: loadedCounts.adminUsers,
      },
    ];
  }, [users]);

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
    setCurrentPage(1);
    fetchUsers();
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
      title: "User",
      width: 210,
    },
    {
      dataIndex: "role",
      key: "role",
      render: (role, user) => (
        <div style={{ display: "grid", gap: "6px" }}>
          <Tag color={roleTagColors[role] || "default"} className="w-fit"             styles={{ root: { width: "fit-content" } }}
>
            {getText(role)}
          </Tag>
          {user.is_admin ? <Tag color="gold">Department Admin</Tag> : null}
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

          <Select onChange={setRoleFilter} options={ROLE_FILTER_OPTIONS} value={roleFilter} />

          <span style={styles.muted}>
            Showing {formatNumber(paginatedUsers.length)} of {formatNumber(filteredUsers.length)}{" "}
            filtered
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
              dataSource={paginatedUsers}
              loading={loading}
              locale={{ emptyText: <Empty description="No users found" /> }}
              pagination={false}
              rowKey={(record) => record.id || record.staff_id}
              scroll={{ x: 1060 }}
            />
          </div>
        )}

        <div style={styles.pagination}>
          <Pagination
            current={currentPage}
            onChange={(page) => setCurrentPage(page)}
            pageSize={pageSize}
            showSizeChanger={false}
            total={filteredUsers.length}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={styles.muted}>Rows</span>
            <Select
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              options={PAGE_SIZE_OPTIONS.map((value) => ({
                label: `${value} / page`,
                value,
              }))}
              style={{ width: 128 }}
              value={pageSize}
            />
          </div>
        </div>
      </section>

      <UserEdit open={editOpen} user={selectedUser} onClose={closeEdit} onUpdate={fetchUsers} />
    </div>
  );
}

export default UsersList;
