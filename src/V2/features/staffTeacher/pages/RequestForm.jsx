import { useEffect, useState } from "react";

import Article from "@mui/icons-material/Article";
import Category from "@mui/icons-material/Category";
import Notes from "@mui/icons-material/Notes";
import Schedule from "@mui/icons-material/Schedule";
import Send from "@mui/icons-material/Send";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

import BASE_URL from "../../../shared/utils/baseUrl";

function RequestForm() {
  const [formData, setFormData] = useState({
    typeOfRequest: "",
    allRequest: "",
    notes: "",
    program_name: "",
    program_date: "",
    program_time: "",
  });
  const [typesOfRequest, setTypesOfRequest] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/types-of-request/`)
      .then((response) => setTypesOfRequest(response.data))
      .catch(() => setTypesOfRequest([]));
  }, []);

  const handleTypeOfRequestChange = (event) => {
    const typeOfRequestId = event.target.value;
    setFormData({ ...formData, typeOfRequest: typeOfRequestId, allRequest: "" });

    axios
      .get(`${BASE_URL}/api/allrequests/${typeOfRequestId}/`)
      .then((response) => setAllRequests(response.data))
      .catch(() => setAllRequests([]));
  };

  const handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      staff_id: localStorage.getItem("staff_id"),
      issue_request: formData.allRequest,
      notes: formData.notes,
      type_of_request: formData.typeOfRequest,
      program_name: formData.program_name,
      program_date: formData.program_date,
      program_time: formData.program_time,
    };

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/requests/submit/`, payload);

      if (response.status === 201) {
        setSnackbarSeverity("success");
        setSnackbarMessage("Request submitted successfully!");
        setOpenSnackbar(true);
        setFormData({
          typeOfRequest: "",
          allRequest: "",
          notes: "",
          program_name: "",
          program_date: "",
          program_time: "",
        });
      } else {
        setSnackbarSeverity("error");
        setSnackbarMessage("Failed to submit the request.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error submitting the request:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("An error occurred while submitting the request.");
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const selectSx = {
    minHeight: 48,
    borderRadius: 2,
    bgcolor: "#ffffff",
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      py: 1.25,
    },
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "#ffffff",
    },
  };

  return (
    <Box sx={{ maxWidth: 640, mx: "auto" }}>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: "4.5rem" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 14px 36px rgba(15, 118, 110, 0.08)",
        }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: "#ecfeff", color: "#0f766e" }}>
              <Article />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                New submission
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#0f172a",
                  fontSize: { xs: 18, sm: 20 },
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Create Request
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={1.25}>
              <Box>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                  <Category sx={{ color: "#64748b", fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                    Request type
                  </Typography>
                </Stack>
                <Select
                  value={formData.typeOfRequest}
                  onChange={handleTypeOfRequestChange}
                  fullWidth
                  displayEmpty
                  sx={selectSx}
                >
                  <MenuItem value="" disabled hidden>
                    Select Type of Request
                  </MenuItem>
                  {typesOfRequest.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}>
                  Request
                </Typography>
                <Select
                  value={formData.allRequest}
                  onChange={(event) => setFormData({ ...formData, allRequest: event.target.value })}
                  fullWidth
                  displayEmpty
                  disabled={!formData.typeOfRequest}
                  sx={selectSx}
                >
                  <MenuItem value="" disabled hidden>
                    Select Request
                  </MenuItem>
                  {allRequests.map((request) => (
                    <MenuItem key={request.id} value={request.id}>
                      {request.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {formData.allRequest === 3 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.25,
                  }}
                >
                  <TextField
                    name="program_name"
                    label="Program Name"
                    value={formData.program_name}
                    onChange={handleInputChange}
                    fullWidth
                    sx={{ ...textFieldSx, gridColumn: "1 / -1" }}
                  />
                  <TextField
                    name="program_date"
                    label="Program Date"
                    type="date"
                    value={formData.program_date}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldSx}
                  />
                  <TextField
                    name="program_time"
                    label="Program Time"
                    type="time"
                    value={formData.program_time}
                    onChange={handleInputChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={textFieldSx}
                  />
                </Box>
              )}

              <Box>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                  <Notes sx={{ color: "#64748b", fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                    Notes
                  </Typography>
                </Stack>
                <TextField
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add extra details if needed"
                  multiline
                  fullWidth
                  rows={3}
                  sx={textFieldSx}
                />
              </Box>

              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={isSubmitting}
                startIcon={isSubmitting ? <Schedule /> : <Send />}
                sx={{
                  minHeight: 48,
                  borderRadius: 2,
                  bgcolor: "#0f766e",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#115e59",
                    boxShadow: "0 10px 24px rgba(15, 118, 110, 0.18)",
                  },
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default RequestForm;
