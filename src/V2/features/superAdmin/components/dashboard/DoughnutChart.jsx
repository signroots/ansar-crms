 
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import { getStatusTotals } from "./useDashboardData";

ChartJS.register(ArcElement, Tooltip, Legend);

const statusColors = {
  Completed: "#0cb899",
  Pending: "#f59e0b",
  Waiting: "#8b5cf6",
  "In Progress": "#3b82f6",
  Rejected: "#ef4444",
  Cancelled: "#64748b",
};

const fallbackColors = ["#0cb899", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#64748b"];

const styles = {
  card: {
    height: "100%",
    minHeight: "430px",
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid var(--admin-border, #e2e8f0)",
    background: "var(--admin-surface, #ffffff)",
    boxShadow: "var(--admin-shadow, 0 18px 45px rgba(16, 24, 40, 0.08))",
    color: "var(--admin-text, #101828)",
  },
  kicker: {
    margin: 0,
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "5px 0 0",
    color: "var(--admin-text, #101828)",
    fontSize: "20px",
    fontWeight: 800,
    letterSpacing: "0",
  },
  chartWrap: {
    position: "relative",
    height: "244px",
    marginTop: "22px",
  },
  total: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
    textAlign: "center",
  },
  totalValue: {
    color: "var(--admin-text, #101828)",
    fontSize: "30px",
    fontWeight: 800,
    lineHeight: 1,
  },
  totalLabel: {
    display: "block",
    marginTop: "5px",
    color: "var(--admin-muted, #667085)",
    fontSize: "12px",
    fontWeight: 700,
  },
  legend: {
    display: "grid",
    gap: "10px",
    marginTop: "20px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    color: "var(--admin-text, #101828)",
    fontSize: "13px",
    fontWeight: 700,
  },
  legendLeft: {
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    gap: "8px",
  },
  dot: (color) => ({
    width: "9px",
    height: "9px",
    borderRadius: "999px",
    background: color,
    flexShrink: 0,
  }),
  empty: {
    height: "330px",
    display: "grid",
    placeItems: "center",
    color: "var(--admin-muted, #667085)",
    background: "var(--admin-surface-soft, #f8fafc)",
    borderRadius: "14px",
    marginTop: "22px",
  },
};

const formatNumber = (value) => new Intl.NumberFormat("en-IN").format(Number(value || 0));

function DoughnutChart({ loading, monthlyStatusData = {}, title }) {
  const totals = getStatusTotals(monthlyStatusData);
  const labels = Object.keys(totals);
  const values = Object.values(totals);
  const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
  const colors = labels.map(
    (label, index) => statusColors[label] || fallbackColors[index % fallbackColors.length],
  );

  return (
    <article style={styles.card}>
      <p style={styles.kicker}>Status mix</p>
      <h2 style={styles.title}>{title}</h2>

      {loading || total > 0 ? (
        <>
          <div style={styles.chartWrap}>
            <Doughnut
              data={{
                labels,
                datasets: [
                  {
                    data: values,
                    backgroundColor: colors,
                    borderColor: "rgba(255, 255, 255, 0.86)",
                    borderWidth: 4,
                    hoverOffset: 5,
                  },
                ],
              }}
              options={{
                cutout: "72%",
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "#101828",
                    cornerRadius: 12,
                    padding: 12,
                  },
                },
                responsive: true,
              }}
            />

            <div style={styles.total}>
              <div>
                <strong style={styles.totalValue}>{formatNumber(total)}</strong>
                <span style={styles.totalLabel}>Total</span>
              </div>
            </div>
          </div>

          <div style={styles.legend}>
            {labels.slice(0, 5).map((label, index) => (
              <div key={label} style={styles.legendItem}>
                <span style={styles.legendLeft}>
                  <span style={styles.dot(colors[index])} />
                  <span>{label}</span>
                </span>
                <span>{formatNumber(totals[label])}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={styles.empty}>No status data available</div>
      )}
    </article>
  );
}

export default DoughnutChart;
