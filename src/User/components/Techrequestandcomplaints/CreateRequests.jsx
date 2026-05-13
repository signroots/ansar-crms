import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, Typography, Box, Modal, ThemeProvider, createTheme, CircularProgress } from '@mui/material';
import axios from 'axios'; // Import Axios
import { toast } from "react-toastify";
import BASE_URL from '../../../utils/baseUrl';
import CloseIcon from "@mui/icons-material/Close";
function CreateRequests()
{
    const [formData, setFormData] = useState({
        typeOfRequest: '',
        allRequest: '',
        notes: '',
        staffId: '',
        program_name: '',
        program_date: '',
        program_time: '',
    });
    const [typesOfRequest, setTypesOfRequest] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [staffIds, setStaffIds] = useState([]);
    const [openModal, setOpenModal] = useState(false);  // For opening modal
    const [loading, setLoading] = useState(false); // Loading state for submit button

    const getAccessToken = () => localStorage.getItem('admin_access_token');
    const getRefreshToken = () => localStorage.getItem('admin_refresh_token');
    const selectedRequestObj = allRequests.find(r => r.id === formData.allRequest);
    const selectedRequestName = selectedRequestObj ? selectedRequestObj.name : '';
    const refreshToken = async () =>
    {
        try
        {
            const refresh_token = getRefreshToken();
            if (!refresh_token)
            {
                console.error("No refresh token found. Redirecting to login...");
                window.location.href = "/admin/login";
                return null;
            }

            const response = await axios.post(`${ BASE_URL }/api/token/refresh/`, { refresh: refresh_token });

            if (response.status === 200)
            {
                const newAccessToken = response.data.access;
                localStorage.setItem('admin_access_token', newAccessToken);
                return newAccessToken;
            }
        } catch (error)
        {
            console.error("Token refresh failed. Redirecting to login...", error);
            localStorage.removeItem('admin_access_token');
            localStorage.removeItem('admin_refresh_token');
            window.location.href = "/admin/login";
            return null;
        }
    };

    const apiRequest = async (method, url, data = null, retry = true) =>
    {
        let access_token = getAccessToken();
        try
        {
            const response = await axios({
                method,
                url: `${ BASE_URL }${ url }`,
                data,
                headers: { Authorization: `Bearer ${ access_token }` },
            });
            return response;
        } catch (error)
        {
            if (error.response && error.response.status === 401 && retry)
            {
                access_token = await refreshToken();
                if (access_token)
                {
                    return apiRequest(method, url, data, false);
                }
            }
            throw error;
        }
    };

    useEffect(() =>
    {
        axios.get(`${ BASE_URL }/api/types-of-request/`)
            .then((response) => setTypesOfRequest(response.data))
            .catch(() => setTypesOfRequest([]));
    }, []);

    useEffect(() =>
    {
        apiRequest("GET", "/api/check-staff-id/?data=DepartmentHead")
            .then((response) => setStaffIds(response.data.staff_ids || []))
            .catch(() => setStaffIds([]));
    }, []);

    const handleTypeOfRequestChange = (e) =>
    {
        const selectedValue = e.target.value;
        const selectedType = typesOfRequest.find(type => type.id === selectedValue);
        console.log("Selected Type of Request:", selectedType); // Log to check the selected request type

        setFormData({
            ...formData,
            typeOfRequest: selectedValue, // Store ID
            typeOfRequestName: selectedType ? selectedType.name : "", // Store corresponding name for reference
            allRequest: ''
        });

        axios.get(`${ BASE_URL }/api/allrequests/${ selectedValue }/`)
            .then((response) => setAllRequests(response.data))
            .catch(() => setAllRequests([]));
    };
    console.log("formData.typeOfRequest value: ", formData.typeOfRequest);
    const handleInputChange = (e) =>
    {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        // Basic Validation
        if (!formData.staffId || !formData.allRequest || !formData.typeOfRequest)
        {
            toast.error("Please fill in all the required fields.");
            return;
        }

        setLoading(true); // Set loading state to true

        const payload = {
            staff_id: formData.staffId,
            issue_request: formData.allRequest,
            notes: formData.notes,
            type_of_request: formData.typeOfRequest,
            created_by: "Admin",
            program_name: formData.program_name,
            program_date: formData.program_date,
            program_time: formData.program_time,
        };

        try
        {
            const response = await axios.post(`${ BASE_URL }/api/requests/submit/`, payload);

            if (response.status === 201)
            {
                toast.success("Submitted successfully");
                setFormData({
                    typeOfRequest: '',
                    allRequest: '',
                    notes: '',
                    staffId: '',
                    program_name: '',
                    program_date: '',
                    program_time: '',
                });
                setOpenModal(false);
            } else
            {
                toast.warning("Failed to submit");
            }
        } catch (error)
        {
            console.error('Error submitting the request:', error);
            toast.error("Failed to submit, error occurred");
        } finally
        {
            setLoading(false); // Reset loading state
        }
    };

    const customTheme = createTheme({
        palette: {
            primary: {
                main: "#877bdc",
            },
        },
    });

    return (
        <ThemeProvider theme={customTheme}>
            <div>
                <Button variant="contained" size="sm" color="primary" onClick={() => setOpenModal(true)}>
                    Add
                </Button>

                <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        width: 600,
                        borderRadius: 2,
                        height: 'auto',
                    }}>
                        <CloseIcon
                                                onClick={() => setOpenModal(false)}
                                                sx={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    cursor: "pointer",
                                                    color: "grey.600",
                                                    "&:hover": {
                                                        color: "red",
                                                    },
                                                }}
                                            />
                        <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
                            Requests
                        </Typography>

                        <Select
                            fullWidth
                            value={formData.staffId}
                            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                            displayEmpty
                            sx={{ marginBottom: 2 }}
                        >
                            <MenuItem value="" disabled>Select Staff ID</MenuItem>
                            {staffIds.map((staff) => (
                                <MenuItem key={staff.id} value={staff.id}>
                                    {staff.id}
                                </MenuItem>
                            ))}
                        </Select>

                        {/* Request Type Dropdown */}
                        <Select
                            value={formData.typeOfRequest}
                            onChange={handleTypeOfRequestChange}
                            fullWidth
                            displayEmpty
                            sx={{ marginBottom: 2 }}
                        >
                            <MenuItem value="" disabled hidden>Select Type of Request</MenuItem>
                            {typesOfRequest.map((type) => (
                                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                            ))}
                        </Select>

                        {/* Request Dropdown */}
                        <Select
                            value={formData.allRequest}
                            onChange={(e) => setFormData({ ...formData, allRequest: e.target.value })}
                            fullWidth
                            displayEmpty
                            disabled={!formData.typeOfRequest}
                            sx={{ marginBottom: 2 }}
                        >
                            <MenuItem value="" disabled hidden>Select Request</MenuItem>
                            {allRequests
                                .filter((issue) =>
                                {
                                    const selectedStaff = staffIds.find(s => s.id === formData.staffId);
                                    const allowedInstitutionIds = [5, 6, 7];

                                    if (!selectedStaff) return false; // Don't show anything if no staff selected yet

                                    if (issue.name === "Stage Programs")
                                    {
                                        return allowedInstitutionIds.includes(selectedStaff.institution_id);
                                    }

                                    return true;
                                })
                                .map((issue) => (
                                    <MenuItem key={issue.id} value={issue.id}>{issue.name}</MenuItem>
                                ))
                            }
                        </Select>
                        {/* Conditionally Render Program Fields */}
                        {formData.allRequest === 3 && (
                            <>
                                <TextField
                                    name="program_name"
                                    label="Program Name"
                                    value={formData.program_name}
                                    onChange={handleInputChange}
                                    fullWidth
                                    sx={{ marginBottom: 2 }}
                                />
                                <TextField
                                    name="program_date"
                                    label="Program Date"
                                    type="date"
                                    value={formData.program_date}
                                    onChange={handleInputChange}
                                    fullWidth
                                    sx={{ marginBottom: 2 }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <TextField
                                    name="program_time"
                                    label="Program Time"
                                    type="time"
                                    value={formData.program_time}
                                    onChange={handleInputChange}
                                    fullWidth
                                    sx={{ marginBottom: 2 }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </>
                        )}
                        {/* Notes TextField */}
                        <TextField
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            label="Notes (optional)"
                            multiline
                            fullWidth
                            rows={3}
                            sx={{ marginBottom: 2 }}
                        />

                        

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            fullWidth
                        >
                            Submit
                        </Button>
                    </Box>
                </Modal>
            </div>
        </ThemeProvider>
    
    );
}

export default CreateRequests;
