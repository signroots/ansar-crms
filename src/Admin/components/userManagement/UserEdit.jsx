import React, { useState, useEffect } from "react";
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

const UserEdit = ({ open, handleClose, userId, onUpdate }) =>
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

  const [formErrors, setFormErrors] = useState({
    name: false,
    department: false,
    mobile_number: false,
    institution: false,
    staff_id: false,
    role: false,
    section_for_staff: false,
  });

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [MobileNumberError, setMobileNumberError] = useState("");

  const roles = ["Staff", "Tech Support"];

  // ✅ Function to fetch users and update state
  const fetchUsers = async () =>
  {
    try
    {
      const response = await axios.get(`${ BASE_URL }/api/users/`);
      setUsers(response.data);
    } catch (error)
    {
      console.error("Error fetching users:", error);
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

  useEffect(() =>
  {
    fetchUsers(); // ✅ Fetch users when component loads
  }, []);
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
  

  const handleEditClick = (userId) =>
  {
    setSelectedUserId(userId);
    setOpen(true);
  };

  // Fetch users only when the modal opens
  useEffect(() =>
  {
    if (open)
    {
      axios
        .get(`${ BASE_URL }/api/users/`)
        .then((response) => setUsers(response.data))
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [open]);

  // Fetch institutions on component mount
  useEffect(() =>
  {
    axios
      .get(`${ BASE_URL }/api/institutions/`)
      .then((response) => setInstitutions(response.data))
      .catch((error) => console.error("Error fetching institutions:", error));
  }, []);

  // Fetch user details when userId is available
  useEffect(() =>
  {
    if (userId && users.length > 0)
    {
      const user = users.find((u) => u.id === userId);
      if (user)
      {
        setFormData({
          name: user.name || "",
          department: user.department?.id || "",
          mobile_number: user.mobile_number || "",
          institution: user.institution?.id || "",
          staff_id: user.staff_id || "",
          role: user.role || "",
          section_for_staff:
            user.section_for_staff === "Electrical & Maintanance"
              ? "Electrical & Maintenance"
              : user.section_for_staff || "",
        });
      }
    }
  }, [userId, users]);

  // Fetch departments when institution changes
  useEffect(() =>
  {
    if (formData.institution)
    {
      axios
        .get(`${ BASE_URL }/api/departments/${ formData.institution }/`)
        .then((response) => setDepartments(response.data))
        .catch((error) => console.error("Error fetching departments:", error));
    } else
    {
      setDepartments([]);
    }
  }, [formData.institution]);

  // Handle input change
  const handleChange = (e) =>
  {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle role change and reset dependent fields
  const handleRoleChange = (e) =>
  {
    const selectedRole = e.target.value;
    setFormData({
      ...formData,
      role: selectedRole,
      institution: selectedRole === "Staff" ? "" : formData.institution,
      department: selectedRole === "Staff" ? "" : formData.department,
      section_for_staff: selectedRole === "Tech Support" ? "" : "",
    });
  };

  // ✅ Update user data function
  const updateData = async () =>
  {
    // Validate the form data
    const errors = {
      name: !formData.name,
      department: !formData.department && formData.role !== "Staff",
      mobile_number: !formData.mobile_number,
      institution: !formData.institution && formData.role !== "Staff",
      staff_id: !formData.staff_id,
      role: !formData.role,
      section_for_staff: formData.role === "Tech Support" && !formData.section_for_staff,
    };

    setFormErrors(errors);

    // If any field is invalid, stop the form submission
    // if (Object.values(errors).includes(true))
    // {
    //   toast.warning("Please fill out all required fields!");
    //   return;
    // }

    const requestData = {
      name: formData.name,
      role: formData.role,
      staff_id: formData.staff_id,
      mobile_number: formData.mobile_number,
      department_id: formData.role === "Staff" ? formData.department : null,
      institution_id: formData.role === "Staff" ? formData.institution : null,
      section_for_staff: formData.role === "Tech Support" ? formData.section_for_staff : null,
    };

    try
    {
      const response = await axios.put(`${ BASE_URL }/api/users/${ userId }/update/`, requestData);

      if (response.status === 200)
      {
        toast.success("User updated successfully!");

        // ✅ Ensure onUpdate is called correctly
        if (typeof onUpdate === "function")
        {
          console.log("✅ Calling onUpdate to refresh user list...");
          await onUpdate();
        } else
        {
          console.error("❌ onUpdate is not a valid function!");
        }

        handleClose(); // Close modal after update
        // window.location.reload();
      } else
      {
        throw new Error("Unexpected error occurred!");
      }
    } catch (error)
    {
      console.error("Error updating user:", error.response?.data);
      const errorMessage = error.response?.data?.message || "Error updating user!";
      toast.error(errorMessage);
    }
  };

  // Theme for MUI styling
  const customTheme = createTheme({
    palette: { primary: { main: "#877bdc" } },
  });

  // Modal style
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
          <h5>Edit User</h5>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            variant="outlined"
            className="mb-3"
            error={formErrors.name} // Error handling for Name
            helperText={formErrors.name ? "This field is required" : ""}
          />
          <TextField
            fullWidth
            label="Staff ID"
            name="staff_id"
            value={formData.staff_id}
            onChange={handleChange}
            variant="outlined"
            className="mb-3"
            error={formErrors.staff_id} // Error handling for Staff ID
            helperText={formErrors.staff_id ? "This field is required" : ""}
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
          {/* <TextField
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
                        </TextField> */}
                   

     

          {(formData.role === "Department Head" || formData.role === "Staff") && (
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
                error={formErrors.institution} // Error handling for Institution
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
                error={formErrors.department} // Error handling for Department
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
              error={formErrors.section_for_staff} // Error handling for Section
              helperText={formErrors.section_for_staff ? "This field is required" : ""}
            >
              <MenuItem value="IT">IT</MenuItem>
              <MenuItem value="Electrical & Maintenance">Electrical & Maintenance</MenuItem>
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
            <Button variant="outlined" onClick={handleClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={updateData}>
              Update
            </Button>
          </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

export default UserEdit;
