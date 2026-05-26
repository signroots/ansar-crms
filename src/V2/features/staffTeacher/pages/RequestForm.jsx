import { useEffect, useMemo, useState } from "react";

import Article from "@mui/icons-material/Article";
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

  if (Array.isArray(data?.requests)) {
    return data.requests;
  }

  if (Array.isArray(data?.all_requests)) {
    return data.all_requests;
  }

  return [];
};

const normalizeLabel = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isMaintenanceLabel = (value) =>
  ["maintenance", "maintanance"].includes(normalizeLabel(value));

const findById = (items, value) => items.find((item) => String(item.id) === String(value));

const apiFieldMap = {
  issue_request: "allRequest",
  sub_location: "subLocation",
  type_of_request: "typeOfRequest",
};

function RequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    typeOfRequest: "",
    allRequest: "",
    location: "",
    notes: "",
    priority: "Medium",
    program_name: "",
    program_date: "",
    program_time: "",
    subLocation: "",
  });
  const [typesOfRequest, setTypesOfRequest] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [subLocationsLoading, setSubLocationsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRequestType = useMemo(
    () => findById(typesOfRequest, formData.typeOfRequest),
    [formData.typeOfRequest, typesOfRequest],
  );
  const selectedRequest = useMemo(
    () => findById(allRequests, formData.allRequest),
    [allRequests, formData.allRequest],
  );
  const isMaintenance = isMaintenanceLabel(selectedRequestType?.name);
  const selectedRequestKey = normalizeLabel(selectedRequest?.name);
  const isOtherRequest = selectedRequestKey === "others";
  const isNotesRequired = isMaintenance && isOtherRequest;
  const isStageProgram =
    selectedRequestKey.includes("stage") && selectedRequestKey.includes("program");
  const isSubLocationEnabled = Boolean(formData.location) && subLocations.length > 0;

  useEffect(() => {
    apiService
      .get("/api/api/types-of-request/")
      .then((data) => setTypesOfRequest(normalizeApiList(data)))
      .catch(() => setTypesOfRequest([]));

    apiService
      .get("/api/api/institutions/")
      .then((data) => setLocations(normalizeApiList(data)))
      .catch(() => setLocations([]));
  }, []);

  const handleTypeOfRequestChange = (event) => {
    const typeOfRequestId = event.target.value;

    setFormData({
      ...formData,
      typeOfRequest: typeOfRequestId,
      allRequest: "",
      location: "",
      program_name: "",
      program_date: "",
      program_time: "",
      subLocation: "",
    });
    setFieldErrors({});
    setSubLocations([]);

    apiService
      .get(`/api/api/allrequests/${typeOfRequestId}/`)
      .then((data) => setAllRequests(normalizeApiList(data)))
      .catch(() => setAllRequests([]));
  };

  const handleInputChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setFieldErrors((currentErrors) => ({ ...currentErrors, [event.target.name]: "" }));
  };

  const handleRequestChange = (event) => {
    setFormData({
      ...formData,
      allRequest: event.target.value,
      program_name: "",
      program_date: "",
      program_time: "",
    });
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      allRequest: "",
      notes: "",
      program_date: "",
      program_name: "",
      program_time: "",
    }));
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextFieldErrors = {};

    if (!formData.typeOfRequest) {
      nextFieldErrors.typeOfRequest = "Required";
    }

    if (!formData.allRequest) {
      nextFieldErrors.allRequest = "Required";
    }

    if (isMaintenance) {
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

    if (isStageProgram) {
      if (!formData.program_name) {
        nextFieldErrors.program_name = "Required";
      }

      if (!formData.program_date) {
        nextFieldErrors.program_date = "Required";
      }

      if (!formData.program_time) {
        nextFieldErrors.program_time = "Required";
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    const payload = {
      staff_id: localStorage.getItem("staff_id"),
      issue_request: formData.allRequest,
      notes: formData.notes,
      type_of_request: formData.typeOfRequest,
    };

    if (isMaintenance) {
      payload.location = formData.location;
      payload.priority = formData.priority;

      if (isSubLocationEnabled) {
        payload.sub_location = formData.subLocation;
      }
    }

    if (isStageProgram) {
      payload.program_name = formData.program_name;
      payload.program_date = formData.program_date;
      payload.program_time = formData.program_time;
    }

    setIsSubmitting(true);

    try {
      await apiService.post("/api/api/requests/submit/", payload);

      setSnackbarSeverity("success");
      setSnackbarMessage("Request submitted successfully!");
      setOpenSnackbar(true);
      setFormData({
        typeOfRequest: "",
        allRequest: "",
        location: "",
        notes: "",
        priority: "Medium",
        program_name: "",
        program_date: "",
        program_time: "",
        subLocation: "",
      });
      setFieldErrors({});
      setSubLocations([]);
      navigate(ROUTE_PATHS.staffTeacher.home, { replace: true });
    } catch (error) {
      console.error("Error submitting the request:", error);
      const apiErrors = extractApiFieldErrors(error, apiFieldMap);

      setFieldErrors((currentErrors) => ({ ...currentErrors, ...apiErrors }));
      setSnackbarSeverity("error");
      setSnackbarMessage(
        getFirstApiErrorMessage(apiErrors, "An error occurred while submitting the request."),
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
                  error={Boolean(fieldErrors.typeOfRequest)}
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
                {fieldErrors.typeOfRequest && (
                  <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 700 }}>
                    {fieldErrors.typeOfRequest}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#0f172a", fontWeight: 700, mb: 0.75 }}
                >
                  Request
                </Typography>
                <Select
                  value={formData.allRequest}
                  onChange={handleRequestChange}
                  fullWidth
                  displayEmpty
                  disabled={!formData.typeOfRequest}
                  error={Boolean(fieldErrors.allRequest)}
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
                {fieldErrors.allRequest && (
                  <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 700 }}>
                    {fieldErrors.allRequest}
                  </Typography>
                )}
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
                      name="location"
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
                      name="subLocation"
                      value={formData.subLocation}
                      onChange={handleInputChange}
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
                      sx={selectSx}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                    </Select>
                  </Box>
                </>
              )}

              {isStageProgram && (
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
                    error={Boolean(fieldErrors.program_name)}
                    helperText={fieldErrors.program_name}
                    sx={{ ...textFieldSx, gridColumn: "1 / -1" }}
                  />
                  <TextField
                    name="program_date"
                    label="Program Date"
                    type="date"
                    value={formData.program_date}
                    onChange={handleInputChange}
                    fullWidth
                    error={Boolean(fieldErrors.program_date)}
                    helperText={fieldErrors.program_date}
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
                    error={Boolean(fieldErrors.program_time)}
                    helperText={fieldErrors.program_time}
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
                  placeholder={
                    isNotesRequired
                      ? "Describe the other maintenance request"
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
