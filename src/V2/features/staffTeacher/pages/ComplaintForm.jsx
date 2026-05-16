import { useEffect, useState } from "react";

import AssignmentLate from "@mui/icons-material/AssignmentLate";
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

function ComplaintForm() {
  const [formData, setFormData] = useState({
    typeOfIssue: "",
    issue: "",
    notes: "",
  });
  const [typesOfIssue, setTypesOfIssue] = useState([]);
  const [issues, setIssues] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/types-of-issue/`)
      .then((response) => setTypesOfIssue(response.data))
      .catch(() => setTypesOfIssue([]));
  }, []);

  const handleTypeOfIssueChange = (event) => {
    const typeOfIssueId = event.target.value;
    setFormData({ ...formData, typeOfIssue: typeOfIssueId, issue: "" });

    axios
      .get(`${BASE_URL}/api/issues/${typeOfIssueId}/`)
      .then((response) => setIssues(response.data))
      .catch(() => setIssues([]));
  };

  const handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      staff_id: localStorage.getItem("staff_id"),
      issue_complaint: formData.issue,
      notes: formData.notes,
      type_of_issue: formData.typeOfIssue,
    };

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post(`${BASE_URL}/api/complaints/submit/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setSnackbarSeverity("success");
        setSnackbarMessage("Complaint submitted successfully!");
        setOpenSnackbar(true);
        setFormData({
          typeOfIssue: "",
          issue: "",
          notes: "",
        });
      } else {
        setSnackbarSeverity("error");
        setSnackbarMessage("Failed to submit the Complaint.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error submitting the Complaint:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("An error occurred while submitting the complaint.");
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
            <Avatar sx={{ width: 44, height: 44, bgcolor: "#fef2f2", color: "#b91c1c" }}>
              <AssignmentLate />
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
                Create Complaint
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={1.25}>
              <Box>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                  <Category sx={{ color: "#64748b", fontSize: 18 }} />
                  <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                    Complaint type
                  </Typography>
                </Stack>
                <Select
                  value={formData.typeOfIssue}
                  onChange={handleTypeOfIssueChange}
                  fullWidth
                  displayEmpty
                  sx={selectSx}
                >
                  <MenuItem value="" disabled hidden>
                    Select Type of Complaint
                  </MenuItem>
                  {typesOfIssue.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}>
                  Complaint
                </Typography>
                <Select
                  value={formData.issue}
                  onChange={(event) => setFormData({ ...formData, issue: event.target.value })}
                  fullWidth
                  displayEmpty
                  disabled={!formData.typeOfIssue}
                  sx={selectSx}
                >
                  <MenuItem value="" disabled hidden>
                    Select Complaint
                  </MenuItem>
                  {issues.map((issue) => (
                    <MenuItem key={issue.id} value={issue.id}>
                      {issue.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

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
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default ComplaintForm;
