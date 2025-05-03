import React, { useState, useEffect } from 'react';
import
{
    Box,
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
} from '@mui/material';
import axios from 'axios';
import BASE_URL from '../../utils/baseUrl';
import { FaRegEye } from 'react-icons/fa6';


function AllRequests()
{
    const [activeStep, setActiveStep] = useState(0);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [delayReason, setDelayReason] = useState([]);
    const [complaints, setComplaints] = useState([]);

    const Complaintssteps = ['Pending', 'In Progress', 'Waiting', 'Completed'];

    useEffect(() =>
    {
        if (Array.isArray(selectedComplaint?.delay_reason) && selectedComplaint.status === 'Waiting')
        {
            setDelayReason(selectedComplaint.delay_reason);
        } else
        {
            setDelayReason([]); // Reset to empty array
        }
    }, [selectedComplaint]);


    useEffect(() =>
    {
        const staff_id = localStorage.getItem("staff_id");

        if (!staff_id)
        {
            console.error("Staff ID is not found in localStorage");
            return;
        }

        // Fetch service requests for the current user (no Authorization header)
        axios
            .get(`${ BASE_URL }/api/sumbitted-request/list/`, {
                params: {
                    staff_id: staff_id,
                },
            })
            .then((response) =>
            {
                setComplaints(response.data);
            })
            .catch((error) =>
            {
                console.error("Error fetching service requests:", error);
                toast.error("Failed to load service requests.");
            });
    }, []);


    const handleListClick = (request) =>
    {
        const stepIndex = Complaintssteps.indexOf(request.status);
        setSelectedComplaint({ ...request, stepIndex });
    };

    const handleBackClick = () =>
    {
        setSelectedComplaint(null);
    };

    return (
        <Box
            sx={{
                padding: 0,
                maxWidth: 400,
                margin: 'auto',
                backgroundColor: '#fff',
                borderRadius: 2,
                boxShadow: 0,
                height: '100%',
            }}
        >
            {!selectedComplaint ? (
                // List View
                <Card sx={{ boxShadow: 0, marginBottom: 2 }}>
                    <CardContent sx={{ padding: 0 }}>
                        <Typography align="center" variant="subtitle2" className='fw-semibold text-muted' gutterBottom>
                            All Requests
                        </Typography>
                        <List>
                            {complaints.map((request) => (
                                <ListItem
                                    button
                                    key={request.id}
                                    onClick={() => handleListClick(request)}
                                    sx={{
                                        border: '1px solid #ccc',
                                        borderRadius: '6px',
                                        marginBottom: 1,
                                        '&:hover': {
                                            backgroundColor: '#f0f0f0',
                                        },
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
                                                            request.status === 'Completed'
                                                                ? '#28a745' // Green for completed
                                                                : request.status === 'Pending'
                                                                    ? '#dc3545' // Red for pending
                                                                    : request.status === 'In Progress'
                                                                        ? '#007bff'
                                                                        : request.status === 'Waiting'
                                                                            ? '#ffc107' :
                                                                            '#919191' //for cancel
                                                    }}
                                                >
                                                    {request.status}
                                                </Box>
                                                
                                                <br />
                                                <Typography variant="body2" sx={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                                                    {
                                                        new Date(request.date).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })
                                                    }
                                                </Typography>
                                            </>
                                        }
                                        secondary={
                                            <Typography variant="body2" sx={{ fontSize: '14px', color: '#333', marginTop: '1px' }}>
                                                {`${ request.issue_request?.name || 'N/A' }`}
                                            </Typography>
                                        }
                                    />


                                    <FaRegEye
                                        style={{ color: '#877bdc', cursor: 'pointer', fontSize: '20px' }}
                                    />

                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            ) : (
                // Stepper View
                <Card sx={{ boxShadow: 0 }}>
                    <CardContent>
                        <Button
                            variant="outlined"
                            onClick={handleBackClick}
                            sx={{
                                marginBottom: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            Back
                        </Button>

                        <Typography
                            variant="body1"
                            textAlign="center"
                            sx={{ marginBottom: 5, fontSize: '13px' }}
                        >
                            {`Details of complaint :  ${ selectedComplaint.id }`}
                        </Typography>

                        <Typography
                            variant="body1"
                            textAlign="center"
                            sx={{ fontSize: '13px', fontWeight: 'bold' }}
                        >
                            {`${ new Date(selectedComplaint.date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })
                                }`}
                            {' - '}
                            {new Date(selectedComplaint.date).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </Typography>

                        <Typography
                            variant="body1"
                            textAlign="center"
                            sx={{ marginBottom: 6, marginTop: 1, fontSize: '17px', fontWeight: 'bold' }}
                        >
                            {`${ selectedComplaint.issue_request.name }`}
                        </Typography>
                        {/* 
                        <Stepper activeStep={selectedComplaint.stepIndex} orientation="vertical" sx={{ gap: 1 }}>
                            {Complaintssteps.map((label, index) => (
                                <Step key={index}>
                                    <StepLabel sx={{ marginBottom: 1 }}>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper> */}
                        <Stepper activeStep={selectedComplaint.stepIndex} orientation="vertical" sx={{ paddingTop: '3rem' }}>
                            {Complaintssteps.map((label, index) => (
                                <Step key={index}>
                                    <StepLabel>
                                        {label}
                                        {label === 'Waiting' && selectedComplaint.status === 'Waiting' && Array.isArray(delayReason) && (
                                            delayReason.map((reason, idx) => (
                                                <small
                                                    key={idx}
                                                    style={{ display: 'block', color: '#878787', marginTop: '2px', fontSize: '11px' }}
                                                >
                                                    {reason.reason} - {new Date(reason.created_at).toLocaleString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    }).replace(",", "")}
                                                </small>
                                            ))
                                        )}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </CardContent>
                    {/* <p className='text-danger text-center'>{selectedComplaint.delay_reason}</p> */}

                </Card>
            )}
        </Box>
    );
}

export default AllRequests;
