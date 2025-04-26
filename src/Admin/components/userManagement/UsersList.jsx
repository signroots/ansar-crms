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

const UsersList = () => {
  const [customersData, setCustomersData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [error, setError] = useState(null);
  const fetchUsers = () =>
  {
    axios
      .get(`${ BASE_URL }/api/users/`)
      .then((response) =>
      {
        setCustomersData(response.data);
        setError(null);
      })
      .catch((error) =>
      {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again.");
      });
  };
  // ✅ Call fetchUsers on component mount
  useEffect(() =>
  {
    fetchUsers();
  }, []);
  // Fetch users from the backend
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/users/`)
      .then((response) => {
        setCustomersData(response.data);
        console.log(response.data);
        
        setError(null); 
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again.");
      });
  }, []);
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
  if (window.confirm("Are you sure you want to delete this user?")) {
    axios
      .delete(`${BASE_URL}/api/users/delete/${userId}/`)
      .then(() => {
        setCustomersData((prevData) => prevData.filter((user) => user.id !== userId));
        toast.success("User deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
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



  const filteredData = customersData.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.department?.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Change page handler
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };


  return (
    <div className="mt-5" style={{ backgroundColor: "#fcfcfc", minHeight: "80vh", padding: "20px", margin: "auto", fontSize: '13px', }}>
      <h6>User Management</h6>
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
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No users found</td>
              </tr>
            ) : (
              currentRows.map((customer, index) => (
                <tr key={customer.id}>
                  <td>{index + 1}</td>
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

      {/* Pagination */}
      <div className="d-flex justify-content-end align-items-center mt-3">
        <ButtonGroup>
          <button
            className="btn btn-sm custom-pagination-outline-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`btn btn-sm custom-pagination-btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="btn btn-sm custom-pagination-outline-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </ButtonGroup>
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
