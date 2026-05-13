import React, { useState, useEffect } from "react";
import { Table, FormControl, ButtonGroup, Alert } from "react-bootstrap";
import { IoAddOutline } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import axios from "axios";
import UserAdd from "./UserAdd";
import BASE_URL from "../../../utils/baseUrl";
import { toast } from "react-toastify";
import UserEdit from "./UserEdit";
import { FaCopy } from "react-icons/fa";
import Pagination from "@mui/material/Pagination";
const UsersList = () => {
  const [customersData, setCustomersData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [error, setError] = useState(null);
const [totalCount, setTotalCount] = useState(0);
const [pageSize, setPageSize] = useState(10);
// const pageSize = 10; // ✅ move here
const totalPages = Math.ceil(totalCount / pageSize);
const fetchUsers = (page = 1, size = pageSize) => {
  const token = localStorage.getItem("access_token");

  axios.get(`${BASE_URL}/api/users/?page=${page}&page_size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then((response) => {
    setCustomersData(response.data.results);
    setTotalCount(response.data.count);
  })
  .catch((error) => {
    console.error("Error fetching users:", error);
  });
};
useEffect(() => {
  fetchUsers(currentPage, pageSize);
}, [currentPage, pageSize]);
  // Fetch users from the backend
  // useEffect(() => {
  //   axios
  //     .get(`${BASE_URL}/api/users/`)
  //     .then((response) => {
  //       setCustomersData(response.data);
  //       console.log(response.data);
        
  //       setError(null); 
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching users:", error);
  //       setError("Failed to fetch users. Please try again.");
  //     });
  // }, []);
  const handleCopy = async (text) =>
  {
    try
    {
      await navigator.clipboard.writeText(text);
      toast.success("Mobile number copied!");
    } catch (err)
    {
      toast.error("Failed to copy! Please try again.");
      console.error("Clipboard error:", err);
    }
  };
  // Delete users from the backend
 const handleDeleteUser = (userId) => {
  const token = localStorage.getItem("access_token");

  if (window.confirm("Are you sure you want to delete this user?")) {
    axios.delete(`${BASE_URL}/api/users/delete/${userId}/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(() => {
      fetchUsers(currentPage); // refresh properly
      toast.success("User deleted successfully.");
    })
    .catch((error) => {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    });
  }
};
  
    const handleEditUser = (userId) => {
    setSelectedUserId(userId);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedUserId(null);
  };

// const getPageNumbers = () => {
//   const pages = [];

//   let start = Math.max(1, currentPage - 2);
//   let end = Math.min(totalPages, currentPage + 2);

//   if (currentPage <= 3) {
//     start = 1;
//     end = Math.min(5, totalPages);
//   }

//   if (currentPage >= totalPages - 2) {
//     start = Math.max(1, totalPages - 4);
//     end = totalPages;
//   }

//   for (let i = start; i <= end; i++) {
//     pages.push(i);
//   }

//   return { pages, start, end };
// };

// const { pages, start, end } = getPageNumbers();

  // const filteredData = customersData.filter(
  //   (customer) =>
  //     customer.name.toLowerCase().includes(search.toLowerCase()) ||
  //     customer.department?.name.toLowerCase().includes(search.toLowerCase())
  // );

  // Pagination logic
// <- this sets your 10 rows per page


  // // Change page handler
  // const handlePageChange = (pageNumber) => {
  //   if (pageNumber > 0 && pageNumber <= totalPages) {
  //     setCurrentPage(pageNumber);
  //   }
  // };
// const handlePageChange = (page) => {
//   setCurrentPage(page);
//   fetchUsers(page);
// };

  return (
    <div>
    <h6 style={{ marginBottom: "15px" }}>User Management</h6>
    <div className="mt-5" style={{ backgroundColor: "#fcfcfc", minHeight: "80vh", padding: "20px", margin: "auto", fontSize: '13px', }}>
      
      <small>Create & Manage users</small>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
        <FormControl
          type="text"
          placeholder="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}

          style={{ width: '250px', boxShadow: 'none', fontSize: '15px' }}

        />
        <button
          className="btn btn-sm"
          style={{
            backgroundColor: "#877bdc",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "5px 10px",
          }}
          onClick={() => setShowModal(true)}
        >
          <IoAddOutline style={{ fontSize: "18px", color: "white" }} />
          User
        </button>
      </div>

      <div style={{ overflowX: "auto" ,fontSize: "13px",}}>
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>NO</th>
              <th>Name</th>
              <th>Staff ID</th>
              <th>Role</th>
              <th>Institution - Department</th>
              <th>Staff Section</th>
              <th>Mobile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customersData.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No users found</td>
              </tr>
            ) : (
              customersData.map((customer, index) => (
                <tr key={customer.id}>
                  <td>{(currentPage - 1) * pageSize + index + 1}</td>
                  <td>{customer.name}</td>
                  <td>{customer.staff_id}</td>
                  <td>{customer.role} </td>
                  <td><b>{customer.institution ? customer.institution.name : null}</b> { "  " } {customer.department ? customer.department.name : "N/A"}</td>
                  <td>{customer.section_for_staff ? customer.section_for_staff : "N/A"}</td>
                  <td>
                    {customer.mobile_number}
                    <FaCopy
                      style={{ cursor: "pointer", marginLeft: "10px", color: "#007bff" }}
                      title="Copy Mobile Number"
                      onClick={() => handleCopy(customer.mobile_number)}
                    />
                  </td>

                  <td>
                    <MdDelete
                      size={20}
                      color="red"
                      style={{ cursor: "pointer" }}
                     onClick={() => handleDeleteUser(customer.id)}
                    />
                    <FaUserEdit
                      size={19}
                      className="text-primary"
                      style={{ cursor: "pointer", marginLeft: "1rem" }}
                       onClick={() => handleEditUser(customer.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

<div className="d-flex justify-content-between align-items-center mt-3">

  {/* LEFT: Pagination numbers */}
  <Pagination
    count={Math.ceil(totalCount / pageSize)}   // total pages
    page={currentPage}
    onChange={(e, value) => setCurrentPage(value)}
    color="primary"
    siblingCount={1}
    boundaryCount={1}
  />

  {/* RIGHT: Rows dropdown */}
  <div className="d-flex align-items-center gap-2">
    <span>Rows:</span>
    <select
      value={pageSize}
      onChange={(e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
      }}
      className="form-select form-select-sm"
      style={{ width: "120px" }}
    >
      <option value={10}>10 / page</option>
      <option value={25}>25 / page</option>
      <option value={50}>50 / page</option>
      <option value={100}>100 / page</option>
    </select>
  </div>


</div>
</div>
      <UserAdd open={showModal} handleClose={() => setShowModal(false)} onUserAdded={fetchUsers} />
      
      <UserEdit
        open={showEditModal}
        handleClose={handleCloseEditModal}
        userId={selectedUserId}
        onUpdate={fetchUsers}
      
      />
    </div>
  );
};

export default UsersList;
