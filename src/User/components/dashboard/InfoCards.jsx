import React, { useState,useEffect } from 'react';
import { FaUsers, FaChartLine } from 'react-icons/fa';
import BASE_URL from '../../../utils/baseUrl';
import { PiWarningCircle } from 'react-icons/pi';
import { TbFileSymlink } from 'react-icons/tb';
import { FaRegCalendar } from 'react-icons/fa6';
import { FaCheck, FaHourglassHalf } from "react-icons/fa";
import { MdArrowUpward, MdArrowDownward } from "react-icons/md"; 

function InfoCards(){
  
  const [userCount, setUserCount] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [complaintsPending, setComplaintsPending] = useState(0);
  const [complaintsCompleted, setComplaintsCompleted] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [requestsPending, setRequestsPending] = useState(0);
  const [requestsCompleted, setRequestsCompleted] = useState(0);

  const ComplaintOverview = complaintsCompleted > complaintsPending;
  const RequestOverview = requestsCompleted > requestsPending;

  
  const formatDate = () =>
  {
    const now = new Date();
    const options = { day: "numeric", month: "short", year: "numeric" };
    const date = now.toLocaleDateString("en-US", options).replace(",", ""); // Format as 2-Dec-2024
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); // Format as 6:30 PM
    return `${ date } ${ '-' } ${ time }`;
  };

  const currentDateTime = formatDate();
  useEffect(() =>
  {
    fetch(`${ BASE_URL}/api/dashboard-stats/`)
      .then(response => response.json())
      .then(data =>
      {
        setUserCount(data.user_count);
        setComplaintsCount(data.complaints_count);
        setComplaintsPending(data.complaints_pending)
        setRequestsCount(data.requests_count);
        setRequestsPending(data.requests_pending);
        setComplaintsCompleted(data.complaints_completed)
        setRequestsCompleted(data.requests_completed)
      })
      .catch(error => console.error('Error fetching dashboard stats:', error));
  }, []);


    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          padding: "25px 8px",
        }}
      >
        {/* Users Card */}
        <div
          style={{
            backgroundColor: "#9282ca",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaUsers />
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: "0", fontSize: "18px", color: "#fff" }}>
              Total Users
            </h3>
            <p
              style={{
                margin: "0",
                fontSize: "24px",
                fontWeight: "bold",
                color: "#fff",
                textAlign:'center'
              }}
            >
              {userCount}
            </p>
          </div>
        </div>

        {/* Complaints Card */}
        <div
          style={{
            backgroundColor: "#9282ca",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <PiWarningCircle
                style={{
                  fontSize: "24px",
                  color: "#fff",
                  marginRight: "10px",
                }}
              />
              <h3 style={{ margin: "0", fontSize: "18px", color: "#fff" }}>
                Complaints - {complaintsCount}
              </h3>
            </div>
            <div style={{ textAlign: "left", color: "#fff", fontSize: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <FaCheck
                  style={{
                    fontSize: "18px",
                    marginRight: "10px",
                    color: "#fff",
                  }}
                />
                <span>Completed: {complaintsCompleted}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FaHourglassHalf
                  style={{
                    fontSize: "18px",
                    marginRight: "10px",
                    color: "#fff",
                  }}
                />
                <span>Pending: {complaintsPending}</span>
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "40px",
              color: ComplaintOverview ? "#4caf50" : "#f44336", 
            }}
          >
            {ComplaintOverview ? <MdArrowUpward /> : <MdArrowDownward />}
          </div>
        </div>

        {/* Request Card */}
        <div
          style={{
            backgroundColor: "#9282ca",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <TbFileSymlink
                style={{
                  fontSize: "24px",
                  color: "#fff",
                  marginRight: "10px",
                }}
              />
              <h3 style={{ margin: "0", fontSize: "18px", color: "#fff" }}>
                Requests - {requestsCount}
              </h3>
            </div>
            <div style={{ textAlign: "left", color: "#fff", fontSize: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <FaCheck
                  style={{
                    fontSize: "18px",
                    marginRight: "10px",
                    color: "#fff",
                  }}
                />
                <span>Completed: {requestsCompleted}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FaHourglassHalf
                  style={{
                    fontSize: "18px",
                    marginRight: "10px",
                    color: "#fff",
                  }}
                />
                <span>Pending: {requestsPending}</span>
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "40px",
              color: RequestOverview ? "#4caf50" : "#f44336", 
            }}
          >
            {RequestOverview ? <MdArrowUpward /> : <MdArrowDownward />}
          </div>
        </div>

        {/* Date Card */}
        <div
          style={{
            backgroundColor: "#9282ca",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaRegCalendar/>
          </div>
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: "0", fontSize: "18px", color: "#fff" }}>
              Date & Time
            </h3>
            <p
              style={{
                margin: "0",
                fontSize: "24px",
                color: "#fff",
              }}
            >
              {currentDateTime}
            </p>
          </div>
        </div>
      </div>
    );
}

export default InfoCards;
