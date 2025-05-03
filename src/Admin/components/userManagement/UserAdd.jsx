import React, { useState, useEffect, useRef } from "react";
import
{
  Modal,
  Box,
  TextField,
  Button,
  MenuItem,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import axios from "axios";
import BASE_URL from "../../../utils/baseUrl";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";

const UserAdd = ({ open, handleClose, onUserAdded }) =>
{
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    mobile_number: "",
    institution: "",
    staff_id: "",
    role: "",
    section_for_staff: "",
  });

  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const roles = ["Staff", "Tech Support","Teacher"];
  const [MobileNumberError, setMobileNumberError] = useState("");
  const [staffIdError, setStaffIdError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: false,
    staff_id: false,
    role: false,
    department: false,
    institution: false,
    section_for_staff: false,
    mobile_number: false,
  });
  const modalRef = useRef(); // Reference to the modal container
  // Detect clicks outside the modal
  useEffect(() =>
  {
    const handleClickOutside = (event) =>
    {
      if (modalRef.current && !modalRef.current.contains(event.target))
      {
        handleCloseModal(); // Close the modal if clicked outside
      }
    };

    if (open)
    {
      document.addEventListener("mousedown", handleClickOutside);
    } else
    {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () =>
    {
      document.removeEventListener("mousedown", handleClickOutside); // Cleanup
    };
  }, [open, handleClose]);

  // Ensure that clicking inside the modal doesn't trigger closing
  const handleInsideClick = (event) =>
  {
    event.stopPropagation(); // Prevent the event from propagating outside
  };

  useEffect(() =>
  {
    // Fetch institutions
    axios
      .get(`${ BASE_URL }/api/institutions/`)
      .then((response) => setInstitutions(response.data))
      .catch((error) => console.error("Error fetching institutions:", error));
  }, []);

  useEffect(() =>
  {
    if (formData.institution)
    {
      // Fetch departments for the selected institution
      axios
        .get(`${ BASE_URL }/api/departments/${ formData.institution }/?data=${ formData.role }`)
        .then((response) => setDepartments(response.data))
        .catch((error) => console.error("Error fetching departments:", error));
    } else
    {
      setDepartments([]);
    }
  }, [formData.institution,formData.role]);

  const handleChange = (e) =>
  {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    setLoading(true);
    try
    {
      await axios.post(`${ BASE_URL }/api/users/create/`, formData);
      toast.success("User added successfully!");
      resetForm();
      handleClose(); // Close modal
      if (onUserAdded) onUserAdded(); // Refresh user list
    } catch (error)
    {
      console.error("Error adding user:", error);
      toast.error("Failed to add user. Please try again.");
    }
    setLoading(false);
  };

  const handleSave = () =>
  {
    const errors = {
      name: !formData.name,
      staff_id: !formData.staff_id,
      role: !formData.role,
      department: !formData.department,
      institution: !formData.institution,
      section_for_staff: !formData.section_for_staff,
      mobile_number: !formData.mobile_number,
    };

    setFormErrors(errors);

    // Check if any field has an error
    if (Object.values(errors).some((error) => error))
    {
      return; // Stop submission if there are errors
    }

    // Proceed with saving (Submit the form)
    console.log("Form submitted successfully!", formData);
  };
  const handleRoleChange = (e) =>
  {
    const selectedRole = e.target.value;
    setFormData({
      ...formData,
      role: selectedRole,
      // If role is 'Tech Support', set institution and department to null
      institution: selectedRole === "Staff" ? "" : formData.institution,
      department: selectedRole === "Staff" ? "" : formData.department,
      section_for_staff: selectedRole === "Tech Support" ? formData.section_for_staff : "",
    });
  };

  const checkMobileNumberExists = async (MobileNumber) =>
  {
    try
    {
      const response = await axios.get(`${ BASE_URL }/api/check-mobile/`);

      if (response.data.mobile_numbers.includes(MobileNumber))
      {
        setMobileNumberError("This Mobile Number is already in use.");
      } else
      {
        setMobileNumberError(""); // Clear error if available
      }
    } catch (error)
    {
      console.error("Error checking Staff ID:", error);
    }
  };

  const handleMobileChange = (e) =>
  {
    const { name, value } = e.target;

    if (name === "mobile_number")
    {
      // Allow only digits and prevent more than 10 characters
      if (/^\d*$/.test(value) && value.length <= 10)
      {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      

        if (value.length === 10)
        {
          checkMobileNumberExists(value); // Check only when it's 10 digits
        }
        else
        {
          setMobileNumberError(""); // Clear error if user modifies input
        }
      }
    }
  };
  const checkStaffIdExists = async (staffId) =>
  {
    try
    {
      const response = await axios.get(`${ BASE_URL }/api/check-staff-id/`);

      if (response.data.staff_ids.includes(staffId))
      {
        setStaffIdError("This Staff ID is already in use.");
      } else
      {
        setStaffIdError(""); // Clear error if available
      }
    } catch (error)
    {
      console.error("Error checking Staff ID:", error);
    }
  };

  const handleStaffIdChange = (e) =>
  {
    const { name, value } = e.target;

    if (name === "staff_id")
    {
      // First character must be a letter
      if (value.length === 1 && !/^[A-Za-z]$/.test(value))
      {
        setStaffIdError("The first character must be an alphabet letter.");
        return;
      }

      // After first character, allow numbers only
      if (value.length > 1 && !/^[A-Za-z][0-9]*$/.test(value))
      {
        return;
      }

      // Restrict maximum length (example: 6 characters total)
      if (value.length > 6)
      {
        return;
      }

      setStaffIdError(""); // Clear error when valid

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      checkStaffIdExists(value);
    }
  };

  const resetForm = () =>
  {
    setFormData({
      name: "",
      department: "",
      mobile_number: "",
      institution: "",
      staff_id: "",
      role: "",
      section_for_staff: "",
    });

    // setFormErrors({   // Reset all errors
    //   name: false,
    //   staff_id: false,
    //   role: false,
    //   department: false,
    //   institution: false,
    //   section_for_staff: false,
    //   mobile_number: false,
    // });
    setFormErrors({});
    setStaffIdError(""); // Reset staff ID error
    setMobileNumberError("");
  };


  const handleCloseModal = () =>
  {
    resetForm(); // Reset form fields
    handleClose(); // Close the modal
    if (onUserAdded) onUserAdded();
  };
  const validateForm = () =>
  {
    const errors = {
      name: !formData.name,
      staff_id: !formData.staff_id,
      role: !formData.role,
      department: !formData.department && formData.role !== "Tech Support",
      institution: !formData.institution && formData.role !== "Tech Support",
      section_for_staff: !formData.section_for_staff && formData.role === "Tech Support",
      mobile_number: !formData.mobile_number,
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };
  const saveData = async () =>
  {
    if (!validateForm())
    {
      toast.warning("All fields are required!");
      return;
    }

    const requestData = {
      name: formData.name,
      role: formData.role,
      staff_id: formData.staff_id,
      institution_id: formData.role === "Tech Support" ? null : formData.institution,
      department_id: formData.role === "Tech Support" ? null : formData.department,
      section_for_staff: formData.role === "Tech Support" ? formData.section_for_staff : null,
      mobile_number: formData.mobile_number,
    };

    try
    {
      await axios.post(`${ BASE_URL }/api/users/create/`, requestData);
      toast.success("User added successfully!");
      resetForm();
      handleClose();
      if (onUserAdded) onUserAdded(); // Refresh user list
    } catch (error)
    {
      console.error("Error adding user:", error.response?.data);
      const errorData = error.response?.data;
      const errorMessage =
        typeof errorData === "string"
          ? errorData
          : errorData?.error || errorData?.message || "Something went wrong!";
      toast.error(`Error: ${ errorMessage }`);
    }
  };

  const customTheme = createTheme({
    palette: {
      primary: {
        main: "#877bdc",
      },
    },
  });

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <h5>Add User</h5>
          {/* Close Icon Button */}
          
          <Button
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              minWidth: "auto",
              padding: "6px",
              color: "grey.600",
              "&:hover": {
                color: "red",
              },
            }}
          >
            <CloseIcon />
          </Button>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            variant="outlined"
            className="mb-3"
            error={formErrors.name} // Highlight red if error
            helperText={formErrors.name ? "This field is required" : ""}
          />
          <TextField
            fullWidth
            label="Staff ID"
            name="staff_id"
            value={formData.staff_id}
            onChange={handleStaffIdChange}
            variant="outlined"
            className="mb-3"
            error={
              formErrors.staff_id || // Highlight red if the field is empty
              (formData.staff_id.length > 0 && !/^[A-Za-z]{1}[A-Za-z0-9]*$/.test(formData.staff_id)) ||
              !!staffIdError // Check if the staffIdError state has an error message
            }
            helperText={
              formErrors.staff_id
                ? "This field is required"
                : formData.staff_id.length > 0 && !/^[A-Za-z]{1}[A-Za-z0-9]*$/.test(formData.staff_id)
                  ? "Staff ID must start with first letter is alphabetic"
                  : staffIdError // Show error if Staff ID already exists
            }
          />

          <TextField
            fullWidth
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleRoleChange} // Change role handler
            variant="outlined"
            className="mb-3"
            error={formErrors.role} // Highlight red if error
            helperText={formErrors.role ? "This field is required" : ""}
          >
            {roles.map((role, index) => (
              <MenuItem key={index} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
          {(formData.role === "Staff") &&(
            <>
              <TextField
                fullWidth
                select
                label="Institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                variant="outlined"
                className="mb-3"
                error={formErrors.institution} // Highlight red if error
                helperText={formErrors.institution ? "This field is required" : ""}
              >
                {institutions.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                variant="outlined"
                className="mb-3"
                error={formErrors.department} // Highlight red if error
                helperText={formErrors.department ? "This field is required" : ""}
                disabled={!formData.institution}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
          {(formData.role === "Teacher") && (
            <>
              <TextField
                fullWidth
                select
                label="Institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                variant="outlined"
                className="mb-3"
                error={formErrors.institution} // Highlight red if error
                helperText={formErrors.institution ? "This field is required" : ""}
              >
                {institutions.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                variant="outlined"
                className="mb-3"
                error={formErrors.department} // Highlight red if error
                helperText={formErrors.department ? "This field is required" : ""}
                disabled={!formData.institution}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            
            </>
          )}
          {formData.role === "Tech Support" && (
            <TextField
              fullWidth
              select
              label="Section"
              name="section_for_staff"
              value={formData.section_for_staff}
              onChange={handleChange}
              variant="outlined"
              className="mb-3"
              error={formErrors.section_for_staff} // Highlight red if error
              helperText={formErrors.section_for_staff ? "This field is required" : ""}
              required
            >
              <MenuItem value="IT">IT</MenuItem>
              <MenuItem value="Electrical & Maintanance">Electrical and Maintanance</MenuItem>
            </TextField>
          
          )}
          <TextField
            fullWidth
            label="Mobile No"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleMobileChange}
            variant="outlined"
            error={!!MobileNumberError || !!formErrors.mobile_number} // Show error if message exists
            helperText={MobileNumberError || (formErrors.mobile_number ? "This field is required" : "")} // Show appropriate error message
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button variant="outlined" onClick={handleCloseModal} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={saveData}>
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

export default UserAdd;
