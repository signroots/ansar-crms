import React from 'react'

function StaffList() {
  return (
    <div>Super Admin</div>
  )
}

export default StaffList


// import React, { useState} from "react";
// import { Table, FormControl, ButtonGroup } from "react-bootstrap";
// import { IoAddOutline } from "react-icons/io5";
// import { MdDelete } from "react-icons/md";
// import StaffAdd from "./StaffAdd"; 
// import { FaUserEdit } from "react-icons/fa";

// const StaffList = () => {
//   const [customersData, setCustomersData] = useState([
//     { id: 1, name: "Sanin", department: "HR", mobile: "1234567890" },
//     { id: 2, name: "Sanabil", department: "HR", mobile: "1234567890" },
//     { id: 3, name: "Sanin", department: "HR", mobile: "1234567890" },
//     { id: 4, name: "Sanin", department: "HR", mobile: "1234567890" },
//     { id: 5, name: "Sanabil", department: "HR", mobile: "1234567890" },
//     { id: 6, name: "Sanin", department: "HR", mobile: "1234567890" },
//     { id: 7, name: "Sanin", department: "HR", mobile: "1234567890" },
//     { id: 8, name: "Sanabil", department: "HR", mobile: "1234567890" },
//     { id: 9, name: "Sanin", department: "HR", mobile: "1234567890" },
//     { id: 10, name: "Sanin", department: "HR", mobile: "1234567890" },
//     { id: 11, name: "Sanabil", department: "HR", mobile: "1234567890" },
//     { id: 12, name: "Sanin", department: "HR", mobile: "1234567890" },
//   ]);
  
//   const [showModal, setShowModal] = useState(false);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage] = useState(6);

//   const filteredData = customersData.filter(
//     (customer) =>
//       customer.name.toLowerCase().includes(search.toLowerCase()) ||
//       customer.department.toLowerCase().includes(search.toLowerCase())
//   );

//   // Pagination logic
//   const indexOfLastRow = currentPage * rowsPerPage;
//   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
//   const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
//   const totalPages = Math.ceil(filteredData.length / rowsPerPage);

//   // Change page handler
//   const handlePageChange = (pageNumber) => {
//     if (pageNumber > 0 && pageNumber <= totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   const handleAddUser = (newUser) => {
//     // Add new user to the existing list
//     const newUserWithId = { id: customersData.length + 1, ...newUser };
    
//     // Update customersData, and reset the current page to 1 if needed
//     setCustomersData((prevData) => {
//       const updatedData = [...prevData, newUserWithId];
//       setCurrentPage(1);
//       return updatedData;
//     });
//   };

//   return (
//     <div
//       className="mt-5"
//       style={{
//          backgroundColor: "#f9f9f9",
//         padding: "20px",
//         margin: "auto",
//       }}
//     >
//       <h6>Staff Management</h6>
//       <small>
//         mdbreact DataTables has most features enabled by default.
//       </small>
//       <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
//         <FormControl
//           type="text"
//           placeholder="search table"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           style={{ width: "50%",
//             boxShadow: "none",
//             fontSize: "14px",
//             padding: "8px",}}
//         />
//         <button
//           className="btn btn-sm"
//           style={{
//             backgroundColor: "#877bdc",
//             color: "white",
//             display: "flex",
//             alignItems: "center",
//             padding: "5px 10px", // Adjust padding to control space between icon and text
//           }}
//           onClick={() => setShowModal(true)}
//         >
//           <IoAddOutline
//             style={{ fontSize: "18px", color: "white" }}
//           />
//           Staff
//         </button>
//       </div>

//        <div style={{ overflowX: "auto",   }}>
//         <Table responsive bordered hover>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Department</th>
//               <th>Mobile</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentRows.map((customer) => (
//               <tr key={customer.id} >
//                 <td>{customer.id}</td>
//                 <td>{customer.name}</td>
//                 <td>{customer.department}</td>
//                 <td>{customer.mobile}</td>
//                 <td>
//                   <MdDelete
//                     size={20}
//                     className="text-danger"
//                     style={{ cursor: "pointer" }}
//                     onClick={() =>
//                       setCustomersData((prevData) =>
//                         prevData.filter((data) => data.id !== customer.id)
//                       )
//                     }
//                   />
//                   <FaUserEdit
//                     size={19}
//                     className="text-primary"
//                     style={{cursor:'pointer',marginLeft:'1rem'}}
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </div>
//       {/* Pagination */}
//       <div className="d-flex justify-content-end align-items-center mt-3">
//         <ButtonGroup>
//           {/* Prev Button */}
//           <button
//             className="btn btn-sm custom-pagination-outline-btn"
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//           >
//             Prev
//           </button>

//           {/* Page Numbers */}
//           {[...Array(totalPages)].map((_, index) => (
//             <button
//               key={index + 1}
//               className={`btn btn-sm custom-pagination-btn ${
//                 currentPage === index + 1 ? "active" : ""
//               }`}
//               onClick={() => handlePageChange(index + 1)}
//             >
//               {index + 1}
//             </button>
//           ))}

//           {/* Next Button */}
//           <button
//             className="btn btn-sm custom-pagination-outline-btn"
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </button>
//         </ButtonGroup>
//       </div>

//       {/* MUI Modal */}
//       <StaffAdd
//         open={showModal}
//         handleClose={() => setShowModal(false)}
//         handleSave={handleAddUser}
        
//       />
//     </div>
//   );
// };

// export default StaffList;
