import React, { useEffect, useState } from "react";
import axios from "axios";

import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import BASE_URL from "../../../utils/baseUrl";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function InfoChart({ type }) {

  const [chartData, setChartData] =
    useState({});

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {

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

  const months = [
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

  const totalCounts = months.map((month) => {

    const monthData = chartData[month];

    if (!monthData) return 0;

    return Object.values(monthData)
      .reduce((a, b) => a + b, 0);

  });

  const completedCounts = months.map(
    (month) => {
      return chartData[month]?.Completed || 0;
    }
  );

  return (

    <div
      style={{
        background: "#fff",
        borderRadius: "15px",
        padding: "20px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >

      <h2 style={{ marginBottom: "20px" }}>

        {type === "complaints"
          ? "Complaints"
          : "Requests"}

      </h2>

      <div style={{ height: "350px" }}>

        <Bar
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}

          data={{
            labels: months,

            datasets: [
              {
                label: "Count",

                data: totalCounts,

                backgroundColor:
                  type === "complaints"
                    ? "#2196f3"
                    : "#f4d03f",
              },

              {
                label: "Completed",

                data: completedCounts,

                backgroundColor: "#4caf50",
              },
            ],
          }}
        />

      </div>

    </div>
  );
}

export default InfoChart;