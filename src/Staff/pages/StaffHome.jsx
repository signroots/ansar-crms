import React, { useState, useEffect } from 'react';
import
{
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Select,
  MenuItem,
  Paper,
  Card,
  CardContent,
  Divider,
  TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { IconButton } from '@mui/material';
import { WhatsApp, Call } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../utils/baseUrl';
import { FaRegEye } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { TbMoodEmpty } from 'react-icons/tb';

function StaffHome()
{
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  // Manage an array of delay reasons
  const [delayReasons, setDelayReasons] = useState([]);
  const [newDelayReason, setNewDelayReason] = useState("");
  const [showSubmitButton, setShowSubmitButton] = useState(false);

  // Handle delay_reason value/submit button 
  const handleDelayReasonChange = (e) =>
  {
    const value = e.target.value;
    setNewDelayReason(value);
    // Show button only if new input
    setShowSubmitButton(value.trim().length > 0);
  };



  // For update delay reason on selectedTask
  useEffect(() =>
  {
    if (selectedTask?.delay_reason)
    {
      try
      {
        setDelayReasons(Array.isArray(selectedTask?.delay_reason) ? selectedTask.delay_reason : []);

      } catch (error)
      {
        console.error("Error  delay_reason:", error);
      }
    }
  }, [selectedTask]);


  useEffect(() =>
  {
    const fetchComplaints = async () =>
    {
      const staffId = localStorage.getItem('staff_id');
      try
      {
        const response = await axios.get(`${ BASE_URL }/api/complaints-list/tech-support/`, {
          params: { staff_id: staffId },
        });
        const complaints = response.data.map(item => ({ ...item, type: 'complaint' }));
        setServiceRequests(prevRequests =>
        {
          const existingIds = prevRequests.map(req => req.id);
          const newRequests = complaints.filter(item => !existingIds.includes(item.id));
          return [...prevRequests, ...newRequests];
        });
      } catch (error)
      {
        console.error('Error fetching complaints:', error);
      }
    };

    const fetchRequests = async () =>
    {
      const staffId = localStorage.getItem('staff_id');
      try
      {
        const response = await axios.get(`${ BASE_URL }/api/requests-list/tech-support/`, {
          params: { staff_id: staffId },
        });
        const requests = response.data.map(item => ({ ...item, type: 'request' }));
        setServiceRequests(prevRequests =>
        {
          const existingIds = prevRequests.map(req => req.id);
          const newRequests = requests.filter(item => !existingIds.includes(item.id));
          return [...prevRequests, ...newRequests];
        });
      } catch (error)
      {
        console.error('Error fetching requests:', error);
      }
    };

    fetchComplaints();
    fetchRequests();

    const intervalId = setInterval(() =>
    {
      fetchComplaints();
      fetchRequests();
    }, 3600000);

    return () => clearInterval(intervalId);
  }, []);



  const handleViewDetails = (taskId) =>
  {
    const task = serviceRequests.find((task) => task.id === taskId);
    setSelectedTask(task);
  };

  const handleStatusChange = async (newStatus) =>
  {
    const staffId = localStorage.getItem("staff_id");
    const isComplaint = selectedTask.type === "complaint"; // Check if the task is a complaint or a request
    const endpoint = isComplaint
      ? `${ BASE_URL }/api/complaint/${ selectedTask.id }/update-status/`
      : `${ BASE_URL }/api/request/${ selectedTask.id }/update-status/`;

    try
    {
      await axios.patch(endpoint, {
        status: newStatus,
        staff_id: staffId,
      });

      // Update the state with the new status
      setSelectedTask({ ...selectedTask, status: newStatus });
      setServiceRequests((prevRequests) =>
        prevRequests.map((task) =>
          task.id === selectedTask.id ? { ...task, status: newStatus } : task
        )
      );
    } catch (error)
    {
      console.error("Error updating status:", error);
    }
  };



  const handleButtonClick = () =>
  {
    // Show confirmation dialog before changing to "in progress"
    setConfirmDialog({
      open: true,
      action: () => handleStatusChange("In Progress"),
    });
  };

  const handleDropdownChange = (event) =>
  {
    const newStatus = event.target.value;

    if (newStatus === "In Progress" || newStatus === "Completed" || newStatus === "Waiting")
    {
      // Show confirmation dialog for "in progress" and "completed"
      setConfirmDialog({
        open: true,
        action: () => handleStatusChange(newStatus),
      });
    } else
    {
      // Update status directly for other values
      handleStatusChange(newStatus);
    }
  };

  const handleDialogClose = (confirm) =>
  {
    setConfirmDialog({ open: false, action: null });
    if (confirm && confirmDialog.action)
    {
      confirmDialog.action();
    }
  };

  const handleSubmit = async () =>
  {
    const staffId = localStorage.getItem('staff_id');
    const isComplaint = selectedTask.type === "complaint"; // Determine if it's a complaint or a request
    const endpoint = isComplaint
      ? `${ BASE_URL }/api/complaint/${ selectedTask.id }/update-delay-reason/`
      : `${ BASE_URL }/api/request/${ selectedTask.id }/update-delay-reason/`;

    try
    {
      const response = await axios.patch(endpoint, {
        delay_reason: newDelayReason,
        staff_id: staffId,
      });

      const updatedData = response.data;

      // Update selectedTask locally with delay_reason
      setSelectedTask((prev) => ({
        ...prev,
        delay_reason: updatedData.delay_reason,
      }));

      // Update delayReasons state locally to reflect the change
      setDelayReasons(updatedData.delay_reason);

      // Clear the input field and UI state
      setNewDelayReason("");
      setShowSubmitButton(false);
      toast.success("Reason updated successfully");
    } catch (error)
    {
      console.error('Error submitting delay reason:', error);
    }
  };


  const handleBackToList = () =>
  {
    setSelectedTask(null);
  };

  console.log(serviceRequests);

  return (
    <Box sx={{
      padding: 1,
      maxWidth: 400,
      margin: 'auto',
      backgroundColor: '#fff',
      borderRadius: 2,
      boxShadow: 0,
      height: '100%',
      textAlign: 'center',
      overflowY: 'auto',

    }}>
      <Typography align="left" variant="subtitle2" className='fw-semibold mb-3' gutterBottom>
        {selectedTask
          ? selectedTask.issue_complaint
            ? 'Complaint'
            : 'Request'
          : 'Complaints & Requests'}
      </Typography>

      <>
        {selectedTask ? (
          <Card
            sx={{
              width: '100%',
              maxWidth: 500,
              margin: 'auto',
              padding: 0,
              boxShadow: 0,
              backgroundColor: '#fcfcfc',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Date */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
              <Typography variant="subtitle2" className='fw-semibold'>Date</Typography>
              <Typography variant="subtitle2" className='text-muted'>
                {selectedTask.date ? (
                  <>
                    <span >
                      {new Date(selectedTask.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>{' '}
                    -{' '}
                    <span >
                      {new Date(selectedTask.date).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </>
                ) : (
                  <span style={{ color: 'gray' }}>{''}</span> // Replace "N/A" with "null" if required
                )}
              </Typography>
            </Box>

            {/* Institution */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
              <Typography variant="subtitle2" className='fw-semibold '>Institution</Typography>
              <Typography variant="subtitle2" className='text-muted'>{selectedTask?.institution?.name || 'N/A'}</Typography>
            </Box>

            {/* Department */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
              <Typography variant="subtitle2" className='fw-semibold'>Department</Typography>
              <Typography variant="subtitle2" className='text-muted'>{selectedTask?.department?.name || 'N/A'}</Typography>
            </Box>

            {/* Type of Issue */}
            {/* Type of Issue */}
            {
              selectedTask.issue_complaint ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                    <Typography variant="subtitle2" className='fw-semibold'>Complaint</Typography>
                    <Typography variant="subtitle2" className='text-muted'>{selectedTask.issue_complaint?.name || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                    <Typography variant="subtitle2" className='fw-semibold'>Complainted by</Typography>
                    <Typography variant="subtitle2" className='text-muted'>{selectedTask.complainted_by?.name || 'N/A'}</Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                    <Typography variant="subtitle2" className='fw-semibold'>Request</Typography>
                    <Typography variant="subtitle2" className='text-muted'>{selectedTask.issue_request?.name || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                    <Typography variant="subtitle2" className='fw-semibold'>Requested by</Typography>
                    <Typography variant="subtitle2" className='text-muted'>{selectedTask.requested_by?.name || 'N/A'}</Typography>
                  </Box>
                </>
              )
            }


            {/* Notes */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="subtitle2" className='fw-semibold' sx={{ textAlign: 'start', marginBottom: 0.5 }}>Notes</Typography>
              <Box
                sx={{
                  minHeight: '7.8em',
                  maxHeight: '7.8em',
                  overflow: 'auto',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 7,
                  overflowY: 'auto',
                  border: '1px solid #bababa',
                  borderRadius: 2,
                  padding: '3px'
                }}
              >
                <Typography variant="subtitle2" className='text-muted' sx={{ color: '#666', textAlign: 'start' }}>
                  {selectedTask?.notes || 'No additional notes provided.'}
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" className='fw-semibold' sx={{ textAlign: 'start', marginBottom: 0.5 }}>Status</Typography>
            {selectedTask.status === "Pending" ? (
              <Button variant="contained" onClick={handleButtonClick}>Attend</Button>
            ) : selectedTask.status === "Waiting" ? (
              <Select value={selectedTask.status} onChange={handleDropdownChange} fullWidth>
                <MenuItem disabled hidden value="Waiting">Waiting</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            ) : selectedTask.status === "In Progress" ? (
              <Select value={selectedTask.status} onChange={handleDropdownChange} fullWidth>
                <MenuItem disabled hidden value="In Progress">In Progress</MenuItem>
                <MenuItem value="Waiting">Waiting</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            ) : (<Select value={selectedTask.status} onChange={handleDropdownChange} disabled fullWidth>
              <MenuItem disabled value="Completed">Completed</MenuItem>
            </Select>)
            }

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => handleDialogClose(false)}>
              <DialogTitle>Confirm Action</DialogTitle>
              <DialogContent>
                <DialogContentText>Are you sure you want to update the status?</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleDialogClose(false)}>Cancel</Button>
                <Button onClick={() => handleDialogClose(true)} autoFocus>
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>

            {/* Show Delay Reason Section Only When Status is 'waiting' */}
            {selectedTask?.status === 'Waiting' && (
              <Box sx={{ marginBottom: 2 }}>
                <Typography variant="subtitle2" className='fw-semibold' sx={{ textAlign: 'start', marginBottom: 0.5, marginTop: 1.5 }}>
                  Delay Reason
                </Typography>
                <div className="mb-3">
                  <div className="border p-2"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      padding: "5px",
                    }}
                  >
                    {delayReasons.length > 0 ? (
                      delayReasons.map((remarks, index) => (
                        <div
                          key={index}
                          className="d-flex justify-content-between align-items-center border-bottom py-2 w-100"
                        >
                          <Typography variant="subtitle2">
                            {remarks.reason}
                          </Typography>
                          <div >
                            <small className="text-muted">
                              {new Date(remarks.created_at).toLocaleString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }).replace(",", "")}
                            </small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <small className="text-muted">No delay reasons available.</small>
                    )}
                  </div>
                </div>
                <TextField
                  value={newDelayReason}
                  onChange={handleDelayReasonChange}
                  fullWidth
                  placeholder="Enter delay reason"
                />

              </Box>
            )}
            {selectedTask?.status === 'Waiting' && showSubmitButton && (
              <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ marginTop: 0 }}>
                Submit Delay Reason
              </Button>
            )}


            {/* Contact */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, marginTop: 3 }}>
              {/* WhatsApp Button */}
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#25D366',
                  color: 'white',
                  padding: 1,
                  '&:hover': {
                    backgroundColor: '#128C7E',
                  },
                  width: '48%',
                }}
                href={`https://wa.me/${ selectedTask?.complainted_by?.mobile_number }`}
                target="_blank"
                startIcon={<WhatsApp />}
              >
                WhatsApp
              </Button>

              {/* Call Button */}
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#007BFF',
                  color: 'white',
                  padding: 1,
                  '&:hover': {
                    backgroundColor: '#0056b3',
                  },
                  width: '48%',
                }}
                href={`tel:${ selectedTask?.complainted_by?.mobile_number }`}
                target="_blank"
                startIcon={<Call />}
              >
                Call
              </Button>
            </Box>




            {/* Back Button */}
            <Button variant="outlined" fullWidth onClick={handleBackToList} sx={{ marginTop: 2 }}>
              Back to List
            </Button>

          </Card>



        ) : (
          <List sx={{ padding: 0 }}>
            {serviceRequests?.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <TbMoodEmpty style={{ fontSize: '50px', color: '#ccc', marginTop: '5rem' }} />
                <Typography variant="body1" sx={{ fontSize: '16px', color: '#888' }}>
                  No Complaints Available
                </Typography>
              </Box>
            ) : (
              serviceRequests
                ?.filter((task) => task.status === 'Pending') // Filter for pending status
                .map((task) => (
                  <ListItem
                    key={`${ task.id }-${ task.type }`}
                    sx={{
                      padding: 1,
                      marginBottom: 1,
                      borderRadius: 2,
                      border: '1px solid #ddd',
                      '&:hover': { backgroundColor: '#f9f9f9' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box>
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-block',
                              padding: '2px 4px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: '#fff',
                              backgroundColor: '#dc3545',
                              marginRight: '8px',
                            }}
                          >
                            {task.status}
                          </Box>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              fontSize: '12px',
                              color: '#666',
                              marginLeft: '4px',
                              verticalAlign: 'middle',
                            }}
                          >
                            {task.issue_complaint ? 'Complaint' : 'Request'}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontSize: '13px', color: '#666', marginTop: '4px' }}
                          >
                            {new Date(task.date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{ fontSize: '14px', color: '#333', marginTop: '0px' }}
                        >
                          {`${ task.issue_complaint?.name || task.issue_request?.name }`}
                        </Typography>
                      }
                    />
                    <FaRegEye
                      style={{ color: '#877bdc', cursor: 'pointer', fontSize: '20px' }}
                      onClick={() => handleViewDetails(task.id)}
                    />
                  </ListItem>

                ))
            )}
          </List>

        )}
      </>
    </Box>
  );
}

export default StaffHome;
