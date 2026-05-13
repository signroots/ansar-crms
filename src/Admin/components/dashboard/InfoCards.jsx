import React, { useState, useEffect } from 'react';
import { FaUsers, FaCheck, FaHourglassHalf, FaRegCalendar } from 'react-icons/fa';
import { PiWarningCircle } from 'react-icons/pi';
import { TbFileSymlink } from 'react-icons/tb';
import { MdArrowUpward } from 'react-icons/md';
import BASE_URL from '../../../utils/baseUrl';

function InfoCards() {
  const [userCount, setUserCount] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [complaintsPending, setComplaintsPending] = useState(0);
  const [complaintsCompleted, setComplaintsCompleted] = useState(0);
  const [complaintsWaiting, setComplaintsWaiting] = useState(0);
  const [complaintsInProgress, setComplaintsInProgress] = useState(0);

  const [requestsCount, setRequestsCount] = useState(0);
  const [requestsPending, setRequestsPending] = useState(0);
  const [requestsCompleted, setRequestsCompleted] = useState(0);
  const [requestsWaiting, setRequestsWaiting] = useState(0);
  const [requestsInProgress, setRequestsInProgress] = useState(0);

  const formatDate = () => {
    const now = new Date();
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = now.toLocaleDateString('en-US', options).replace(',', '');
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${date} - ${time}`;
  };
  const currentDateTime = formatDate();

  // For arrow color (green if completed > pending, else red)
  const complaintArrowColor = complaintsCompleted > complaintsPending ? '#4caf50' : '#f44336';
  const requestArrowColor = requestsCompleted > requestsPending ? '#4caf50' : '#f44336';

  useEffect(() => {
    fetch(`${BASE_URL}/api/dashboard-stats/`)
      .then((response) => response.json())
      .then((data) => {
        setUserCount(data.user_count);
        setComplaintsCount(data.complaints_count);
        setComplaintsPending(data.complaints_pending);
        setComplaintsCompleted(data.complaints_completed);
        setComplaintsWaiting(data.complaints_waiting || 0); // add waiting count if available
        setComplaintsInProgress(data.complaints_in_progress || 0);

        setRequestsCount(data.requests_count);
        setRequestsPending(data.requests_pending);
        setRequestsCompleted(data.requests_completed);
        setRequestsWaiting(data.requests_waiting || 0);
        setRequestsInProgress(data.requests_in_progress || 0);
      })
      .catch((error) => console.error('Error fetching dashboard stats:', error));
  }, []);

  const cardStyle = {
    backgroundColor: '#9282ca',
    borderRadius: '8px',
    padding: '20px',
    color: '#fff',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    position: 'relative',
    minWidth: '220px',
  };

  const arrowStyle = {
    position: 'absolute',
    right: '15px',
    top: '15px',
    fontSize: '24px',
    color: complaintArrowColor,
  };

  const requestArrowStyle = {
    position: 'absolute',
    right: '15px',
    top: '15px',
    fontSize: '24px',
    color: requestArrowColor,
  };

  const iconLargeStyle = {
    fontSize: '40px',
    marginRight: '15px',
  };

  const smallTextStyle = {
    fontSize: '16px',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
  };

  const iconSmallStyle = {
    marginRight: '8px',
    fontSize: '18px',
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        padding: '25px 8px',
      }}
    >
      {/* Users Card */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FaUsers style={iconLargeStyle} />
        <div style={{ textAlign: 'right' }}>
          <div>Total Users</div>
          <h2 style={{ marginTop: 6, fontSize: '24px' }}>{userCount}</h2>
        </div>
      </div>

      {/* Complaints Card */}
      <div style={cardStyle}>
        <MdArrowUpward style={arrowStyle} />
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <PiWarningCircle style={iconLargeStyle} />
          <h3 style={{ margin: 0, fontWeight: '600' }}>
            Complaints - {complaintsCount}
          </h3>
        </div>
        <div style={smallTextStyle}>
          <FaCheck style={iconSmallStyle} />
          Completed: {complaintsCompleted}
        </div>
        <div style={smallTextStyle}>
          <FaHourglassHalf style={iconSmallStyle} />
          Pending: {complaintsPending}
        </div>
        <div style={smallTextStyle}>
          <FaHourglassHalf style={iconSmallStyle} />
          Waiting: {complaintsWaiting}
        </div>
        <div style={smallTextStyle}>
          <FaHourglassHalf style={iconSmallStyle} />
          In Progress: {complaintsInProgress}
        </div>
      </div>

      {/* Requests Card */}
      <div style={cardStyle}>
        <MdArrowUpward style={requestArrowStyle} />
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <TbFileSymlink style={iconLargeStyle} />
          <h3 style={{ margin: 0, fontWeight: '600' }}>
            Requests - {requestsCount}
          </h3>
        </div>
        <div style={smallTextStyle}>
          <FaCheck style={iconSmallStyle} />
          Completed: {requestsCompleted}
        </div>
        <div style={smallTextStyle}>
          <FaHourglassHalf style={iconSmallStyle} />
          Pending: {requestsPending}
        </div>
        <div style={smallTextStyle}>
          <FaHourglassHalf style={iconSmallStyle} />
          Waiting: {requestsWaiting}
        </div>
        <div style={smallTextStyle}>
          <FaHourglassHalf style={iconSmallStyle} />
          In Progress: {requestsInProgress}
        </div>
      </div>

      {/* Date & Time Card */}
      <div
        style={{
          ...cardStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: '30px',
        }}
      >
        <FaRegCalendar style={iconLargeStyle} />
        <div style={{ textAlign: 'right' }}>
          <div>Date & Time</div>
          <h2 style={{ marginTop: 6, fontSize: '24px' }}>{currentDateTime}</h2>
        </div>
      </div>
    </div>
  );
}

export default InfoCards;