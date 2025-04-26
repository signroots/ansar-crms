import React, { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Button, Typography, Box } from '@mui/material';
import axios from 'axios'; // Import Axios
import BASE_URL from '../../utils/baseUrl';
import { toast } from "react-toastify";
import { Snackbar, Alert } from '@mui/material';

function RequestForm()
{
  const [formData, setFormData] = useState({
    typeOfRequest: '',
    allRequest: '',
    notes: '',
    program_name: '',
    program_date: '',
    program_time: '',

  });
  const [typesOfRequest, setTypesOfRequest] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);  // For opening snackbar
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

  useEffect(() =>
  {
    axios.get(`${ BASE_URL }/api/types-of-request/`)
      .then((response) => setTypesOfRequest(response.data))
      .catch(() => setTypesOfRequest([]));
  }, []);

  const handleTypeOfRequestChange = (e) =>
  {
    const typeOfRequestId = e.target.value;
    setFormData({ ...formData, typeOfRequest: typeOfRequestId, allRequest: '' });

    axios.get(`${ BASE_URL }/api/allrequests/${ typeOfRequestId }/`)
      .then((response) => setAllRequests(response.data))
      .catch(() => setAllRequests([]));
  };

  const handleInputChange = (e) =>
  {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) =>
  {
    e.preventDefault();

    const payload = {
      staff_id: localStorage.getItem('staff_id'),
      issue_request: formData.allRequest,
      notes: formData.notes,
      type_of_request: formData.typeOfRequest,
      program_name: formData.program_name,
      program_date: formData.program_date,
      program_time: formData.program_time,
    };

    try
    {
      const response = await axios.post(`${ BASE_URL }/api/requests/submit/`, payload);

      if (response.status === 201)
      {
        setSnackbarSeverity('success');
        setSnackbarMessage('Request submitted successfully!');
        setOpenSnackbar(true); // Show snackbar on success
        setFormData({ typeOfRequest: '', allRequest: '', notes: '' });
      } else
      {
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to submit the request.');
        setOpenSnackbar(true); // Show snackbar on error
      }
    } catch (error)
    {
      console.error('Error submitting the request:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('An error occurred while submitting the request.');
      setOpenSnackbar(true); // Show snackbar on error
    }
  };

  // Handle Snackbar close
  const handleSnackbarClose = () =>
  {
    setOpenSnackbar(false);
  };



  return (
    <Box sx={{ padding: 2, maxWidth: 400, margin: 'auto' }}>

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
        Requests
      </Typography>

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

      <Select
        value={formData.allRequest}
        onChange={(e) => setFormData({ ...formData, allRequest: e.target.value })}
        fullWidth
        displayEmpty
        disabled={!formData.typeOfRequest}
        sx={{ marginBottom: 2 }}
      >
        <MenuItem value="" disabled hidden>Select Request</MenuItem>
        {allRequests.map((request) => (
          <MenuItem key={request.id} value={request.id}>{request.name}</MenuItem>
        ))}
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

export default RequestForm;
