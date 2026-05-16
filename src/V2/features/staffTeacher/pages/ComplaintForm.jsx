import { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, Typography, Box } from '@mui/material';
import axios from 'axios'; // Import Axios
import BASE_URL from '../../../shared/utils/baseUrl';
import { Snackbar, Alert } from '@mui/material';

function ComplaintForm() {
    const [formData, setFormData] = useState({
        typeOfIssue: '',
        issue: '',
        notes: '',
        priority:'',
        phone_number:''
    });
    const [typesOfIssue, setTypesOfIssue] = useState([]);
    const [issues, setIssues] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);  // For opening snackbar
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

    useEffect(() => {
        axios.get(`${BASE_URL}/api/types-of-issue/`)
            .then((response) => setTypesOfIssue(response.data))
            .catch(() => setTypesOfIssue([]));
    }, []);

    const handleTypeOfIssueChange = (e) => {
        const typeOfIssueId = e.target.value;
        setFormData({ ...formData, typeOfIssue: typeOfIssueId, issue: '' });

        axios.get(`${BASE_URL}/api/issues/${typeOfIssueId}/`)
            .then((response) => setIssues(response.data))
            .catch(() => setIssues([]));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            staff_id: localStorage.getItem('staff_id'),
            issue_complaint: formData.issue,
            notes: formData.notes,
            type_of_issue: formData.typeOfIssue,
            priority: formData.priority,
            phone_number:formData.phone_number
        };

        try {
            const token = localStorage.getItem("access_token");

            const response = await axios.post(
                `${BASE_URL}/api/complaints/submit/`,   // also fixed URL
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                setSnackbarSeverity('success');
                setSnackbarMessage('Complaint submitted successfully!');
                setOpenSnackbar(true); // Show snackbar on success
                setFormData({ typeOfIssue: '', issue: '', notes: '' });
            } else {
                setSnackbarSeverity('error');
                setSnackbarMessage('Failed to submit the Complaint.');
                setOpenSnackbar(true); // Show snackbar on error
            }
        } catch (error) {
            console.error('Error submitting the Complaint:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage('An error occurred while submitting the complaint.');
            setOpenSnackbar(true); // Show snackbar on error
        }
    };
    // Handle Snackbar close
    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };


    return (
        <Box
            sx={{ padding: 2, maxWidth: 400, margin: 'auto', height: '100%' }}

        >
            {/* Snackbar for success/error messages */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000} // Auto close after 3 seconds
                onClose={handleSnackbarClose}
                anchorOrigin={{
                    vertical: 'top', // Position at the top
                    horizontal: 'center', // Position in the center horizontally
                }}
                sx={{
                    top: '3rem',
                }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Typography align="center" variant="subtitle2" className='fw-semibold text-muted mb-5' gutterBottom>
                Complaints
            </Typography>


            <Select
                value={formData.typeOfIssue}
                onChange={handleTypeOfIssueChange}
                fullWidth
                displayEmpty
                sx={{ marginBottom: 2 }}
            >
                <MenuItem value="" disabled hidden>Select Type of Complaint</MenuItem>
                {typesOfIssue.map((type) => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
            </Select>

            <Select
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                fullWidth
                displayEmpty
                disabled={!formData.typeOfIssue}
                sx={{ marginBottom: 2 }}
            >
                <MenuItem value="" disabled hidden>Select Complaint</MenuItem>
                {issues.map((issue) => (
                    <MenuItem key={issue.id} value={issue.id}>{issue.name}</MenuItem>
                ))}
            </Select>
<Select
  value={formData.priority || ""}
  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
  fullWidth
  displayEmpty
  sx={{ marginBottom: 2 }}
>
  <MenuItem value="" disabled>Select Priority</MenuItem>
  <MenuItem value="Low">Low</MenuItem>
  <MenuItem value="Medium">Medium</MenuItem>
  <MenuItem value="High">High</MenuItem>
</Select>
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

            <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
                Submit
            </Button>
        </Box>
    );
}

export default ComplaintForm;
