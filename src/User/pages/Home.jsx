import React, { useState, useEffect } from 'react';
import
{
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  Button,
  SpeedDial,
  SpeedDialAction,
} from '@mui/material';
import { FaRegEye } from 'react-icons/fa6';
import axios from 'axios';
import BASE_URL from '../../utils/baseUrl';
import { TbMoodEmpty } from 'react-icons/tb';
import { Article, AssignmentLate, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Home()
{
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [delayReason, setDelayReason] = useState('');
  const steps = ['Pending', 'In Progress', 'Waiting', 'Completed'];
  const navigate = useNavigate();

  useEffect(() =>
  {
    const staff_id = localStorage.getItem('staff_id');

    if (!staff_id)
    {
      console.error('Staff ID is not found in localStorage');
      return;
    }

    // Fetch Requests
    axios
      .get(`${ BASE_URL }/api/sumbitted-request/list/`, { params: { staff_id } })
      .then((response) => setRequests(response.data))
      .catch((error) => console.error('Error fetching requests:', error));

    // Fetch Complaints
    axios
      .get(`${ BASE_URL }/api/sumbitted-complaint/list/`, { params: { staff_id } })
      .then((response) => setComplaints(response.data))
      .catch((error) => console.error('Error fetching complaints:', error));
  }, []);

  useEffect(() =>
  {
    // Update delayReason when selectedItem changes and has a delay_reason
    if (selectedItem?.delay_reason && selectedItem.status === 'Waiting')
    {
      setDelayReason(selectedItem.delay_reason);
    } else
    {
      setDelayReason('');
    }
  }, [selectedItem]);

  const handleTabChange = (event, newValue) =>
  {
    setActiveTab(newValue);
    setSelectedItem(null); // Reset selected item on tab change
  };

  const handleListClick = (item) =>
  {
    const stepIndex = steps.indexOf(item.status);
    setSelectedItem({ ...item, stepIndex });
  };

  const handleBackClick = () => setSelectedItem(null);

  const renderList = (data) =>
  {
    // Filter items where status is 'pending'
    const filteredData = data.filter(item => item.status === 'Pending');

    if (filteredData.length === 0)
    {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <TbMoodEmpty style={{ fontSize: '50px', color: '#ccc', marginTop: '5rem' }} />
          <Typography variant="body1" sx={{ fontSize: '16px', color: '#888' }}>
            No items available for the selected.
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {filteredData.map((item) => (
          <ListItem
            key={item.id}
            button
            onClick={() => handleListClick(item)}
            sx={{
              border: '1px solid #ccc',
              borderRadius: '6px',
              marginBottom: 1,
              '&:hover': { backgroundColor: '#f0f0f0' },
            }}
          >
            <ListItemText
              primary={
                <>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#fff',
                      backgroundColor: '#dc3545'
                    }}
                  >
                    {item.status}
                  </Box>
                  <br />
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                    {new Date(item.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Typography>
                </>
              }
              secondary={
                <Typography variant="body2" sx={{ fontSize: '14px', color: '#333', marginTop: '1px' }}>
                  {item.issue_request?.name || item.issue_complaint?.name || 'N/A'}
                </Typography>
              }
            />
            <FaRegEye style={{ color: '#877bdc', cursor: 'pointer', fontSize: '20px' }} />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderDetails = () => (
    <Card sx={{ boxShadow: 0, height: '100%' }}>
      <CardContent >
        <Button variant="outlined" onClick={handleBackClick} sx={{ marginBottom: 2 }}>
          Back
        </Button>

        {
          selectedItem.issue_request ? (
            <Typography variant="body1" textAlign="center" sx={{ marginBottom: 5, fontSize: '13px' }}>
              {`Details of Request ${ selectedItem.id }`}
            </Typography>
          ) : selectedItem.issue_complaint ? (
            <Typography variant="body1" textAlign="center" sx={{ marginBottom: 5, fontSize: '13px' }}>
              {`Details of Complaint ${ selectedItem.id }`}
            </Typography>
          ) : (
            <Typography variant="body1" textAlign="center" sx={{ marginBottom: 5, fontSize: '13px' }}>
              {'Details not available'}
            </Typography>
          )
        }

        <Typography
          variant="body1"
          textAlign="center"
          sx={{ fontSize: '13px', fontWeight: 'bold', marginBottom: 1 }}
        >
          {`${ new Date(selectedItem.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }) } - ${ new Date(selectedItem.date).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }) }`}
        </Typography>
        <Stepper activeStep={selectedItem.stepIndex} orientation="vertical" sx={{ paddingTop: '3rem' }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>
                {label}
                {label === 'Waiting' && selectedItem.status === 'Waiting' && delayReason && (
                  <small style={{ display: 'block', color: '#dc3545', marginTop: '2px', fontSize: '11px' }}>
                    {delayReason.name}
                  </small>
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        padding: 0,
        maxWidth: 400,
        margin: 'auto',
        backgroundColor: '#fff',
        borderRadius: 2,
        boxShadow: 0,
        minHeight: '100%',
        position: 'relative', // Added to anchor SpeedDial
      }}
    >
      <Tabs value={activeTab} onChange={handleTabChange} centered>
        <Tab label="Complaints" />
        <Tab label="Requests" />
      </Tabs>
      <CardContent sx={{padding:1}}>      
        {selectedItem
          ? renderDetails()
          : activeTab === 0
            ? renderList(complaints)
            : renderList(requests) }
      </CardContent>

      {/* SpeedDial in the bottom-right */}
      <SpeedDial
        ariaLabel="SpeedDial example"
        sx={{
          position: 'fixed',  // Change to fixed to ensure it stays in the bottom-right corner
          bottom: 65,
          right: 19,
          backgroundColor: 'transparent', // No background color by default// Adjust the right margin if needed
        }}
        icon={<Add />}
      >
        <SpeedDialAction
          icon={<AssignmentLate />}
          tooltipTitle="Complaints"
          tooltipOpen 
          onClick={() => navigate('/user/user-complaints')}
        />
        <SpeedDialAction
          icon={<Article />}
          tooltipTitle="Requests"
          tooltipOpen
          onClick={() => navigate('/user/user-requests')}
        />
      </SpeedDial>

    </Box>
  );
}

export default Home;
