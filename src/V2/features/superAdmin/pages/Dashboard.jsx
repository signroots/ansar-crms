import { BiRefresh } from "react-icons/bi";
import { FaCheckCircle, FaClock, FaHourglassHalf } from "react-icons/fa";
import { FiActivity, FiAlertTriangle } from "react-icons/fi";
import { MdOutlinePendingActions } from "react-icons/md";

import DoughnutChart from "../components/dashboard/DoughnutChart";
import InfoCards from "../components/dashboard/InfoCards";
import InfoChart from "../components/dashboard/InfoChart";
import {
  getCompletionRate,
  getOpenCount,
  useDashboardData,
} from "../components/dashboard/useDashboardData";

const numberFormatter = new Intl.NumberFormat("en-IN");

const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const roleContext = {
  eyebrow: "Control Center",
  title: "Super Admin Dashboard",
  subtitle: "Monitor school-wide operations, request movement, and complaint resolution health.",
};

const styles = {
  page: {
    display: "grid",
    gap: "20px",
    color: "var(--admin-text, #101828)",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: "18px",
  },
  heroPanel: {
    minHeight: "230px",
    padding: "24px",
    borderRadius: "22px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background:
      "radial-gradient(circle at 12% 18%, rgba(12, 184, 153, 0.16), transparent 34%), linear-gradient(135deg, var(--admin-surface, #ffffff), var(--admin-surface-soft, #f8fafc))",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
    overflow: "hidden",
    position: "relative",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: "720px",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
    padding: "8px 10px",
    borderRadius: "999px",
    color: "#0f766e",
    background: "rgba(12, 184, 153, 0.12)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "18px 0 0",
    maxWidth: "720px",
    color: "var(--admin-text, #101828)",
    fontSize: "38px",
    fontWeight: 850,
    lineHeight: 1.05,
    letterSpacing: "0",
  },
  subtitle: {
    margin: "14px 0 0",
    maxWidth: "620px",
    color: "var(--admin-muted, #667085)",
    fontSize: "15px",
    lineHeight: 1.65,
  },
  heroActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "24px",
  },
  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    minHeight: "42px",
    padding: "0 14px",
    border: "0",
    borderRadius: "12px",
    background: "#0cb899",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    minHeight: "42px",
    padding: "0 12px",
    borderRadius: "12px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface, #ffffff)",
    color: "var(--admin-muted, #667085)",
    fontSize: "13px",
    fontWeight: 700,
  },
  scoreCard: {
    minHeight: "230px",
    padding: "20px",
    borderRadius: "22px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background:
      "linear-gradient(160deg, var(--admin-surface, #ffffff), var(--admin-surface-soft, #f8fafc))",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
  },
  scoreRing: (score) => ({
    width: "152px",
    height: "152px",
    margin: "4px auto 16px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: `conic-gradient(#0cb899 ${score * 3.6}deg, var(--admin-surface-muted, #eef2f7) 0deg)`,
  }),
  scoreInner: {
    width: "112px",
    height: "112px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "var(--admin-surface, #ffffff)",
    color: "var(--admin-text, #101828)",
  },
  scoreValue: {
    fontSize: "30px",
    fontWeight: 850,
    lineHeight: 1,
  },
  scoreLabel: {
    display: "block",
    marginTop: "4px",
    color: "var(--admin-muted, #667085)",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  scoreMeta: {
    margin: 0,
    color: "var(--admin-muted, #667085)",
    fontSize: "13px",
    fontWeight: 700,
    textAlign: "center",
  },
  focusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  focusCard: (accent) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    minHeight: "112px",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface, #ffffff)",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
    "--focus-accent": accent,
  }),
  focusIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    color: "var(--focus-accent)",
    background: "color-mix(in srgb, var(--focus-accent) 14%, transparent)",
    flexShrink: 0,
  },
  focusText: {
    minWidth: 0,
  },
  focusLabel: {
    margin: 0,
    color: "var(--admin-muted, #667085)",
    fontSize: "13px",
    fontWeight: 800,
  },
  focusValue: {
    margin: "6px 0 0",
    color: "var(--admin-text, #101828)",
    fontSize: "28px",
    fontWeight: 850,
    lineHeight: 1,
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },
  sectionTitle: {
    margin: "4px 0 -4px",
    color: "var(--admin-text, #101828)",
    fontSize: "20px",
    fontWeight: 850,
    letterSpacing: "0",
  },
};

function Dashboard() {
  const { error, loading, monthlyData, refreshedAt, refetch, stats } = useDashboardData();

  const complaintCompletion = getCompletionRate(stats.complaints);
  const requestCompletion = getCompletionRate(stats.requests);
  const operationsScore = Math.round((complaintCompletion + requestCompletion) / 2);
  const totalOpen = getOpenCount(stats.complaints) + getOpenCount(stats.requests);

  const focusCards = [
    {
      accent: "#f59e0b",
      icon: MdOutlinePendingActions,
      label: "Pending workload",
      value: stats.complaints.pending + stats.requests.pending,
    },
    {
      accent: "#3b82f6",
      icon: FaClock,
      label: "In progress",
      value: stats.complaints.inProgress + stats.requests.inProgress,
    },
    {
      accent: "#8b5cf6",
      icon: FaHourglassHalf,
      label: "Waiting",
      value: stats.complaints.waiting + stats.requests.waiting,
    },
    {
      accent: "#0cb899",
      icon: FaCheckCircle,
      label: "Completed",
      value: stats.complaints.completed + stats.requests.completed,
    },
  ];

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroPanel}>
          <div style={styles.heroContent}>
            <p style={styles.eyebrow}>
              <FiActivity size={14} />
              {roleContext.eyebrow}
            </p>
            <h1 style={styles.title}>{roleContext.title}</h1>
            <p style={styles.subtitle}>{roleContext.subtitle}</p>

            <div style={styles.heroActions}>
              <button onClick={refetch} style={styles.refreshButton} type="button">
                <BiRefresh size={18} />
                Refresh
              </button>
              <span style={styles.pill}>
                <FiAlertTriangle size={15} />
                {formatNumber(totalOpen)} open items
              </span>
              {error ? <span style={{ ...styles.pill, color: "#ef4444" }}>{error}</span> : null}
            </div>
          </div>
        </div>

        <aside style={styles.scoreCard}>
          <div style={styles.scoreRing(operationsScore)}>
            <div style={styles.scoreInner}>
              <div>
                <strong style={styles.scoreValue}>{operationsScore}%</strong>
                <span style={styles.scoreLabel}>Health</span>
              </div>
            </div>
          </div>
          <p style={styles.scoreMeta}>
            Complaints {complaintCompletion}% closed, requests {requestCompletion}% closed.
          </p>
        </aside>
      </section>

      <InfoCards loading={loading} refreshedAt={refreshedAt} stats={stats} />

      <section style={styles.focusGrid}>
        {focusCards.map(({ accent, icon: Icon, label, value }) => (
          <article key={label} style={styles.focusCard(accent)}>
            <div style={styles.focusText}>
              <p style={styles.focusLabel}>{label}</p>
              <h3 style={styles.focusValue}>{loading ? "-" : formatNumber(value)}</h3>
            </div>
            <div style={styles.focusIcon}>
              <Icon size={22} />
            </div>
          </article>
        ))}
      </section>

      <h2 style={styles.sectionTitle}>Complaint Analytics</h2>
      <section style={styles.chartGrid}>
        <InfoChart
          accent="#ef4444"
          loading={loading}
          monthlyStatusData={monthlyData.complaints}
          title="Complaint volume"
          type="complaints"
        />
        <DoughnutChart
          loading={loading}
          monthlyStatusData={monthlyData.complaints}
          title="Complaint status"
        />
      </section>

      <h2 style={styles.sectionTitle}>Request Analytics</h2>
      <section style={styles.chartGrid}>
        <InfoChart
          accent="#3b82f6"
          loading={loading}
          monthlyStatusData={monthlyData.requests}
          title="Request volume"
          type="requests"
        />
        <DoughnutChart
          loading={loading}
          monthlyStatusData={monthlyData.requests}
          title="Request status"
        />
      </section>
    </div>
  );
}

export default Dashboard;
