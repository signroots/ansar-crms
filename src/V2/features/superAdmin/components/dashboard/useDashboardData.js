import { useCallback, useEffect, useState } from "react";

import { apiService } from "../../../../services/api/Api.service";

export const DASHBOARD_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const DASHBOARD_MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const emptyStats = {
  userCount: 0,
  complaints: {
    total: 0,
    completed: 0,
    pending: 0,
    waiting: 0,
    inProgress: 0,
  },
  requests: {
    total: 0,
    completed: 0,
    pending: 0,
    waiting: 0,
    inProgress: 0,
  },
};

const emptyMonthlyData = {
  complaints: {},
  requests: {},
};

const toNumber = (value) => Number(value || 0);

const readJson = async (url, signal) => {
  return apiService.get(url, { signal });
};

const normalizeStats = (data = {}) => ({
  userCount: toNumber(data.user_count),
  complaints: {
    total: toNumber(data.complaints_count),
    completed: toNumber(data.complaints_completed),
    pending: toNumber(data.complaints_pending),
    waiting: toNumber(data.complaints_waiting),
    inProgress: toNumber(data.complaints_in_progress),
  },
  requests: {
    total: toNumber(data.requests_count),
    completed: toNumber(data.requests_completed),
    pending: toNumber(data.requests_pending),
    waiting: toNumber(data.requests_waiting),
    inProgress: toNumber(data.requests_in_progress),
  },
});

const normalizeMonthlyData = (data = {}) => ({
  complaints: data.complaints_status_wise || {},
  requests: data.requests_status_wise || {},
});

export const getCompletionRate = ({ completed = 0, total = 0 } = {}) => {
  if (!total) {return 0;}

  return Math.round((completed / total) * 100);
};

export const getOpenCount = ({ pending = 0, waiting = 0, inProgress = 0 } = {}) =>
  pending + waiting + inProgress;

export const getStatusTotals = (monthlyStatusData = {}) =>
  Object.values(monthlyStatusData).reduce((totals, monthData) => {
    Object.entries(monthData || {}).forEach(([status, count]) => {
      totals[status] = (totals[status] || 0) + toNumber(count);
    });

    return totals;
  }, {});

export const useDashboardData = () => {
  const [stats, setStats] = useState(emptyStats);
  const [monthlyData, setMonthlyData] = useState(emptyMonthlyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(null);

  const fetchDashboardData = useCallback((signal) => {
    setLoading(true);
    setError("");

    return Promise.allSettled([
      readJson("/api/api/dashboard-stats/", signal),
      readJson("/api/api/pie_chart_monthly-complaints-requests/", signal),
    ])
      .then(([statsResult, monthlyResult]) => {
        if (signal.aborted) {return;}

        if (statsResult.status === "fulfilled") {
          setStats(normalizeStats(statsResult.value));
        } else {
          setError("Unable to load dashboard statistics.");
        }

        if (monthlyResult.status === "fulfilled") {
          setMonthlyData(normalizeMonthlyData(monthlyResult.value));
        } else {
          setError((currentError) =>
            currentError
              ? `${currentError} Monthly chart data is unavailable.`
              : "Monthly chart data is unavailable.",
          );
        }

        setRefreshedAt(new Date());
      })
      .finally(() => {
        if (signal.aborted) {return;}

        setLoading(false);
      });
  }, []);

  const refetch = useCallback(() => {
    const controller = new AbortController();

    fetchDashboardData(controller.signal);

    return () => controller.abort();
  }, [fetchDashboardData]);

  useEffect(() => {
    const controller = new AbortController();

    fetchDashboardData(controller.signal);

    return () => controller.abort();
  }, [fetchDashboardData]);

  return {
    error,
    loading,
    monthlyData,
    refetch,
    refreshedAt,
    stats,
  };
};
