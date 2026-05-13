import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import BASE_URL from '../../../utils/baseUrl';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const infoChart = () =>
{

  const [chartData, setChartData] = useState({});

  // Fetch monthly complaints and requests data
  useEffect(() =>
  {
    const fetchChartData = async () =>
    {
      try
      {
        const response = await fetch(`${ BASE_URL }/api/monthly-complaints-requests/`);
        const data = await response.json();
        setChartData(data);  // Set the fetched data to state
      } catch (error)
      {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, []);

  // Static month names (X-axis labels)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Prepare data for the chart
  const data = {
    labels: months, // Static month names
    datasets: [
      {
        label: "Complaints",
        data: chartData.complaints || [],
        backgroundColor: '#45afd7',
        borderColor: '#0075a1',
        borderWidth: 1,
      },
      {
        label: "Requests",
        data: chartData.requests || [],
        backgroundColor: '#f4b400',
        borderColor: '#c48800',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Complaints vs Requests',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div
      style={{
        width: '100%',
        margin: '0 auto',
        height: '100%',
        borderRadius: '1rem',
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}    >
      <h5 style={{ textAlign: 'left', color: 'black' }}>{new Date().getFullYear()} Statics</h5>
      <Bar data={data} options={options} height={88} />
    </div>
  );
};

export default infoChart;
