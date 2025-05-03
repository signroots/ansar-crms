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


function RequestHandle()
{
    const [serviceRequests, setServiceRequests] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

    // Manage an array of delay reasons
    const [delayReasons, setDelayReasons] = useState([]);
    const [newDelayReason, setNewDelayReason] = useState("");
    // for submit delay reason
    const [showSubmitButton, setShowSubmitButton] = useState(false);

    // Manage an array of completed reasons
    const [completedReasons, setCompletedReasons] = useState([]);
    const [newCompletedReason, setNewCompletedReason] = useState("");
  

    // Handle delay_reason value/submit button 
    const handleDelayReasonChange = (e) =>
    {
        const value = e.target.value;
        setNewDelayReason(value);
        // Show button only if new input
        setShowSubmitButton(value.trim().length > 0);
    };
    const handleCompletedReasonChange = (e) =>
    {
        const value = e.target.value || "";
        setNewCompletedReason(value);
        setShowSubmitButton(value.trim().length > 0);
    };


    // For update delay reason on selectedTask
    useEffect(() =>
    {
        if (selectedTask?.delay_reason)
        {
            try
            {
                // setDelayReasons(selectedTask.delay_reason);
                setDelayReasons(Array.isArray(selectedTask?.delay_reason) ? selectedTask.delay_reason : []);

            } catch (error)
            {
                console.error("Error  delay_reason:", error);
            }
        }
    }, [selectedTask]);


    useEffect(() =>
    {
        const fetchServiceRequests = async () =>
        {
            const staffId = localStorage.getItem('staff_id');
            try
            {
                const response = await axios.get(`${ BASE_URL }/api/requests-list/tech-support/`, {
                    params: { staff_id: staffId },
                });
                setServiceRequests(response.data);
            } catch (error)
            {
                console.error('Error fetching service requests:', error);
            }
        };

        // Fetch data on first render
        fetchServiceRequests();

        const intervalId = setInterval(fetchServiceRequests, 3600000);

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

        try
        {
            await axios.patch(`${ BASE_URL }/api/request/${ selectedTask.id }/update-status/`, {
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
    const handleNoteSubmit = async () =>
        {
            const staffId = localStorage.getItem('staff_id');
            try
            {
                const response = await axios.patch(`${ BASE_URL }/api/request/${ selectedTask.id }/update-completed-reason/`, {
                    staff_id: staffId,
                    completed_note: newCompletedReason
                });
    
                const updateddata = response.data;
    
                // Parse the updated completed_note correctly
                let parsedNotes = [];
    
                if (typeof updateddata.completed_note === 'string')
                {
                    try
                    {
                        const fixed = updateddata.completed_note.replace(/'/g, '"');
                        parsedNotes = JSON.parse(fixed);
                    } catch (e)
                    {
                        console.error("Error parsing updated completed_note:", e);
                    }
                } else if (Array.isArray(updateddata.completed_note))
                {
                    parsedNotes = updateddata.completed_note;
                }
    
                // ✅ Update both selectedTask and UI state with parsed notes
                setSelectedTask((prev) => ({
                    ...prev,
                    completed_note: parsedNotes,
                }));
                setCompletedReasons(updateddata.completed_note);
    
                setNewCompletedReason("");
                setShowSubmitButton(false);
                toast.success("Notes updated successfully");
            } catch (error)
            {
                console.error('Error submitting completed reason:', error);
            }
        };

    const handleSubmit = async () =>
    {
        const staffId = localStorage.getItem('staff_id');
        try
        {
            const response = await axios.patch(`${ BASE_URL }/api/request/${ selectedTask.id }/update-delay-reason/`, {
                delay_reason: newDelayReason,
                staff_id: staffId,
            });

            // Get the updated complaint data from the backend 
            const updateddata = response.data;

            // Update selectedRequest locally with the full updated delay_reason list
            setSelectedTask((prev) => ({
                ...prev,
                delay_reason: updateddata.delay_reason,
            }));

            // Update delayReasons state locally to reflect the change
            setDelayReasons(updateddata.delay_reason);

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
                All Requests
            </Typography>

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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                        <Typography variant="subtitle2" className='fw-semibold'>Request</Typography>
                        <Typography variant="subtitle2" className='text-muted'>{selectedTask.issue_request?.name || 'N/A'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1.5 }}>
                        <Typography variant="subtitle2" className='fw-semibold'>Requested by</Typography>
                        <Typography variant="subtitle2" className='text-muted'>{selectedTask.requested_by?.name || 'N/A'}</Typography>
                    </Box>

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
                    ) : selectedTask.status === "Completed" ? (<Select value={selectedTask.status} onChange={handleDropdownChange} disabled fullWidth>
                        <MenuItem disabled value="Completed">Completed</MenuItem>
                    </Select>) : (<Select value={selectedTask.status} onChange={handleDropdownChange} disabled fullWidth>
                        <MenuItem disabled value="Cancelled">Cancelled</MenuItem>
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

                    {selectedTask?.status === 'Completed' && (
                        <Box sx={{ marginBottom: 2 }}>
                            <Typography variant="subtitle2" className='fw-semibold' sx={{ textAlign: 'start', marginBottom: 0.5, marginTop: 1.5 }}>
                                Completed Notes
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
                                    {Array.isArray(completedReasons) && completedReasons.length > 0 ? (
                                        completedReasons.map((remarks, index) => (
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
                                        <small className="text-muted">No completed note available.</small>
                                    )}
                                </div>
                            </div>
                            <TextField
                                value={newCompletedReason}
                                onChange={handleCompletedReasonChange}
                                fullWidth
                                placeholder="Enter completed notes"
                            />

                        </Box>
                    )}
                    {selectedTask?.status === 'Completed' && showSubmitButton && (
                        <Button variant="contained" color="primary" onClick={handleNoteSubmit} sx={{ marginTop: 0 }}>
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
                                No Requests Available
                            </Typography>
                        </Box>
                    ) : (
                        serviceRequests?.map((task) => (
                            <ListItem
                                key={task.id}
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
                                        <>
                                            <Box
                                                sx={{
                                                    display: 'inline-block',
                                                    padding: '2px 4px',
                                                    borderRadius: '4px',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    color: '#fff',
                                                    backgroundColor:
                                                        task.status === 'Completed'
                                                            ? '#28a745' // Green for completed
                                                            : task.status === 'Pending'
                                                                ? '#dc3545' // Red for pending
                                                                : task.status === 'In Progress'
                                                                    ? '#007bff'
                                                                    : task.status === 'Waiting'
                                                                        ? '#ffc107' :
                                                                        '#919191' //for cancel
                                                }}
                                            >
                                                {task.status}
                                            </Box>
                                            <br />
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
                                        </>
                                    }
                                    secondary={
                                        <Typography variant="body2" sx={{ fontSize: '14px', color: '#333', marginTop: '0px' }}>
                                            {`${ task.issue_request?.name || 'N/A' }`}
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
        </Box>
    );
}

export default RequestHandle;
