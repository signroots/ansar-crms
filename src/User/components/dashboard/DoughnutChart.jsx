import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
  // Data for the doughnut chart
  const data = {
    labels: ["Purple", "Blue", "Yellow", "Green"], // Labels for the segments
    datasets: [
      {
        data: [300, 300, 0, 0], // Data for each segment
        backgroundColor: ["#ae9eed", "#33B5FF", "#FFEB33", "#33FF57"], // Segment colors
        hoverBackgroundColor: ["#816a9d", "#2196F3", "#FFEB3B", "#4CAF50"], // Hover colors
      },
    ],
  };

  // Options for the chart (optional customization)
  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true, // Enable tooltips on hover
      },
      legend: {
        position: 'top', // Position of the legend (can be 'top', 'left', 'bottom', 'right')
        labels: {
          boxWidth: 20, // Width of the box next to the label
          padding: 15,  // Padding between the label and the chart
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', margin: '0 auto',borderRadius:'1rem',backgroundColor:'white',padding:'1rem',boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <h5>Chart</h5>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;
