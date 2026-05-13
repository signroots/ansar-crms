import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, ButtonGroup, Dropdown, DropdownButton, FormControl, Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import BASE_URL from '../../../utils/baseUrl';
import { FaRegEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import CreateComplaints from './CreateComplaints';
import Pagination from "@mui/material/Pagination";
const ComplaintsList = () => {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [serviceRequests, setServiceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTableModal, setShowTableModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [delayReasons, setDelayReasons] = useState([]);
    const [newDelayReason, setNewDelayReason] = useState("");
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [showDetails, setShowDetails] = useState(false);
    const [technicians, setTechnicians] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    // const [showAssignModal, setShowAssignModal] = useState(false);

    // Fetch service requests from the backend with pagination
 const fetchServiceRequests = async () => {
    try {
        const token = localStorage.getItem("access_token");

        const response = await axios.get(
            `${BASE_URL}/api/complaints-list/?page=${currentPage}&page_size=${rowsPerPage}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setServiceRequests(response.data.results || []);
        setTotalCount(response.data.count);
    } catch (error) {
        console.error('Error fetching service requests:', error);
    } finally {
        setLoading(false);
    }
};
const styles = {
    labelCell: {
        width: "38%",
        padding: "14px",
        fontWeight: "600",
        border: "1px solid #dee2e6",
        backgroundColor: "#f8f9fa",
        verticalAlign: "top",
    },

    valueCell: {
        width: "62%",
        padding: "14px",
        border: "1px solid #dee2e6",
        backgroundColor: "#fff",
        color: "#495057",
    },
};
useEffect(() => {
    fetchServiceRequests();
}, [currentPage, rowsPerPage]);

    useEffect(() => {
        fetchServiceRequests();
    }, [rowsPerPage]); // When rowsPerPage changes, fetch data again
    const fetchTechnicians = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const res = await axios.get(`${BASE_URL}/technician_list/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setTechnicians(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchTechnicians();
    }, []);
    // // Handling the pagination of complaints
    // const handleNext = () => {
    //     if (nextPage) {
    //         fetchServiceRequests(nextPage);
    //         setCurrentPage(prev => prev + 1);
    //     }
    // };

    // const handlePrev = () => {
    //     if (prevPage) {
    //         fetchServiceRequests(prevPage);
    //         setCurrentPage(prev => prev - 1);
    //     }
    // };

    const handlePageSizeChange = (e) => {
        const newSize = e.target.value;
        setRowsPerPage(newSize);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const exportServiceRequests = async (startDate, endDate) => {
        try {
            const response = await fetch(`${BASE_URL}/api/complaints-list/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
            }

            const data = await response.json();
            const start = new Date(startDate);
            const end = new Date(endDate);

            const filteredComplaints = data.filter(complaint => {
                const complaintDate = new Date(complaint.date || complaint.created_at);
                return complaintDate >= start && complaintDate <= end;
            });

            if (filteredComplaints.length === 0) {
                alert("No complaints found in the selected date range.");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(filteredComplaints);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints");

            // Download the Excel file
            XLSX.writeFile(workbook, `complaints_${startDate}_to_${endDate}.xlsx`);
        } catch (error) {
            console.error("Error exporting complaints:", error);
        }
    };

    // Filter complaints based on the search term
    const filteredData = serviceRequests?.length
        ? serviceRequests.filter((request) => {
            const department = request.department ? String(request.department.name).toLowerCase() : "";
            const issueComplaint = request.issue_complaint ? String(request.issue_complaint.name).toLowerCase() : "";
            const searchTerm = search.toLowerCase();
            return department.includes(searchTerm) || issueComplaint.includes(searchTerm);
        })
        : [];

    const currentRows = filteredData;

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / rowsPerPage);

    return (
        <div>
            <h6>Complaints</h6>
            <div style={{ backgroundColor: "#fcfcfc", minHeight: "80vh", padding: "20px", margin: "auto", fontSize: '13px' }}>
                <small>Live complaints tracking & management.</small>
                <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                    <div className='d-flex justify-content-between align-items-center'>
                        <FormControl
                            type="text"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '250px', boxShadow: 'none', fontSize: '15px' }}
                        />
                        {/* <DropdownButton
                            id="row-count-dropdown"
                            title={`Rows: ${rowsPerPage}`}
                            variant="outline"
                            size="sm"
                            onSelect={handlePageSizeChange}
                        >
                            <Dropdown.Item eventKey="5">5</Dropdown.Item>
                            <Dropdown.Item eventKey="10">10</Dropdown.Item>
                            <Dropdown.Item eventKey="20">20</Dropdown.Item>
                            <Dropdown.Item eventKey="50">50</Dropdown.Item>
                        </DropdownButton> */}
                    </div>
                    <div className='d-flex flex-row'>
                        <CreateComplaints />
                        <Button variant="secondary" className='ms-2' size="sm" onClick={() => setShowExportModal(true)}>
                            Export
                        </Button>
                    </div>
                </div>

                {warningMessage && <div className="alert alert-warning">{warningMessage}</div>}

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <Table bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Institution & Department</th>
                                <th>Complaints</th>
                                <th>Type of issue</th>
                                <th>Status</th>
                                <th>Attended by</th>
                                <th>Resolved Date</th>
                                <th>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((request, index) => (
                                <tr key={request.id}>
                                    {/* Serial Number for Pagination */}
                                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                    <td>{new Date(request.date).toLocaleDateString()}</td>
                                    <td>{request.institution?.name} - {request.department?.name}</td>
                                    <td>{request.issue_complaint?.name}</td>
                                    <td>{request.type_of_issue?.name || 'N/A'}</td> {/* Updated this line */}
                                    <td> <span
                                        className={`badge fixed-width-badge ${request.status === 'Completed'
                                            ? 'bg-success'
                                            : request.status === 'Pending'
                                                ? 'bg-danger'
                                                : request.status === 'In Progress'
                                                    ? 'bg-primary'
                                                    : request.status === 'Waiting'
                                                        ? 'bg-warning'
                                                        : 'bg-secondary'
                                            }`}
                                    >
                                        {request.status}
                                    </span></td>
                                    <td>{request.resolved_by?.name}</td>
                                    <td>{request.resolved_date ? new Date(request.resolved_date).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">

                                            <FaRegEye
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowDetails(true);
                                                }}
                                            />

                                            {/* <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setShowAssignModal(true);
                                                }}
                                            >
                                                Assign
                                            </button> */}

                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
                {/* <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Assign Technician</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>

                        {selectedRequest && (
                            <div className="mb-3 p-2 bg-light rounded">
                                <strong>Complaint:</strong> {selectedRequest.issue_complaint?.name}
                            </div>
                        )}

                        <label className="form-label">Select Technician</label>

                        <select
                            className="form-select"
                            value={selectedTechnician || ""}
                            onChange={(e) => setSelectedTechnician(e.target.value)}
                        >
                            <option value="">-- Choose Technician --</option>
                            {technicians.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.typeofissue?.name})
                                </option>
                            ))}
                        </select>

                    </Modal.Body> */}

                    {/* <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
                            Cancel
                        </Button>

                        <Button
                            variant="success"
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem("access_token");

                                    await axios.post(
                                        `${BASE_URL}/assign-complaint/`,
                                        {
                                            complaint_id: selectedRequest.id,
                                            technician_id: selectedTechnician,
                                        },
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );

                                    toast.success("Assigned successfully");
                                    setShowAssignModal(false);
                                } catch (error) {
                                    toast.error("Assignment failed");
                                }
                            }}
                        >
                            Assign
                        </Button>
                    </Modal.Footer> */}
                {/* </Modal> */}
 <Modal
    show={showDetails}
    onHide={() => setShowDetails(false)}
    size="lg"
    centered
>
    <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold">
            Complaint Details
        </Modal.Title>
    </Modal.Header>

    <Modal.Body className="px-4 pb-4">
        {selectedRequest && (
            <div
                style={{
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    overflow: "hidden",
                }}
            >
                <table
                    className="w-100"
                    style={{
                        borderCollapse: "collapse",
                    }}
                >
                    <tbody>

                        {/* Complaint ID */}
                        <tr>
                            <td style={styles.labelCell}>
                                Complaint ID
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.complaint_id || "N/A"}
                            </td>
                        </tr>

                        {/* Department & Institution */}
                        <tr>
                            <td style={styles.labelCell}>
                                Department & Institution
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.department?.name || "N/A"} -{" "}
                                {selectedRequest.institution?.name || "N/A"}
                            </td>
                        </tr>

                        {/* Complainted By */}
                        <tr>
                            <td style={styles.labelCell}>
                                Complainted By
                            </td>

                            <td style={styles.valueCell}>
                                <div className="fw-semibold">
                                    {selectedRequest.complainted_by?.name || "N/A"}
                                </div>

                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#6c757d",
                                        marginTop: "4px",
                                    }}
                                >
                                    📞{" "}
                                    {selectedRequest.complainted_by?.mobile_number || "N/A"}
                                </div>
                            </td>
                        </tr>

                        {/* Complaint */}
                        <tr>
                            <td style={styles.labelCell}>
                                Complaint
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.issue_complaint?.name || "N/A"}
                            </td>
                        </tr>

                        {/* Type of Issue */}
                        <tr>
                            <td style={styles.labelCell}>
                                Type of Issue
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.type_of_issue?.name || "N/A"}
                            </td>
                        </tr>

                        {/* Maintenance Sub Location */}
                        {selectedRequest.type_of_issue?.name === "Maintenance" && (
                            <tr>
                                <td style={styles.labelCell}>
                                    Maintenance Sub Location
                                </td>

                                <td style={styles.valueCell}>
                                    {selectedRequest.Maintenance_sub_loc?.name || "N/A"}
                                </td>
                            </tr>
                        )}

                        {/* Category */}
                        {selectedRequest.type_of_issue?.name === "Maintenance" && (
                            <tr>
                                <td style={styles.labelCell}>
                                    Category
                                </td>

                                <td style={styles.valueCell}>
                                    {selectedRequest.category || "N/A"}
                                </td>
                            </tr>
                        )}

                        {/* Priority */}
                        <tr>
                            <td style={styles.labelCell}>
                                Priority
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.priority ? (
                                    <span
                                        className={`badge ${
                                            selectedRequest.priority === "Emergency"
                                                ? "bg-danger"
                                                : selectedRequest.priority === "Medium"
                                                ? "bg-warning text-dark"
                                                : "bg-success"
                                        }`}
                                    >
                                        {selectedRequest.priority}
                                    </span>
                                ) : (
                                    "N/A"
                                )}
                            </td>
                        </tr>

                        {/* Status */}
                        <tr>
                            <td style={styles.labelCell}>
                                Status
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.status ? (
                                    <span
                                        style={{
                                            color:
                                                selectedRequest.status === "Completed"
                                                    ? "green"
                                                    : selectedRequest.status === "Pending"
                                                    ? "red"
                                                    : "#0d6efd",
                                            fontWeight: "600",
                                        }}
                                    >
                                        {selectedRequest.status}
                                    </span>
                                ) : (
                                    "N/A"
                                )}
                            </td>
                        </tr>

                        {/* Created Date */}
                        <tr>
                            <td style={styles.labelCell}>
                                Created Date & Time
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.date
                                    ? new Date(selectedRequest.date).toLocaleString()
                                    : "N/A"}
                            </td>
                        </tr>

                        {/* Attend Date */}
                        <tr>
                            <td style={styles.labelCell}>
                                Attend Date & Time
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.attend_date
                                    ? new Date(
                                          selectedRequest.attend_date
                                      ).toLocaleString()
                                    : "N/A"}
                            </td>
                        </tr>

                        {/* Attended By */}
                        <tr>
                            <td style={styles.labelCell}>
                                Attended By
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.resolved_by?.name || "N/A"}
                            </td>
                        </tr>

                        {/* Resolved Date */}
                        <tr>
                            <td style={styles.labelCell}>
                                Resolved Date & Time
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.resolved_date
                                    ? new Date(
                                          selectedRequest.resolved_date
                                      ).toLocaleString()
                                    : "N/A"}
                            </td>
                        </tr>

                        {/* Delay Reason */}
                        <tr>
                            <td style={styles.labelCell}>
                                Delay Reason
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.delay_reason || "N/A"}
                            </td>
                        </tr>

                        {/* Remark */}
                        <tr>
                            <td style={styles.labelCell}>
                                Remark
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.remark || "N/A"}
                            </td>
                        </tr>

                        {/* Notes */}
                        <tr>
                            <td style={styles.labelCell}>
                                Notes
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.notes || "N/A"}
                            </td>
                        </tr>

                        {/* Completed Note */}
                        <tr>
                            <td style={styles.labelCell}>
                                Completed Note
                            </td>

                            <td style={styles.valueCell}>
                                {selectedRequest.completed_note || "N/A"}
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        )}
    </Modal.Body>

    <Modal.Footer className="border-0 pt-0">
        <Button
            variant="secondary"
            onClick={() => setShowDetails(false)}
        >
            Close
        </Button>
    </Modal.Footer>
</Modal>
                {/* Pagination Controls */}
           <div className="d-flex justify-content-between align-items-center mt-3">

    {/* LEFT: Pagination numbers */}
    <Pagination
        count={Math.ceil(totalCount / rowsPerPage)}
        page={currentPage}
        onChange={(e, value) => setCurrentPage(value)}
        color="primary"
        siblingCount={1}
        boundaryCount={1}
    />

    {/* RIGHT: Rows per page */}
    <div className="d-flex align-items-center gap-2">
        <span>Rows:</span>
        <select
            value={rowsPerPage}
            onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
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
        </div>
    );
};

export default ComplaintsList;