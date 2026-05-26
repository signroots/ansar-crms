import { useEffect, useState } from "react";

import AssignmentLate from "@mui/icons-material/AssignmentLate";
import Category from "@mui/icons-material/Category";
import LocationOn from "@mui/icons-material/LocationOn";
import Notes from "@mui/icons-material/Notes";
import PriorityHigh from "@mui/icons-material/PriorityHigh";
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
import { useNavigate } from "react-router-dom";

import ROUTE_PATHS from "../../../app/router/paths";
import { apiService } from "../../../services/api/Api.service";
import { extractApiFieldErrors, getFirstApiErrorMessage } from "../../../shared/utils/formErrors";

const apiFieldMap = {
  issue_complaint: "issue",
  sub_location: "subLocation",
  type_of_issue: "typeOfIssue",
};

const normalizeLabel = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

function ComplaintForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    typeOfIssue: "",
    typeOfIssueName: "",
    issue: "",
    priority: "",
    location: "",
    subLocation: "",
    notes: "",
  });
  const [typesOfIssue, setTypesOfIssue] = useState([]);
  const [issues, setIssues] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [subLocationsLoading, setSubLocationsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMaintenance = ["maintenance", "maintanance"].includes(
    normalizeLabel(formData.typeOfIssueName),
  );
  const selectedIssue = issues.find((issue) => String(issue.id) === String(formData.issue));
  const isOtherIssue = normalizeLabel(selectedIssue?.name) === "others";
  const isNotesRequired = isMaintenance && isOtherIssue;
  const isSubLocationEnabled = Boolean(formData.location) && subLocations.length > 0;

  const normalizeApiList = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  };

  useEffect(() => {
    apiService
      .get("/api/api/types-of-issue/")
      .then((data) => setTypesOfIssue(normalizeApiList(data)))
      .catch(() => setTypesOfIssue([]));

    apiService
      .get("/api/api/institutions/")
      .then((data) => setLocations(normalizeApiList(data)))
      .catch(() => setLocations([]));
  }, []);

  const handleTypeOfIssueChange = (event) => {
    const typeOfIssueId = event.target.value;
    const selectedType = typesOfIssue.find((type) => type.id === typeOfIssueId);

    setFormData({
      ...formData,
      typeOfIssue: typeOfIssueId,
      typeOfIssueName: selectedType?.name || "",
      issue: "",
      priority: "",
      location: "",
      subLocation: "",
    });
    setFieldErrors({});
    setSubLocations([]);

    apiService
      .get(`/api/api/issues/${typeOfIssueId}/`)
      .then((data) => setIssues(normalizeApiList(data)))
      .catch(() => setIssues([]));
  };

  const handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setFieldErrors((currentErrors) => ({ ...currentErrors, [event.target.name]: "" }));
  };

  const handleLocationChange = (event) => {
    const locationId = event.target.value;

    setFormData({ ...formData, location: locationId, subLocation: "" });
    setFieldErrors((currentErrors) => ({ ...currentErrors, location: "", subLocation: "" }));
    setSubLocations([]);
    setSubLocationsLoading(true);

    apiService
      .get(`/api/api/sublocation/${locationId}/`)
      .then((data) => setSubLocations(normalizeApiList(data)))
      .catch(() => setSubLocations([]))
      .finally(() => setSubLocationsLoading(false));
  };

  const handleSubLocationChange = (event) => {
    setFormData({ ...formData, subLocation: event.target.value });
    setFieldErrors((currentErrors) => ({ ...currentErrors, subLocation: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextFieldErrors = {};

    if (isMaintenance) {
      if (!formData.priority) {
        nextFieldErrors.priority = "Required";
      }

      if (!formData.location) {
        nextFieldErrors.location = "Required";
      }

      if (isSubLocationEnabled && !formData.subLocation) {
        nextFieldErrors.subLocation = "Required";
      }

      if (isNotesRequired && !formData.notes.trim()) {
        nextFieldErrors.notes = "Required";
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    const payload = {
      staff_id: localStorage.getItem("staff_id"),
      issue_complaint: formData.issue,
      notes: formData.notes,
      type_of_issue: formData.typeOfIssue,
    };

    if (isMaintenance) {
      payload.priority = formData.priority;
      payload.location = formData.location;

      if (isSubLocationEnabled) {
        payload.sub_location = formData.subLocation;
      }
    }

    setIsSubmitting(true);

    try {
      await apiService.post("/api/api/complaints/submit/", payload);

      setSnackbarSeverity("success");
      setSnackbarMessage("Complaint submitted successfully!");
      setOpenSnackbar(true);
      setFormData({
        typeOfIssue: "",
        typeOfIssueName: "",
        issue: "",
        priority: "",
        location: "",
        subLocation: "",
        notes: "",
      });
      setFieldErrors({});
      setSubLocations([]);
      navigate(ROUTE_PATHS.staffTeacher.home, { replace: true });
    } catch (error) {
      console.error("Error submitting the Complaint:", error);
      const apiErrors = extractApiFieldErrors(error, apiFieldMap);

      setFieldErrors((currentErrors) => ({ ...currentErrors, ...apiErrors }));
      setSnackbarSeverity("error");
      setSnackbarMessage(
        getFirstApiErrorMessage(apiErrors, "An error occurred while submitting the complaint."),
      );
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
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0f766e",
      borderWidth: 2,
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      py: 1.25,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#14b8a6",
    },
  };

  const textFieldSx = {
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#0f766e",
    },
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      bgcolor: "#ffffff",
      "&.Mui-focused fieldset": {
        borderColor: "#0f766e",
        borderWidth: 2,
      },
      "&:hover fieldset": {
        borderColor: "#14b8a6",
      },
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
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}
                >
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

              {isMaintenance && (
                <>
                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                      <LocationOn sx={{ color: "#64748b", fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                        Location
                      </Typography>
                    </Stack>
                    <Select
                      value={formData.location}
                      onChange={handleLocationChange}
                      fullWidth
                      displayEmpty
                      error={Boolean(fieldErrors.location)}
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled hidden>
                        Select Location
                      </MenuItem>
                      {locations.map((location) => (
                        <MenuItem key={location.id} value={location.id}>
                          {location.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.location && (
                      <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 700 }}>
                        {fieldErrors.location}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}
                    >
                      Sub Location
                    </Typography>
                    <Select
                      value={formData.subLocation}
                      onChange={handleSubLocationChange}
                      fullWidth
                      displayEmpty
                      disabled={!formData.location || subLocationsLoading || !isSubLocationEnabled}
                      error={Boolean(fieldErrors.subLocation)}
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled hidden>
                        Select Sub Location
                      </MenuItem>
                      {subLocationsLoading && (
                        <MenuItem value="" disabled>
                          Loading sub locations...
                        </MenuItem>
                      )}
                      {formData.location && !subLocationsLoading && subLocations.length === 0 && (
                        <MenuItem value="" disabled>
                          No sub locations found
                        </MenuItem>
                      )}
                      {subLocations.map((subLocation) => (
                        <MenuItem key={subLocation.id} value={subLocation.id}>
                          {subLocation.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {fieldErrors.subLocation && (
                      <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 700 }}>
                        {fieldErrors.subLocation}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                      <PriorityHigh sx={{ color: "#64748b", fontSize: 18 }} />
                      <Typography variant="subtitle2" sx={{ color: "#0f172a", fontWeight: 700 }}>
                        Priority
                      </Typography>
                    </Stack>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      fullWidth
                      displayEmpty
                      error={Boolean(fieldErrors.priority)}
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled hidden>
                        Select Priority
                      </MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                    </Select>
                    {fieldErrors.priority && (
                      <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 700 }}>
                        {fieldErrors.priority}
                      </Typography>
                    )}
                  </Box>
                </>
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
                  placeholder={
                    isNotesRequired
                      ? "Describe the other maintenance complaint"
                      : "Add extra details if needed"
                  }
                  multiline
                  fullWidth
                  rows={3}
                  sx={textFieldSx}
                />
                {fieldErrors.notes && (
                  <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 700 }}>
                    {fieldErrors.notes}
                  </Typography>
                )}
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
