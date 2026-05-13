import React, { useState, useEffect } from "react";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Modal,
  ThemeProvider,
  createTheme,
  FormHelperText,
  Grid,
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
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ================= COMPONENT =================
const CreateComplaints = () => {
  const [formData, setFormData] = useState({
    staffId: "",
    complaintType: "",
    issue: "", 
    category: "",
    location: "",
    subLocation: "",
    notes: "",
    phoneNumber: "",
    priority: "",
  });
const [userRole, setUserRole] = useState("");
  const [staffIds, setStaffIds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [errors, setErrors] = useState({});
const [issueTypes, setIssueTypes] = useState([]);
const [issues, setIssues] = useState([]);
const [institutions, setInstitutions] = useState([]);
const [complaints, setComplaints] = useState([]);

const fetchComplaints = async () => {
  const res = await apiRequest("GET", "/api/complaints-list/");
  setComplaints(res.data || []);
};


const [subLocations, setSubLocations] = useState([]);
  useEffect(() => {
    apiRequest("GET", "/api/check-staff-id/?data=DepartmentHead")
      .then((res) => setStaffIds(res.data.staff_ids || []))
      .catch(() => setStaffIds([]));
  }, []);
useEffect(() => {
  apiRequest("GET", "/api/institutions/")
    .then((res) => setInstitutions(res.data || []))
    .catch(() => setInstitutions([]));
}, []);
  // ================= HANDLER =================
const handleChange = async (e) => {
  const { name, value } = e.target;

  // ✅ STAFF → autofill phone
  if (name === "staffId") {
    const selectedStaff = staffIds.find((s) => s.id === value);

    setFormData({
      ...formData,
      staffId: value,
      phoneNumber: selectedStaff?.phone || "",
    });
  }

  // ✅ TYPE → load issues
  else if (name === "complaintType") {
    const selectedType = issueTypes.find((t) => t.id === value);

    setFormData({
      ...formData,
      complaintType: value,
      complaintTypeName: selectedType?.name || "",
      issue: "",
    });

    try {
      // const res = await apiRequest("GET", `/api/issues/${value}/`);
      // setIssues(res.data || []);
    } catch {
      setIssues([]);
    }
  }

  // ✅ LOCATION → load sublocations 🔥🔥🔥
  else if (name === "location") {
    setFormData({
      ...formData,
      location: value,
      subLocation: "", // reset sublocation
    });

    try {
      const res = await apiRequest("GET", `/api/sublocation/${value}/`);
      setSubLocations(res.data || []);
    } catch {
      setSubLocations([]);
    }
  }

  // ✅ DEFAULT
  else {
    setFormData({ ...formData, [name]: value });
  }

  setErrors({ ...errors, [name]: "" });
};
useEffect(() => {
  apiRequest("GET", "/api/types-of-issue/")
    .then((res) => {
      setIssueTypes(res.data || []);
    })
    .catch(() => setIssueTypes([]));
}, []);
useEffect(() => {
  const role = localStorage.getItem("user_role") || localStorage.getItem("role");
  setUserRole(role);
}, []);
useEffect(() => {
  apiRequest("GET", "/api/institutions/")
    .then((res) => {
      setInstitutions(res.data || []);
    })
    .catch(() => setInstitutions([]));
}, []);
useEffect(() => {
  const storedTypeId = localStorage.getItem("type_of_issue_id");
  const storedTypeName = localStorage.getItem("type_of_issue");

  if (userRole === "Tech Support" && storedTypeId) {
    setFormData((prev) => ({
      ...prev,
      complaintType: storedTypeId,
      complaintTypeName: storedTypeName,
    }));
  }
}, [userRole]);
useEffect(() => {
  if (!formData.complaintType) return;

  const fetchIssues = async () => {
    try {
      const res = await apiRequest(
        "GET",
        `/api/issues/${formData.complaintType}/`
      );
      setIssues(res.data || []);
    } catch (err) {
      console.error("Issue fetch error:", err);
      setIssues([]);
    }
  };

  fetchIssues();
}, [formData.complaintType]);
  // ================= VALIDATION =================
 const validateForm = () => {
  let err = {};

  if (!formData.staffId) err.staffId = "Staff ID is required";
  if (!formData.complaintType) err.complaintType = "Required";
  if (!formData.phoneNumber) err.phoneNumber = "Required";
if (userRole !== "Tech Support") {
  if (!formData.complaintType) err.complaintType = "Required";
}
  if (formData.complaintTypeName === "Maintenance") {
    // if (!formData.category) err.category = "Required";
    if (!formData.location) err.location = "Required";
    if (!formData.subLocation) err.subLocation = "Required";
    if (!formData.priority) err.priority = "Required"; // ✅ moved here
  }

  setErrors(err);
  return Object.keys(err).length === 0;
};

  const resetForm = () => {
    setFormData({
      staffId: "",
      complaint_type:
    userRole === "Tech Support"
      ? localStorage.getItem("type_of_issue_id")
      : formData.complaintType,
      category: "",
      location: "",
      subLocation: "",
      notes: "",
      phoneNumber: "",
      priority: "",
    });

    setErrors({});
  };
  // ================= SUBMIT =================
  const handleSubmit = async () => {
    console.log("Submit clicked");
    if (!validateForm()) return;

    const payload = {
      staff_id: formData.staffId,
      complaint_type: formData.complaintType,
      category: formData.category,
      location: formData.location,
      sub_location: formData.subLocation,
      notes: formData.notes,
      phone_number: formData.phoneNumber,
      priority: formData.priority,
      issue_complaint:formData.issue
      // created_by: formData.created_by
    };
    console.log("Payload ready");
    try {
  await apiRequest("POST", "/api/complaints/submit/", payload);

  toast.success("Complaint submitted successfully");

  setOpenModal(false);   // ✅ now this will execute
  resetForm();           // ✅ good practice

} catch (error) {
  console.error(error);  // ✅ always log error
  toast.error("Submission failed");
}
  };
  useEffect(() => {
  fetchComplaints();
}, []);

  // ================= THEME =================
  const theme = createTheme({
    palette: {
      primary: { main: "#6c63ff" },
    },
  });

  // ================= UI =================
  return (
    <ThemeProvider theme={theme}>
      <Button
  variant="contained"
  onClick={() => {
    resetForm();
    setOpenModal(true);
  }}
  sx={{
    background: "linear-gradient(90deg, #3f6ad8, #5a8dee)",
    color: "#fff",
    fontWeight: 600,
    padding: "8px 18px",
    borderRadius: "6px",
    textTransform: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    "&:hover": {
      background: "linear-gradient(90deg, #355ec9, #4a7de0)",
    }
  }}
>
  CREATE COMPLAINT
</Button>

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

          <Typography variant="h6" mb={3} fontWeight="bold">
            Create Complaint
          </Typography>

          <Grid container spacing={2}>
            {/* STAFF */}
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.staffId}>
                <InputLabel>Staff ID</InputLabel>
                <Select
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                >
                  {staffIds.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.id}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.staffId}</FormHelperText>
              </FormControl>
            </Grid>

            {/* TYPE */}
            {userRole !== "Tech Support" && (
  <Grid item xs={12}>
    <FormControl fullWidth error={!!errors.complaintType}>
      <InputLabel>Type of Complaint</InputLabel>
      <Select
        name="complaintType"
        value={formData.complaintType}
        onChange={handleChange}
      >
        {issueTypes.map((type) => (
          <MenuItem key={type.id} value={type.id}>
            {type.name}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{errors.complaintType}</FormHelperText>
    </FormControl>
  </Grid>
)}
<Grid item xs={12}>
  <FormControl fullWidth>
    <InputLabel>Category</InputLabel>
    <Select
      name="issue"
      value={formData.issue || ""}
      onChange={handleChange}
    >
      {issues.map((item) => (
        <MenuItem key={item.id} value={item.id}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>
<Grid item xs={12}>
              <FormControl fullWidth error={!!errors.priority}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
                <FormHelperText>{errors.priority}</FormHelperText>
              </FormControl>
            </Grid>
            {/* CONDITIONAL FIELDS */}
            {formData.complaintTypeName === "Maintenance" && (
              <>
              
                {/* <Grid item xs={12}>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <MenuItem value="Civil Repairs">Civil Repairs</MenuItem>
                      <MenuItem value="Cleaning">Cleaning</MenuItem>
                      <MenuItem value="Others">Others</MenuItem>
                    </Select>
                    <FormHelperText>{errors.category}</FormHelperText>
                  </FormControl>
                </Grid> */}

     <Grid item xs={6}>
  <FormControl fullWidth error={!!errors.location}>
    <InputLabel>Location</InputLabel>
    <Select
      name="location"
      value={formData.location}
      onChange={handleChange}
    >
      {institutions.map((inst) => (
        <MenuItem key={inst.id} value={inst.id}>
          {inst.name}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText>{errors.location}</FormHelperText>
  </FormControl>
</Grid>
<Grid item xs={6}>
  <FormControl fullWidth error={!!errors.subLocation}>
    <InputLabel>Sub Location</InputLabel>
    <Select
      name="subLocation"
      value={formData.subLocation}
      onChange={handleChange}
    >
      {subLocations.map((sub) => (
        <MenuItem key={sub.id} value={sub.id}>
          {sub.name}
        </MenuItem>
      ))}
    </Select>
    <FormHelperText>{errors.subLocation}</FormHelperText>
  </FormControl>
</Grid>
                {/* <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    multiline
                    rows={3}
                    fullWidth
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Grid> */}
                      {/* PRIORITY */}
            
              </>
            )}

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
      {/* Notes */}
            <Grid item xs={12}>
    <TextField
      label="Notes"
      name="notes"
      fullWidth
      multiline
      rows={3}
      value={formData.notes || ""}
      onChange={handleChange}
      error={!!errors.notes}
      helperText={errors.notes}
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
};

export default CreateComplaints;