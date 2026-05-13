import React, { useEffect, useState } from "react";

import {
  Doughnut
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import axios from "axios";

import BASE_URL from "../../../utils/baseUrl";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function DoughnutChart({ type }) {

  const [chartData, setChartData] =
    useState({});

  useEffect(() => {
    fetchChartData();
  }, [type]);

  const fetchChartData = async () => {

    try {

      const response = await axios.get(
        `${BASE_URL}/api/pie_chart_monthly-complaints-requests/`
      );

      if (type === "complaints") {

        setChartData(
          response.data.complaints_status_wise
        );

      } else {

        setChartData(
          response.data.requests_status_wise
        );
      }

    } catch (error) {

      console.log(error);

    }
  };

  // =========================
  // TOTALS
  // =========================

  const getTotals = (data) => {

    const totals = {};

    Object.values(data).forEach(
      (monthData) => {

        Object.entries(monthData)
          .forEach(([status, count]) => {

            totals[status] =
              (totals[status] || 0)
              + count;
          });
      }
    );

    return totals;
  };

  const totals = getTotals(chartData);

  return (

    <div
      style={{
        background: "#fff",
        borderRadius: "15px",
        padding: "20px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.08)",
        height: "100%",
      }}
    >

      <h2
        style={{
          marginBottom: "20px",
          fontWeight: "600",
        }}
      >

        {type === "complaints"
          ? "Complaints"
          : "Requests"}

      </h2>

      <div
        style={{
          height: "320px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >

        <Doughnut
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}

          data={{
            labels:
              Object.keys(totals),

            datasets: [
              {
                data:
                  Object.values(totals),

                backgroundColor:
                  type === "complaints"
                    ? [
                        "#4caf50",
                        "#f44336",
                        "#ff9800",
                        "#2196f3",
                      ]
                    : [
                        "#2196f3",
                        "#9c27b0",
                        "#ff9800",
                        "#4caf50",
                      ],

                borderWidth: 1,
              },
            ],
          }}
        />

      </div>

    </div>
  );
}

export default DoughnutChart;