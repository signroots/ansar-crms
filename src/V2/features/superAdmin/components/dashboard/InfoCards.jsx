 
import { FaCheckCircle, FaRegCalendarAlt, FaUsers } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import { PiWarningCircle } from "react-icons/pi";
import { TbFileSymlink } from "react-icons/tb";

import { getCompletionRate, getOpenCount } from "./useDashboardData";

const numberFormatter = new Intl.NumberFormat("en-IN");

const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const formatDateTime = (date) => {
  const value = date || new Date();

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
};

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "16px",
  },
  card: (accent, isFeatured = false) => ({
    position: "relative",
    minHeight: isFeatured ? "176px" : "158px",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background:
      "linear-gradient(145deg, var(--admin-surface, #ffffff) 0%, var(--admin-surface-soft, #f8fafc) 100%)",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
    color: "var(--admin-text, #101828)",
    overflow: "hidden",
    isolation: "isolate",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    "--card-accent": accent,
  }),
  glow: {
    position: "absolute",
    right: "-34px",
    top: "-42px",
    width: "120px",
    height: "120px",
    borderRadius: "36px",
    background: "color-mix(in srgb, var(--card-accent) 18%, transparent)",
    transform: "rotate(24deg)",
    zIndex: -1,
  },
  top: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "14px",
  },
  iconBox: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background: "color-mix(in srgb, var(--card-accent) 14%, transparent)",
    color: "var(--card-accent)",
  },
  kicker: {
    margin: 0,
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    lineHeight: 1.2,
    textTransform: "uppercase",
  },
  value: {
    margin: "14px 0 0",
    fontSize: "34px",
    fontWeight: 800,
    letterSpacing: "0",
    lineHeight: 1,
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "10px",
    color: "var(--admin-muted, #667085)",
    fontSize: "13px",
    fontWeight: 600,
  },
  progressTrack: {
    height: "8px",
    marginTop: "16px",
    borderRadius: "999px",
    background: "var(--admin-surface-muted, #eef2f7)",
    overflow: "hidden",
  },
  progressFill: (rate) => ({
    width: `${Math.min(rate, 100)}%`,
    height: "100%",
    borderRadius: "999px",
    background: "var(--card-accent)",
  }),
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "14px",
  },
  smallStat: {
    display: "grid",
    gap: "2px",
  },
  smallLabel: {
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 600,
  },
  smallValue: {
    color: "var(--admin-text, #101828)",
    fontSize: "15px",
    fontWeight: 800,
  },
  skeleton: {
    display: "inline-block",
    width: "78px",
    height: "32px",
    borderRadius: "12px",
    background: "var(--admin-surface-muted, #eef2f7)",
  },
};

const MetricValue = ({ loading, value }) =>
  loading ? <span style={styles.skeleton} /> : formatNumber(value);

function InfoCards({ loading, refreshedAt, stats }) {
  const complaintCompletionRate = getCompletionRate(stats.complaints);
  const requestCompletionRate = getCompletionRate(stats.requests);

  const cards = [
    {
      accent: "#0cb899",
      icon: FaUsers,
      label: "People",
      meta: "Registered users",
      value: stats.userCount,
    },
    {
      accent: "#ef4444",
      icon: PiWarningCircle,
      hasRate: true,
      label: "Complaints",
      meta: `${formatNumber(getOpenCount(stats.complaints))} open cases`,
      rate: complaintCompletionRate,
      value: stats.complaints.total,
    },
    {
      accent: "#3b82f6",
      icon: TbFileSymlink,
      hasRate: true,
      label: "Requests",
      meta: `${formatNumber(getOpenCount(stats.requests))} open requests`,
      rate: requestCompletionRate,
      value: stats.requests.total,
    },
    {
      accent: "#f59e0b",
      icon: FaRegCalendarAlt,
      label: "Last Sync",
      meta: "Dashboard refresh",
      value: formatDateTime(refreshedAt),
      isTextValue: true,
    },
  ];

  return (
    <section style={styles.grid}>
      {cards.map(({ accent, hasRate, icon: Icon, isTextValue, label, meta, rate, value }) => (
        <article key={label} style={styles.card(accent, hasRate)}>
          <span style={styles.glow} />

          <div style={styles.top}>
            <div>
              <p style={styles.kicker}>{label}</p>
              <h2
                style={{
                  ...styles.value,
                  fontSize: isTextValue ? "22px" : styles.value.fontSize,
                  lineHeight: isTextValue ? 1.18 : styles.value.lineHeight,
                }}
              >
                {isTextValue ? value : <MetricValue loading={loading} value={value} />}
              </h2>
            </div>

            <div style={styles.iconBox}>
              <Icon size={22} />
            </div>
          </div>

          <div style={styles.meta}>
            {hasRate ? <FaCheckCircle size={14} /> : <FiArrowUpRight size={14} />}
            <span>{hasRate ? `${rate}% completed` : meta}</span>
          </div>

          {hasRate ? (
            <>
              <div style={styles.progressTrack}>
                <div style={styles.progressFill(rate)} />
              </div>
              <div style={styles.row}>
                <div style={styles.smallStat}>
                  <span style={styles.smallLabel}>Completed</span>
                  <span style={styles.smallValue}>
                    {formatNumber(
                      label === "Complaints"
                        ? stats.complaints.completed
                        : stats.requests.completed,
                    )}
                  </span>
                </div>
                <div style={{ ...styles.smallStat, textAlign: "right" }}>
                  <span style={styles.smallLabel}>Pending</span>
                  <span style={styles.smallValue}>
                    {formatNumber(
                      label === "Complaints" ? stats.complaints.pending : stats.requests.pending,
                    )}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export default InfoCards;
