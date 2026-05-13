import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
  Box,
  Modal,
  ThemeProvider,
  createTheme,
  FormControl,
  InputLabel,
  Grid,
  FormHelperText,
} from "@mui/material";

import axios from "axios";
import { toast } from "react-toastify";
import BASE_URL from "../../../utils/baseUrl";
import CloseIcon from "@mui/icons-material/Close";

// ================= API =================
const getAccessToken = () => localStorage.getItem("access_token");

const apiRequest = async (method, url, data = null) => {
  const token = getAccessToken();

  return axios({
    method,
    url: `${BASE_URL}${url}`,
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ================= COMPONENT =================
function CreateRequests({ fetchRequests }) {

  const [formData, setFormData] = useState({
    typeOfRequest: "",
    allRequest: "",
    notes: "",
    staffId: "",
    program_name: "",
    program_date: "",
    program_time: "",
    phoneNumber: "",
    priority: "",
    category: "",
    location: "",
    subLocation: "",
  });

  const [typesOfRequest, setTypesOfRequest] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [staffIds, setStaffIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState({});
const [userRole, setUserRole] = useState("");
const [requestTypeName, setRequestTypeName] = useState("");
  const todayDate = new Date().toISOString().split("T")[0];

  // ================= THEME =================
  const theme = createTheme({
    palette: {
      primary: { main: "#877bdc" },
    },
  });

  // ================= CONDITIONS =================
  const selectedCategoryName =
    allRequests.find((r) => r.id === formData.allRequest)?.name;

const isMaintenance =
  requestTypeName === "Maintenance" ||
  typesOfRequest.find(
    (t) => t.id == formData.typeOfRequest
  )?.name === "Maintenance";

  const isStageProgram =
    selectedCategoryName === "Stage Programs";

  // ================= RESET =================
  const resetForm = () => {
    setFormData({
      typeOfRequest: "",
      allRequest: "",
      notes: "",
      staffId: "",
      program_name: "",
      program_date: "",
      program_time: "",
      phoneNumber: "",
      priority: "",
      category: "",
      location: "",
      subLocation: "",
    });

    setErrors({});
    setSubLocations([]);
  };

  // ================= HANDLE CHANGE =================
  const handleChange = async (e) => {

    const { name, value } = e.target;

    // ✅ STAFF
    if (name === "staffId") {

      const selectedStaff =
        staffIds.find((s) => s.id === value);

      setFormData({
        ...formData,
        staffId: value,
        phoneNumber: selectedStaff?.phone || "",
      });
    }

    // ✅ LOCATION
    else if (name === "location") {

      setFormData({
        ...formData,
        location: value,
        subLocation: "",
      });

      try {

        const res = await apiRequest(
          "GET",
          `/api/sublocation/${value}/`
        );

        setSubLocations(res.data || []);

      } catch (error) {

        console.log(error);
        setSubLocations([]);
      }
    }

    // ✅ DEFAULT
    else {

      setFormData({
        ...formData,
        [name]: value,
      });
    }

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  // ================= TYPE CHANGE =================
  const handleTypeOfRequestChange = async (e) => {

    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      typeOfRequest: value,
      allRequest: "",
    }));

    try {

      const res = await apiRequest(
        "GET",
        `/api/allrequests/${value}/`
      );

      setAllRequests(res.data || []);

    } catch (error) {

      console.log(error);
      setAllRequests([]);
    }
  };

  // ================= FETCH STAFF =================
  useEffect(() => {

    apiRequest(
      "GET",
      "/api/check-staff-id/?data=DepartmentHead"
    )
      .then((res) =>
        setStaffIds(res.data.staff_ids || [])
      )
      .catch(() => setStaffIds([]));

  }, []);
useEffect(() => {
  const role =
    localStorage.getItem("user_role") ||
    localStorage.getItem("role");

  setUserRole(role);
}, []);
useEffect(() => {

  const storedTypeId =
    localStorage.getItem("type_of_issue_id");

  const storedTypeName =
    localStorage.getItem("type_of_issue");

  if (userRole === "Tech Support" && storedTypeId) {

    setFormData((prev) => ({
      ...prev,
      typeOfRequest: storedTypeId,
    }));

    setRequestTypeName(storedTypeName);
  }

}, [userRole]);
useEffect(() => {

  if (!formData.typeOfRequest) return;

  const fetchCategories = async () => {

    try {

      const res = await apiRequest(
        "GET",
        `/api/allrequests/${formData.typeOfRequest}/`
      );

      setAllRequests(res.data || []);

    } catch (error) {

      console.log(error);
      setAllRequests([]);
    }
  };

  fetchCategories();

}, [formData.typeOfRequest]);
  // ================= FETCH INSTITUTIONS =================
  useEffect(() => {

    apiRequest("GET", "/api/institutions/")
      .then((res) => {

        console.log("Institution API:", res.data);

        // ✅ pagination API
        if (res.data.results) {
          setInstitutions(res.data.results);
        }

        // ✅ normal array API
        else {
          setInstitutions(res.data || []);
        }
      })
      .catch((error) => {

        console.log(error);
        setInstitutions([]);
      });

  }, []);

  // ================= FETCH TYPES =================
  useEffect(() => {

    apiRequest("GET", "/api/types-of-request/")
      .then((res) =>
        setTypesOfRequest(res.data || [])
      )
      .catch(() => setTypesOfRequest([]));

  }, []);

  // ================= VALIDATION =================
  const validateForm = () => {

    let err = {};

    if (!formData.staffId)
      err.staffId = "Staff ID is required";

    if (
  userRole !== "Tech Support" &&
  !formData.typeOfRequest
) {
  err.typeOfRequest = "Required";
}

    if (!formData.allRequest)
      err.allRequest = "Required";

    if (!formData.phoneNumber)
      err.phoneNumber = "Required";

    if (!formData.priority)
      err.priority = "Required";

    if (isMaintenance) {

      if (!formData.location)
        err.location = "Required";

      if (!formData.subLocation)
        err.subLocation = "Required";
    }

    if (isStageProgram) {

      if (!formData.program_name)
        err.program_name = "Required";

      if (!formData.program_date)
        err.program_date = "Required";

      if (!formData.program_time)
        err.program_time = "Required";
    }

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {

  console.log("SUBMIT CLICKED");

  const isValid = validateForm();

  console.log("FORM VALID:", isValid);
  console.log("FORM DATA:", formData);

  if (!isValid) {
    console.log("VALIDATION FAILED");
    return;
  }

  try {

    const payload = {
      staff_id: formData.staffId,
      issue_request: formData.allRequest,
      notes: formData.notes,
      type_of_request: formData.typeOfRequest,
      created_by: "Admin",
      program_name: formData.program_name,
      program_date: formData.program_date,
      program_time: formData.program_time,
      priority: formData.priority,
      phone_number: formData.phoneNumber,
      category: formData.category,
      location: formData.location,
      sub_location: formData.subLocation,
    };

    console.log("PAYLOAD:", payload);

    const res = await apiRequest(
      "POST",
      "/api/requests/submit/",
      payload
    );

    console.log("API RESPONSE:", res);

    if (res.status === 201 || res.status === 200) {

      toast.success("Request submitted successfully");

      if (fetchRequests) {
        fetchRequests();
      }

      resetForm();
      setOpenModal(false);
    }

  } catch (error) {

    console.log("API ERROR:", error);

    if (error.response) {
      console.log("ERROR DATA:", error.response.data);
      console.log("ERROR STATUS:", error.response.status);
    }

    toast.error("Submission failed");
  }
};
  // ================= UI =================
  return (
    <ThemeProvider theme={theme}>

      {/* BUTTON */}
      <Button
        variant="contained"
        onClick={() => {
          resetForm();
          setOpenModal(true);
        }}
        sx={{
          background:
            "linear-gradient(90deg, #3f6ad8, #5a8dee)",
          color: "#fff",
          fontWeight: 600,
          padding: "8px 18px",
          borderRadius: "6px",
          textTransform: "none",
          boxShadow:
            "0 2px 6px rgba(0,0,0,0.15)",
          "&:hover": {
            background:
              "linear-gradient(90deg, #355ec9, #4a7de0)",
          },
        }}
      >
        CREATE REQUEST
      </Button>

      {/* MODAL */}
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }}
      >

        <Box
          sx={{
            width: 650,
            bgcolor: "#fff",
            p: 4,
            mx: "auto",
            mt: "5%",
            borderRadius: 3,
            boxShadow: 24,
            position: "relative",
          }}
        >

          <CloseIcon
            onClick={() => {
              setOpenModal(false);
              resetForm();
            }}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              cursor: "pointer",
            }}
          />

          <Typography
            variant="h6"
            mb={3}
            fontWeight="bold"
          >
            Create Request
          </Typography>

          <Grid container spacing={2}>

            {/* STAFF */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={!!errors.staffId}
              >
                <InputLabel>Staff ID</InputLabel>

                <Select
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                >
                  {staffIds.map((s) => (
                    <MenuItem
                      key={s.id}
                      value={s.id}
                    >
                      {s.id}
                    </MenuItem>
                  ))}
                </Select>

                <FormHelperText>
                  {errors.staffId}
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* TYPE */}
                       {!(userRole === "Tech Support") && (
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={!!errors.typeOfRequest}
              >
                <InputLabel>
                  Type of Request
                </InputLabel>

                <Select
                  name="typeOfRequest"
                  value={formData.typeOfRequest}
                  onChange={handleTypeOfRequestChange}
                >
                  {typesOfRequest.map((t) => (
                    <MenuItem
                      key={t.id}
                      value={t.id}
                    >
                      {t.name}
                    </MenuItem>
                  ))}
                </Select>

                <FormHelperText>
                  {errors.typeOfRequest}
                </FormHelperText>
              </FormControl>
            </Grid>
)}
            {/* CATEGORY */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={!!errors.allRequest}
              >
                <InputLabel>
                  Category
                </InputLabel>

                <Select
                  name="allRequest"
                  value={formData.allRequest}
                  onChange={handleChange}
                >
                  {allRequests.map((r) => (
                    <MenuItem
                      key={r.id}
                      value={r.id}
                    >
                      {r.name}
                    </MenuItem>
                  ))}
                </Select>

                <FormHelperText>
                  {errors.allRequest}
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* PRIORITY */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={!!errors.priority}
              >
                <InputLabel>Priority</InputLabel>

                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <MenuItem value="Low">
                    Low
                  </MenuItem>

                  <MenuItem value="Medium">
                    Medium
                  </MenuItem>

                  <MenuItem value="Emergency">
                    Emergency
                  </MenuItem>
                </Select>

                <FormHelperText>
                  {errors.priority}
                </FormHelperText>
              </FormControl>
            </Grid>

            {/* PHONE */}
            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                fullWidth
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
              />
            </Grid>

            {/* MAINTENANCE */}
            {isMaintenance && (
              <>
                <Grid item xs={6}>
                  <FormControl
                    fullWidth
                    error={!!errors.location}
                  >
                    <InputLabel>
                      Location
                    </InputLabel>

                    <Select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    >
                      {institutions.map((inst) => (
                        <MenuItem
                          key={inst.id}
                          value={inst.id}
                        >
                          {inst.name}
                        </MenuItem>
                      ))}
                    </Select>

                    <FormHelperText>
                      {errors.location}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl
                    fullWidth
                    error={!!errors.subLocation}
                  >
                    <InputLabel>
                      Sub Location
                    </InputLabel>

                    <Select
                      name="subLocation"
                      value={formData.subLocation}
                      onChange={handleChange}
                    >
                      {subLocations.map((sub) => (
                        <MenuItem
                          key={sub.id}
                          value={sub.id}
                        >
                          {sub.name}
                        </MenuItem>
                      ))}
                    </Select>

                    <FormHelperText>
                      {errors.subLocation}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* STAGE PROGRAM */}
            {isStageProgram && (
              <>
                <Grid item xs={12}>
                  <TextField
                    label="Program Name"
                    name="program_name"
                    fullWidth
                    value={formData.program_name}
                    onChange={handleChange}
                    error={!!errors.program_name}
                    helperText={errors.program_name}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    type="date"
                    name="program_date"
                    fullWidth
                    value={formData.program_date}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: todayDate,
                    }}
                    error={!!errors.program_date}
                    helperText={errors.program_date}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    type="time"
                    name="program_time"
                    fullWidth
                    value={formData.program_time}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={!!errors.program_time}
                    helperText={errors.program_time}
                  />
                </Grid>
              </>
            )}

            {/* NOTES */}
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                fullWidth
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>

          </Grid>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>

        </Box>
      </Modal>
    </ThemeProvider>
  );
}

export default CreateRequests;