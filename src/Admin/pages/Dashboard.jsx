import React from 'react';

import InfoCards from '../components/dashboard/InfoCards';
import InfoChart from '../components/dashboard/InfoChart';
import DoughnutChart from '../components/dashboard/DoughnutChart';

function Dashboard() {

  return (

    <div className="container-fluid">

      <InfoCards />

      {/* ========================= */}
      {/* COMPLAINTS ROW */}
      {/* ========================= */}

      <div className="row mt-4 align-items-stretch">

        {/* BAR CHART */}

        <div className="col-12 col-lg-9 mb-4">

          <InfoChart type="complaints" />

        </div>

        {/* PIE CHART */}

        <div className="col-12 col-lg-3 mb-4">

          <DoughnutChart type="complaints" />

        </div>

      </div>

      {/* ========================= */}
      {/* REQUESTS ROW */}
      {/* ========================= */}

      <div className="row align-items-stretch">

        {/* BAR CHART */}

        <div className="col-12 col-lg-9 mb-4">

          <InfoChart type="requests" />

        </div>

        {/* PIE CHART */}

        <div className="col-12 col-lg-3 mb-4">

          <DoughnutChart type="requests" />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;