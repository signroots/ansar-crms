import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, ButtonGroup, Dropdown, DropdownButton, FormControl, Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import BASE_URL from '../../../utils/baseUrl';
import { FaRegEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import CreateRequests from './CreateRequests';
import Pagination from "@mui/material/Pagination";
const RequestsList = () => {
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
    const [newDelayReason, setNewDelayReason] = useState('');
    const [showSubmitButton, setShowSubmitButton] = useState(false);
const [showDetails, setShowDetails] = useState(false);
const [totalCount, setTotalCount] = useState(0);
    // Fetch existing service requests
    const fetchServiceRequests = async () => {
    try {
        const token = localStorage.getItem("access_token");

        if (!token) {
            throw new Error("Authentication credentials were not provided.");
        }

        const response = await axios.get(
            `${BASE_URL}/api/requests-list/?page=${currentPage}&page_size=${rowsPerPage}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setServiceRequests(response.data.results || []);
        setTotalCount(response.data.count || 0);

    } catch (error) {
        console.error('Error fetching service requests:', error);
        toast.error("Please log in to view service requests.");
    } finally {
        setLoading(false);
    }
};
    // Handle SSE event for real-time updates
    useEffect(() => {
        fetchServiceRequests();

       const eventSource = new EventSource(
    `${BASE_URL}/api/sse/request/`
);

        eventSource.onmessage = function (event) {
            console.log('New service request received:', event.data);  // Log the raw data
            const newRequest = JSON.parse(event.data);  // Parse the new request data

            // Update the state with the new request, ensuring no duplication
            setServiceRequests((prevRequests) => {

    const exists = prevRequests.some(
        (req) => req.id === newRequest.id
    );

    if (exists) {
        return prevRequests;
    }

    // ADD NEW REQUEST ON TOP
    const updatedRequests = [
        newRequest,
        ...prevRequests
    ];

    return updatedRequests;
});

// REFRESH CURRENT PAGE DATA
fetchServiceRequests();
        };

        eventSource.onerror = function (error) {
            console.error('Error in SSE connection:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [currentPage, rowsPerPage]);

    // Frontend search filter
    const filteredData = serviceRequests.filter((request) => {
        const department = request.department ? String(request.department.name).toLowerCase() : '';
        const issueRequest = request.issue_request ? String(request.issue_request.name).toLowerCase() : '';
        const searchTerm = search.toLowerCase();
        return department.includes(searchTerm) || issueRequest.includes(searchTerm);
    });

    // Pagination logic

    const currentRows = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);


   
    // Handle rows per page change
    const handleRowsPerPageChange = (e) => {
        setRowsPerPage(Number(e));
        setCurrentPage(1);  // Reset to first page when rows per page change
    };

    // For selected request with id
  const handleRowClick = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);   // ✅ OPEN MODAL
};

    // Handle status change
    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;
        const token = localStorage.getItem("access_token");

        try {
            const response = await axios.patch(
                `${BASE_URL}/api/request/${selectedRequest.id}/update-status-admin/`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSelectedRequest({ ...selectedRequest, status: newStatus });
            setServiceRequests((prevRequests) =>
                prevRequests.map((task) =>
                    task.id === selectedRequest.id ? { ...task, status: newStatus } : task
                )
            );

            toast.success("Status updated successfully:", response.data);
        } catch (error) {
            toast.error("Error updating status:", error);
            console.error("Error updating status:", error);
        }
    };

    // Handle delay reason change
    const handleDelayReasonChange = (e) => {
        const value = e.target.value;
        setNewDelayReason(value);
        setShowSubmitButton(value.trim().length > 0);
    };

    // Handle delay reason update
    const handleReasonUpdate = async () => {
        const token = localStorage.getItem("access_token");

        try {
            const newReason = newDelayReason;

            const response = await axios.patch(
                `${BASE_URL}/api/request/${selectedRequest.id}/update-delay-admin/`,
                { delay_reason: newReason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updatedRequest = response.data;

            setSelectedRequest((prev) => ({
                ...prev,
                delay_reason: updatedRequest.delay_reason,
            }));

            setDelayReasons(updatedRequest.delay_reason);
            setNewDelayReason("");
            setShowSubmitButton(false);
            toast.success("Reason updated successfully");

        } catch (error) {
            console.error("Error submitting delay reason:", error);
        }
    };

    // Mark as viewed
    const markAsViewed = async (requestId) => {
        try {
            const response = await axios.patch(
                `${BASE_URL}/api/requests/${requestId}/mark-as-viewed/`,
                {}
            );

            if (response.status === 200) {
                console.log("Request marked as viewed successfully.");
            } else {
                console.error("Error:", response.data);
            }
        } catch (error) {
            console.error("Request failed:", error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="mt-5" style={{ backgroundColor: "#fcfcfc", minHeight: "80vh", padding: "20px", fontSize: '13px' }}>
            <h6>Requests</h6>
            <small>Live Request tracking & management.</small>
            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                <div className="d-flex justify-content-between align-items-center">
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
                        onSelect={handleRowsPerPageChange}
                    >
                        <Dropdown.Item eventKey="5">5</Dropdown.Item>
                        <Dropdown.Item eventKey="10">10</Dropdown.Item>
                        <Dropdown.Item eventKey="20">20</Dropdown.Item>
                        <Dropdown.Item eventKey="50">50</Dropdown.Item>
                    </DropdownButton> */}
                </div>
                <div className="d-flex flex-row">
                    <CreateRequests />
                    <Button variant="secondary" className="ms-2" size="sm" onClick={() => setShowExportModal(true)}>
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
                            <th>Requests</th>
                            <th>Status</th>
                            <th>Attended by</th>
                            <th>Resolved Date</th>
                            <th>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((request, index) => (
                            <tr key={request.id}>
                                <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                <td>{new Date(request.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td>{request.institution?.name} - {request.department?.name}</td>
                                <td>{request.issue_request?.name}</td>
                                <td> <span
                                            className={`badge fixed-width-badge ${ request.status === 'Completed'
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
                                <td>{request.resolved_date ? new Date(request.resolved_date).toLocaleDateString('en-GB') : 'N/A'}</td>
                                <td
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
    if (!request.is_viewed) {
        markAsViewed(request.id);
    }

    setSelectedRequest(request);
    setShowDetails(true);   // ✅ OPEN MODAL
}}
                                >
                                    <FaRegEye />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
<Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
    <Modal.Header closeButton>
        <Modal.Title>Request Details</Modal.Title>
    </Modal.Header>

    <Modal.Body>
        {selectedRequest && (
            <div className="p-2">

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <div>
                        <h6 className="mb-0 fw-bold">Request Details</h6>
                        <small className="text-muted">
                            {selectedRequest.request_id}
                        </small>
                    </div>

                    <span className={`px-3 py-1 rounded-pill text-white small
                        ${selectedRequest.status === "Completed"
                            ? "bg-success"
                            : selectedRequest.status === "Pending"
                                ? "bg-danger"
                                : selectedRequest.status === "In Progress"
                                    ? "bg-primary"
                                    : "bg-secondary"
                        }`}
                    >
                        {selectedRequest.status}
                    </span>
                </div>

                <div className="row g-4">

                    {/* LEFT */}
                    <div className="col-md-6">

                        <div className="mb-3">
                            <div className="text-muted small">Date</div>
                            <div className="fw-semibold">
                                {new Date(selectedRequest.date).toLocaleString()}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-muted small">Institution</div>
                            <div className="fw-semibold">
                                {selectedRequest.institution?.name || "N/A"}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-muted small">Department</div>
                            <div className="fw-semibold">
                                {selectedRequest.department?.name || "N/A"}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-muted small">Issue</div>
                            <div className="fw-semibold">
                                {selectedRequest.issue_request?.name || "N/A"}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="col-md-6">

                        <div className="mb-3">
                            <div className="text-muted small">Priority</div>
                            <div className="fw-semibold">
                                {selectedRequest.priority || "N/A"}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-muted small">Resolved By</div>
                            <div className="fw-semibold">
                                {selectedRequest.resolved_by?.name || "N/A"}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-muted small">Resolved Date</div>
                            <div className="fw-semibold">
                                {selectedRequest.resolved_date
                                    ? new Date(selectedRequest.resolved_date).toLocaleString()
                                    : "N/A"}
                            </div>
                        </div>

                    </div>

                    {/* FULL WIDTH */}
                    <div className="col-12">
                        <hr />

                        <div className="mb-3">
                            <div className="text-muted small">Notes</div>
                            <div className="p-2 bg-light rounded">
                                {selectedRequest.notes || "No notes"}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-muted small">Program Name</div>
                            <div className="p-2 bg-light rounded">
                                {selectedRequest.program_name || "N/A"}
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-muted small">Program Date / Time</div>
                            <div className="p-2 bg-light rounded">
                                {selectedRequest.program_date || "N/A"} {selectedRequest.program_time || ""}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        )}
    </Modal.Body>

    <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
        </Button>
    </Modal.Footer>
</Modal>
            <div className="d-flex justify-content-between align-items-center mt-3">

    {/* LEFT SIDE PAGINATION */}
    <Pagination
        count={Math.ceil(totalCount / rowsPerPage)}
        page={currentPage}
        onChange={(e, value) => setCurrentPage(value)}
        color="primary"
        siblingCount={1}
        boundaryCount={1}
    />

    {/* RIGHT SIDE ROWS */}
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
    );
};

export default RequestsList;