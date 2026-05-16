// import React, { useState } from "react";
// import {
//   Modal,
//   Box,
//   TextField,
//   Button,
//   MenuItem,
//   ThemeProvider,
//   createTheme,
// } from "@mui/material";

// const StaffAdd = ({ open, handleClose, handleSave }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     department: "",
//     mobile: "",
//   });

//   const departments = ["HR", "Finance", "IT", "Sales"];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const saveData = () => {
//     if (formData.name && formData.department && formData.mobile) {
//       handleSave(formData);
//       handleClose();
//     } else {
//       alert("All fields are required!");
//     }
//   };

//   // Define custom MUI theme
//   const customTheme = createTheme({
//     palette: {
//       primary: {
//         main: "#877bdc", // Primary color
//       },
//       secondary: {
//         main: "#f50057", // Secondary color
//       },
//     },
//     typography: {
//       h5: {
//         fontSize: "1.25rem",
//         fontWeight: 500,
//       },
//     },
//     components: {
//       MuiTextField: {
//         styleOverrides: {
//           root: {
//             marginBottom: "16px",
//           },
//         },
//       },
//       MuiButton: {
//         styleOverrides: {
//           root: {
//             borderRadius: "4px", // rounded corners for buttons
//           },
//         },
//       },
//     },
//   });

//   const style = {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     width: 700,
//     bgcolor: "background.paper",
//     boxShadow: 24,
//     p: 4,
//     borderRadius: "8px",
//   };

//   return (
//     <ThemeProvider theme={customTheme}>
//       <Modal open={open} onClose={handleClose}>
//         <Box sx={style}>
//           <h5>Add Staff</h5>
//           <TextField
//             fullWidth
//             label="Name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             variant="outlined"
//           />
//           <TextField
//             fullWidth
//             select
//             label="Department"
//             name="department"
//             value={formData.department}
//             onChange={handleChange}
//             variant="outlined"
//           >
//             {departments.map((dept, index) => (
//               <MenuItem key={index} value={dept}>
//                 {dept}
//               </MenuItem>
//             ))}
//           </TextField>
//           <TextField
//             fullWidth
//             label="Mobile No"
//             name="mobile"
//             value={formData.mobile}
//             onChange={handleChange}
//             variant="outlined"
//           />
//           <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
//             <Button
//               variant="outlined"
//               onClick={handleClose}
//               sx={{
//                 mr: 2,
//                 backgroundColor: "transparent",
//                 color: "#877bdc",
//                 border: "1px solid #877bdc",
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="contained"
//               sx={{
//                 backgroundColor: "#877bdc",
//                 color: "white",
//                 border: "#877bdc",
//               }}
//               onClick={saveData}
//             >
//               Save
//             </Button>
//           </Box>
//         </Box>
//       </Modal>
//     </ThemeProvider>
//   );
// };

// export default StaffAdd;
