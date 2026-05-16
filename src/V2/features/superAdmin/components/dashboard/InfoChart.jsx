 
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import { DASHBOARD_MONTH_LABELS, DASHBOARD_MONTHS } from "./useDashboardData";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
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
  badge: (accent) => ({
    flexShrink: 0,
    padding: "8px 10px",
    borderRadius: "999px",
    background: "color-mix(in srgb, " + accent + " 14%, transparent)",
    color: accent,
    fontSize: "12px",
    fontWeight: 800,
  }),
  chart: {
    height: "334px",
  },
  empty: {
    height: "334px",
    display: "grid",
    placeItems: "center",
    color: "var(--admin-muted, #667085)",
    background: "var(--admin-surface-soft, #f8fafc)",
    borderRadius: "14px",
  },
};

const getMonthlyTotal = (monthData = {}) =>
  Object.values(monthData).reduce((total, count) => total + Number(count || 0), 0);

function InfoChart({ accent = "#3b82f6", loading, monthlyStatusData = {}, title, type }) {
  const totalCounts = DASHBOARD_MONTHS.map((month) => getMonthlyTotal(monthlyStatusData[month]));
  const completedCounts = DASHBOARD_MONTHS.map((month) =>
    Number(monthlyStatusData[month]?.Completed || 0),
  );
  const openCounts = totalCounts.map((total, index) => Math.max(total - completedCounts[index], 0));
  const hasData = totalCounts.some((count) => count > 0);

  return (
    <article style={styles.card}>
      <div style={styles.header}>
        <div>
          <p style={styles.kicker}>Monthly trend</p>
          <h2 style={styles.title}>{title}</h2>
        </div>
        <span style={styles.badge(accent)}>
          {type === "complaints" ? "Complaint flow" : "Request flow"}
        </span>
      </div>

      {loading || hasData ? (
        <div style={styles.chart}>
          <Bar
            data={{
              labels: DASHBOARD_MONTH_LABELS,
              datasets: [
                {
                  label: "Total",
                  data: totalCounts,
                  backgroundColor: accent,
                  borderRadius: 9,
                  barThickness: 16,
                },
                {
                  label: "Completed",
                  data: completedCounts,
                  backgroundColor: "#0cb899",
                  borderRadius: 9,
                  barThickness: 16,
                },
                {
                  label: "Open",
                  data: openCounts,
                  backgroundColor: "#f59e0b",
                  borderRadius: 9,
                  barThickness: 16,
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: {
                  align: "end",
                  labels: {
                    boxHeight: 10,
                    boxWidth: 10,
                    color: "#667085",
                    font: {
                      size: 12,
                      weight: 700,
                    },
                    usePointStyle: true,
                  },
                  position: "top",
                },
                tooltip: {
                  backgroundColor: "#101828",
                  cornerRadius: 12,
                  padding: 12,
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: "#667085",
                    font: {
                      size: 11,
                      weight: 700,
                    },
                  },
                },
                y: {
                  beginAtZero: true,
                  border: {
                    display: false,
                  },
                  grid: {
                    color: "rgba(148, 163, 184, 0.18)",
                  },
                  ticks: {
                    color: "#667085",
                    precision: 0,
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <div style={styles.empty}>No monthly data available</div>
      )}
    </article>
  );
}

export default InfoChart;
