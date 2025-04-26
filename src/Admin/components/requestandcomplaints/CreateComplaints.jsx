import React, { useState, useEffect } from 'react';
import
    {
        TextField, Select, MenuItem, Button, FormControl, InputLabel,
        Typography, Box, Modal, ThemeProvider, createTheme, FormHelperText
    } from '@mui/material';
import axios from 'axios';
import { toast } from "react-toastify";
import BASE_URL from '../../../utils/baseUrl';
import CloseIcon from "@mui/icons-material/Close";


const getAccessToken = () => localStorage.getItem('admin_access_token');
const getRefreshToken = () => localStorage.getItem('admin_refresh_token');

const refreshToken = async () =>
{
    try
    {
        const refresh_token = getRefreshToken();
        if (!refresh_token)
        {
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

const CreateComplaints = () =>
{
    const [formData, setFormData] = useState({
        typeOfIssue: '',
        issue: '',
        notes: '',
        staffId: '',
    });
    const [typesOfIssue, setTypesOfIssue] = useState([]);
    const [issues, setIssues] = useState([]);
    const [staffIds, setStaffIds] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() =>
    {
        apiRequest("GET", "/api/types-of-issue/")
            .then((response) => setTypesOfIssue(response.data))
            .catch(() => setTypesOfIssue([]));

        apiRequest("GET", "/api/check-staff-id/?data=DepartmentHead")
            .then((response) => setStaffIds(response.data.staff_ids || []))
            .catch(() => setStaffIds([]));
    }, []);

    // Function to close modal and refresh data
    // const handleCloseModal = () =>
    // {
    //     setOpenModal(false);  // Close modal
    //     fetchUsers();         // Fetch updated users from API
    // };

    const handleTypeOfIssueChange = async (e) =>
    {
        const typeOfIssueId = e.target.value;
        setFormData({ ...formData, typeOfIssue: typeOfIssueId, issue: '' });
        setErrors({ ...errors, typeOfIssue: '' });

        try
        {
            const response = await apiRequest("GET", `/api/issues/${ typeOfIssueId }/`);
            setIssues(response.data);
        } catch
        {
            setIssues([]);
        }
    };

    const handleInputChange = (e) =>
    {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors({ ...errors, [name]: '' });
    };

    const validateForm = () =>
    {
        let newErrors = {};
        if (!formData.staffId) newErrors.staffId = "Staff ID is required";
        if (!formData.typeOfIssue) newErrors.typeOfIssue = "Type of complaint is required";
        if (!formData.issue) newErrors.issue = "Complaint is required";
        if (!formData.notes) newErrors.notes = "Notes cannot be empty";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) =>
    {
        console.log("Submitting complaint...");
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            staff_id: formData.staffId,
            issue_complaint: formData.issue,
            notes: formData.notes,
            type_of_issue: formData.typeOfIssue,
            created_by: "Admin"
        };

        try
        {
            const response = await apiRequest("POST", "/api/complaints/submit/", payload);

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
            }
            else
                {
                toast.warning("Failed to submit");
            }
             
        
        }catch (error)
        {
            console.error("Submission Error:", error.response ? error.response.data : error.message);
            toast.error(`Error: ${ error.response?.data?.message || "Failed to submit" }`);
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
            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
                Add
            </Button>

            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        width: 500,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                    
                >
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
                    <Typography variant="h6">New Complaints</Typography>

                    <FormControl fullWidth error={!!errors.staffId}>
                        <InputLabel>Select Staff</InputLabel>
                        <Select
                            name="staffId"
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
                        <FormHelperText>{errors.staffId}</FormHelperText>
                    </FormControl>

                    <FormControl fullWidth error={!!errors.typeOfIssue}>
                        <InputLabel>Select Type of Complaint</InputLabel>
                        <Select
                            name="typeOfIssue"
                            value={formData.typeOfIssue}
                            onChange={handleTypeOfIssueChange}
                        >
                            {typesOfIssue.map((type) => (
                                <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.typeOfIssue}</FormHelperText>
                    </FormControl>

                    <FormControl fullWidth error={!!errors.issue}>
                        <InputLabel>Select Complaint</InputLabel>
                        <Select
                            name="issue"
                            value={formData.issue}
                            onChange={handleInputChange}
                            disabled={!formData.typeOfIssue}
                        >
                            {issues.map((issue) => (
                                <MenuItem key={issue.id} value={issue.id}>{issue.name}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>{errors.issue}</FormHelperText>
                    </FormControl>

                    <TextField
                        name="notes"
                        label="Notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        multiline
                        rows={3}
                        fullWidth
                        error={!!errors.notes}
                        helperText={errors.notes}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                        // disabled={!formData.staffId || !formData.typeOfIssue || !formData.issue || !formData.notes}
                    >
                        Submit
                    </Button>
                </Box>
            </Modal>
        </ThemeProvider>
    );
};

export default CreateComplaints;
