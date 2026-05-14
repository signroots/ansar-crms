import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, Pagination, Select, Table, Tag } from "antd";
import { FiMessageSquare, FiRefreshCw, FiSearch, FiStar } from "react-icons/fi";
import { LuClipboardList, LuSmile, LuUserCheck } from "react-icons/lu";
import { toast } from "react-toastify";

import { apiService } from "../../../V2/services/api/Api.service";

const FEEDBACK_LIST_ENDPOINT = "/api/feedbacklist/";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const RATING_OPTIONS = ["Very Good", "Good", "Medium", "Bad", "Very Bad"];

const ratingColors = {
  Bad: "error",
  Good: "processing",
  Medium: "warning",
  "Very Bad": "default",
  "Very Good": "success",
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
      "radial-gradient(circle at 12% 12%, rgba(245, 158, 11, 0.14), transparent 34%), linear-gradient(135deg, var(--admin-surface, #ffffff), var(--admin-surface-soft, #f8fafc))",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
    padding: "8px 10px",
    borderRadius: "999px",
    background: "rgba(245, 158, 11, 0.12)",
    color: "#b45309",
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
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

const getText = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const normalizeFeedbackResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.feedbacks)) {
    return data.feedbacks;
  }

  if (Array.isArray(data?.feedback)) {
    return data.feedback;
  }

  return [];
};

const getRating = (feedback) =>
  feedback.rating ||
  feedback.response ||
  feedback.answer ||
  feedback.overall_rating ||
  feedback.feedback_rating ||
  feedback.status ||
  "";

const getStudentName = (feedback) =>
  feedback.student?.name || feedback.student_name || feedback.name || "";

const getStudentId = (feedback) =>
  feedback.student?.student_id ||
  feedback.student?.code ||
  feedback.student_id ||
  feedback.code ||
  feedback.admission_no ||
  "";

const getQuestionText = (feedback) =>
  feedback.question?.question_text ||
  feedback.question_text ||
  (typeof feedback.question === "string" ? feedback.question : "") ||
  "";

const getQuestionDate = (feedback) =>
  feedback.question?.created_at ||
  feedback.created_at ||
  feedback.date ||
  feedback.submitted_at ||
  "";

const getSearchText = (feedback) =>
  [getStudentName(feedback), getStudentId(feedback), getQuestionText(feedback), getRating(feedback)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

function FeedbackList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const fetchFeedback = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const data = await apiService.get(FEEDBACK_LIST_ENDPOINT);
      setFeedbackList(normalizeFeedbackResponse(data));
    } catch (fetchError) {
      console.error("Error fetching feedback:", fetchError);
      setError("Unable to load feedback right now.");
      toast.error("Unable to load feedback");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, search]);

  const filteredFeedback = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return feedbackList.filter((feedback) => {
      const rating = getRating(feedback);
      const matchesRating = ratingFilter === "all" || rating === ratingFilter;
      const matchesSearch = !searchTerm || getSearchText(feedback).includes(searchTerm);

      return matchesRating && matchesSearch;
    });
  }, [feedbackList, ratingFilter, search]);

  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;

    return filteredFeedback.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredFeedback, rowsPerPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredFeedback.length / rowsPerPage));

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [currentPage, filteredFeedback.length, rowsPerPage]);

  const metrics = useMemo(() => {
    const positiveCount = feedbackList.filter((feedback) =>
      ["Very Good", "Good"].includes(getRating(feedback)),
    ).length;
    const needsReviewCount = feedbackList.filter((feedback) =>
      ["Bad", "Very Bad"].includes(getRating(feedback)),
    ).length;

    return [
      {
        accent: "#f59e0b",
        icon: LuClipboardList,
        label: "Total answers",
        value: feedbackList.length,
      },
      {
        accent: "#0cb899",
        icon: LuSmile,
        label: "Positive answers",
        value: positiveCount,
      },
      {
        accent: "#ef4444",
        icon: FiStar,
        label: "Needs review",
        value: needsReviewCount,
      },
      {
        accent: "#3b82f6",
        icon: LuUserCheck,
        label: "Filtered rows",
        value: filteredFeedback.length,
      },
    ];
  }, [feedbackList, filteredFeedback.length]);

  const columns = [
    {
      key: "student",
      render: (_, feedback, index) => (
        <div>
          <strong>{getText(getStudentName(feedback), "Student")}</strong>
          <div style={styles.muted}>
            {getText(getStudentId(feedback), `#${(currentPage - 1) * rowsPerPage + index + 1}`)}
          </div>
        </div>
      ),
      title: "Student",
      width: 220,
    },
    {
      key: "question",
      render: (_, feedback) => getText(getQuestionText(feedback)),
      title: "Question",
      width: 440,
    },
    {
      key: "answer",
      render: (_, feedback) => {
        const rating = getRating(feedback);

        return <Tag color={ratingColors[rating] || "default"}>{getText(rating)}</Tag>;
      },
      title: "Answer",
      width: 150,
    },
    {
      key: "date",
      render: (_, feedback) => formatDate(getQuestionDate(feedback)),
      title: "Question Created",
      width: 170,
    },
  ];

  return (
    <div style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            <FiMessageSquare size={14} />
            Feedback Desk
          </p>
          <h1 style={styles.title}>Feedback</h1>
          <p style={styles.subtitle}>
            Review submitted responses, rating patterns, student references, and dated feedback
            records.
          </p>
        </div>

        <Button icon={<FiRefreshCw size={17} />} loading={loading} onClick={fetchFeedback}>
          Refresh
        </Button>
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
            placeholder="Search feedback"
            prefix={<FiSearch />}
            value={search}
          />

          <Select
            onChange={setRatingFilter}
            options={[
              { label: "All ratings", value: "all" },
              ...RATING_OPTIONS.map((rating) => ({
                label: rating,
                value: rating,
              })),
            ]}
            value={ratingFilter}
          />

          <span style={styles.muted}>
            Showing {formatNumber(paginatedFeedback.length)} of{" "}
            {formatNumber(filteredFeedback.length)} filtered
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
              dataSource={paginatedFeedback}
              loading={loading}
              locale={{ emptyText: <Empty description="No feedback found" /> }}
              pagination={false}
              rowKey={(record, index) => record.id || record.feedback_id || index}
              scroll={{ x: 1180 }}
            />
          </div>
        )}

        <div style={styles.pagination}>
          <Pagination
            current={currentPage}
            onChange={(page) => setCurrentPage(page)}
            pageSize={rowsPerPage}
            showSizeChanger={false}
            total={filteredFeedback.length}
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
    </div>
  );
}

export default FeedbackList;
