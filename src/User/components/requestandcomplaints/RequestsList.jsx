import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, ButtonGroup, Dropdown, DropdownButton, FormControl, Modal, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import BASE_URL from '../../../utils/baseUrl';
import { FaRegEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import CreateRequests from './CreateRequests';

const RequestsList = () =>
{
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
    // to manage selected id from table for modal view
    const [selectedRequest, setSelectedRequest] = useState(null);
    // Manage an array of delay reasons
    const [delayReasons, setDelayReasons] = useState([]);
    const [newDelayReason, setNewDelayReason] = useState("");
    // for submit delay reason
    const [showSubmitButton, setShowSubmitButton] = useState(false);



    // Fetch existing service requests
    const fetchServiceRequests = async () =>
    {
        try
        {
            const response = await axios.get(`${ BASE_URL }/api/requests-list/`);
            setServiceRequests(response.data);
        } catch (error)
        {
            console.error('Error fetching service requests:', error);
        } finally
        {
            setLoading(false);
        }
    };

    // handle sse event realtime update 
    useEffect(() =>
    {
        fetchServiceRequests();

        // Setup SSE for real-time updates
        const eventSource = new EventSource(`${ BASE_URL }/api/sse/request/`);

        eventSource.onmessage = function (event)
        {
            console.log('New service request received:', event.data);  // Log the raw data
            const newRequest = JSON.parse(event.data);  // Parse the new request data

            // Update the state with the new request, ensuring no duplication
            setServiceRequests((prevRequests) =>
            {
                const ids = new Set(prevRequests.map(req => req.id));
                // If the new request is already in the list, do not add it again
                return ids.has(newRequest.id) ? prevRequests : [...prevRequests, newRequest];
            });
        };

        eventSource.onerror = function (error)
        {
            console.error('Error in SSE connection:', error);
            eventSource.close();
        };

        // Cleanup: Close the SSE connection when the component unmounts
        return () =>
        {
            eventSource.close();
        };
    }, []);

    useEffect(() =>
    {
        console.log('Updated service requests:', serviceRequests);
    }, [serviceRequests]);


    // Frontend search
    const filteredData = serviceRequests.filter((request) =>
    {
        const department = request.department ? String(request.department.name).toLowerCase() : '';
        const issueRequest = request.issue_request ? String(request.issue_request.name).toLowerCase() : '';
        const searchTerm = search.toLowerCase();
        return department.includes(searchTerm) || issueRequest.includes(searchTerm);
    });


    // Filter date for export
    const filterByDateRange = (data) =>
    {
        if (startDate && endDate)
        {
            return data.filter((request) =>
            {
                const requestDate = new Date(request.date);
                return requestDate >= new Date(startDate) && requestDate <= new Date(endDate);
            });
        }
        return data;
    };


    // Export table data to excel
    const handleExport = () =>
    {
        if (!startDate || !endDate || new Date(startDate) > new Date(endDate))
        {
            setWarningMessage('Invalid date range! Please ensure "From Date" is before "To Date".');
            return;
        }

        const dataToExport = filterByDateRange(filteredData).map((request) => ({
            ID: request.id,
            Date: new Date(request.date).toLocaleString(),
            Department: request.department ? request.department.name : 'N/A',
            Institution: request.institution ? request.institution.name : 'N/A',
            RequestRequest: request.issue_request ? request.issue_request.name : 'N/A',
            Status: request.status,
            ResolvedBy: request.resolved_by ? request.resolved_by.name : 'N/A',
            ResolvedDate: request.resolved_date ? new Date(request.resolved_date).toLocaleString() : 'N/A',
        }));

        if (dataToExport.length === 0)
        {
            setWarningMessage('No data available for the selected date range.');
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');
        XLSX.writeFile(workbook, 'Requests.xlsx');
        setShowExportModal(false);
    };

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // For handle page change (pagination)
    const handlePageChange = (pageNumber) =>
    {
        if (pageNumber > 0 && pageNumber <= totalPages)
        {
            setCurrentPage(pageNumber);
        }
    };


    // For handle selected request with id
    const handleRowClick = (request) =>
    {
        setSelectedRequest(request);
        // update delayReasons selectedRequest's data
        setDelayReasons(request.delay_reason || []);
        setShowTableModal(true);
    };


    // handle status change
    const handleStatusChange = async (event) =>
    {
        const newStatus = event.target.value;
        const token = localStorage.getItem("access_token");

        try
        {
            const response = await axios.patch(
                `${ BASE_URL }/api/request/${ selectedRequest.id }/update-status-admin/`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${ token }`,
                    },
                }
            );

            // Update the state with the new status
            setSelectedRequest({ ...selectedRequest, status: newStatus });
            setServiceRequests((prevRequests) =>
                prevRequests.map((task) =>
                    task.id === selectedRequest.id ? { ...task, status: newStatus } : task
                )
            );

            toast.success("Status updated successfully:", response.data);
        } catch (error)
        {
            toast.error("Error updating status:", error);
            console.error("Error updating status:", error);
        }
    };

    // For update delay reason on selectedRequest
    useEffect(() =>
    {
        if (selectedRequest?.delay_reason)
        {
            try
            {
                setDelayReasons(selectedRequest.delay_reason);
            } catch (error)
            {
                console.error("Error  delay_reason:", error);
            }
        }
    }, [selectedRequest]);



    // Handle delay_reason value/submit button 
    const handleDelayReasonChange = (e) =>
    {
        const value = e.target.value;
        setNewDelayReason(value);
        // Show button only if new input
        setShowSubmitButton(value.trim().length > 0);
    };


    // Handle update delay_reason
    const handleReasonUpdate = async () =>
    {
        const token = localStorage.getItem("access_token");

        try
        {
            const newReason = newDelayReason;

            // Update delay_reason on the backend
            const response = await axios.patch(
                `${ BASE_URL }/api/request/${ selectedRequest.id }/update-delay-admin/`,
                { delay_reason: newReason },
                {
                    headers: {
                        Authorization: `Bearer ${ token }`,
                    },
                }
            );

            // Get the updated complaint data from the backend 
            const updatedComplaint = response.data;

            // Update selectedRequest locally with the full updated delay_reason list
            setSelectedRequest((prev) => ({
                ...prev,
                delay_reason: updatedComplaint.delay_reason,
            }));

            // Update delayReasons state locally to reflect the change
            setDelayReasons(updatedComplaint.delay_reason);

            // Clear the input field and UI state
            setNewDelayReason("");
            setShowSubmitButton(false);
            toast.success("Reason updated successfully");

        } catch (error)
        {
            console.error("Error submitting delay reason:", error);
        }
    };

    // update is_view to true () 
    const markAsViewed = async (requestId) =>
    {
        try
        {
            const response = await axios.patch(
                `${ BASE_URL }/api/requests/${ requestId }/mark-as-viewed/`,
                {}
            );

            if (response.status === 200)
            {
                console.log("Request marked as viewed successfully.");
            } else
            {
                console.error("Error:", response.data);
            }
        } catch (error)
        {
            console.error("Request failed:", error.response ? error.response.data : error.message);
        }
    };

    const handleCloseModal = () =>
    {
        setShowModal(false); // or however you're controlling modal visibility
    };


    // handle close table modal
    const handleCloseTableModal = () =>
    {
        setShowTableModal(false);
        setNewDelayReason('')
    }


    return (
        <div
            className="mt-5 "
            style={{ backgroundColor: "#fcfcfc", minHeight: "80vh", padding: "20px", margin: "auto", fontSize: '13px', }}
        >
            <h6>Requests</h6>
            <small>Live Request tracking & management.</small>
            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">

                <div className='d-flex justify-content-between align-items-center'>
                    <FormControl
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '250px', boxShadow: 'none', fontSize: '15px' }}
                    />
                    <DropdownButton
                        id="row-count-dropdown"
                        title={`Rows: ${ rowsPerPage }`}
                        variant="outline"
                        size="sm"
                        onSelect={(value) => setRowsPerPage(Number(value))}
                    >
                        <Dropdown.Item eventKey="5">5</Dropdown.Item>
                        <Dropdown.Item eventKey="10">10</Dropdown.Item>
                        <Dropdown.Item eventKey="20">20</Dropdown.Item>
                        <Dropdown.Item eventKey="50">50</Dropdown.Item>
                    </DropdownButton>
                </div>
                <div className='d-flex flex-row'>
                    <CreateRequests />
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
                                    {/* Serial Number for Pagination */}
                                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>

                                    <td
                                        style={{
                                            padding: '0',
                                            margin: '0',
                                            maxWidth: '150px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        
                                        <span style={{ fontWeight: 'bold' }}>
                                            {new Date(request.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>{" "}
                                        -{" "}
                                        <span style={{ color: 'black' }}>
                                            {new Date(request.date).toLocaleTimeString('en-GB', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </span>{" "}
                                        <small className="badge text-bg-success">
                                            {request && !request.is_viewed ? 'new' : null}
                                        </small>
                                    </td>

                                    <td>
                                        <b>{request.institution ? request.institution.name : null}</b>{" - "}
                                        {request.department ? request.department.name : null}
                                    </td>

                                    <td>{request.issue_request ? request.issue_request.name : 'N/A'}</td>

                                    <td>
                                        <span
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
                                        </span>
                                    </td>

                                    <td>{request.resolved_by ? request.resolved_by.name : 'N/A'}</td>

                                    <td>
                                        {request.resolved_date ? (
                                            <>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {new Date(request.resolved_date).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>{" "}
                                                -{" "}
                                                <span style={{ color: 'black' }}>
                                                    {new Date(request.resolved_date).toLocaleTimeString('en-GB', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </span>
                                            </>
                                        ) : (
                                            <span style={{ color: 'gray' }}>{''}</span>
                                        )}
                                    </td>

                                    <td
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                        {
                                            if (!request.is_viewed)
                                            {
                                                markAsViewed(request.id);
                                                fetchServiceRequests();
                                            }
                                            handleRowClick(request);
                                            fetchServiceRequests();
                                        }}
                                        
                                    >
                              
                                        <FaRegEye />
                                    </td>
                                </tr>
                            ))}
                            
                        </tbody>

                </Table>
            )}

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
                            className={`btn btn-sm custom-pagination-btn ${ currentPage === index + 1 ? 'active' : ''
                                }`}
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

            <Modal show={showTableModal} onHide={handleCloseTableModal} centered size="lg">
                {/* Modal Header with custom hover style */}
                <Modal.Header closeButton className="custom-close-header">
                </Modal.Header>

                <Modal.Body>
                    {/* Modal content here */}
                </Modal.Body>

                {/* Custom hover style */}
                <style>
                    {`
            .custom-close-header .btn-close:hover {
                filter: brightness(0) saturate(100%) invert(19%) sepia(92%) saturate(6371%) hue-rotate(357deg) brightness(97%) contrast(107%);
            }
        `}
                </style>
                <Modal.Body>
                   
                    {selectedRequest && (
                        <div className="p-3">
                            {/* Header: ID and Date */}
                            <div className="d-flex justify-content-between mb-3">
                                <p className="mb-0">
                                    <strong>ID:</strong> {selectedRequest.id}
                                </p>
                                <p className="mb-0">
                                    <strong>Date:</strong>{" "}
                                    {new Date(selectedRequest.date).toLocaleString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    }).replace(",", "")}
                                </p>
                            </div>

                            {/* Data in Table Format */}
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <td>
                                            <strong>Department:</strong>
                                        </td>
                                        <td>
                                            {selectedRequest.department ? selectedRequest.department.name : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Request:</strong>
                                        </td>
                                        <td>
                                            {selectedRequest.issue_request ? selectedRequest.issue_request.name : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Program Name:</strong>
                                        </td>
                                        <td>
                                            {selectedRequest.program_name ? selectedRequest.program_name : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Program Date:</strong>
                                        </td>
                                        <td>
                                            {selectedRequest.program_date ? selectedRequest.program_date : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Program Time:</strong>
                                        </td>
                                        <td>
                                            {selectedRequest.program_time ? selectedRequest.program_time : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Requested by:</strong>
                                        </td>
                                        <td>
                                            {selectedRequest.requested_by.name ? selectedRequest.requested_by.name : "N/A"}

                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Status:</strong>
                                        </td>
                                        <td className="status_table_row">
                                            {selectedRequest.status === "Pending" ? (
                                                <h6 className="text-danger">{selectedRequest.status}</h6>
                                            ) : selectedRequest.status === "Completed" ? (
                                                <h6 className="text-success">{selectedRequest.status}</h6>
                                            ) : selectedRequest.status === "Cancelled" ? (
                                                <h6 className="text-secondary">{selectedRequest.status}</h6>
                                            ) : (
                                                <select
                                                    className={`form-select ${ selectedRequest.status === "In Progress"
                                                        ? "text-primary"
                                                        : selectedRequest.status === "Waiting"
                                                            ? "text-warning"
                                                            : ""
                                                        }`}
                                                    value={selectedRequest.status}
                                                    onChange={handleStatusChange}
                                                >
                                                    <option className="text-dark" value="Cancelled">
                                                        Cancel
                                                    </option>
                                                    <option className="text-dark" value="Waiting">
                                                        Waiting
                                                    </option>
                                                    <option className="text-dark" value="In Progress" disabled hidden>
                                                        In Progress
                                                    </option>
                                                    <option className="text-dark" value="Completed">
                                                        Completed
                                                    </option>
                                                </select>
                                            )}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <strong>Attended by :</strong>
                                        </td>
                                        <td>
                                            {selectedRequest.resolved_by ? selectedRequest.resolved_by.name : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <strong>Resolved Date:</strong>
                                        </td>
                                        <td>
                                            {selectedRequest.resolved_date
                                                ? new Date(selectedRequest.resolved_date).toLocaleString()
                                                : 'N/A'}
                                        </td>
                                    </tr>
                                </tbody>
                                {/* Notes as a full-width row */}
                                <tfoot>
                                    <tr>
                                        <td colSpan="2">
                                            <strong>Notes:</strong> {selectedRequest.notes}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                            {/* Show Delay Reasons only if status is "waiting" */}
                            {selectedRequest.status === "Waiting" && (
                                <div>
                                    <div className="mb-3">
                                        <p className='mb-2 fw-bold'>Delay Reasons</p>
                                        <div className="border p-2"
                                            style={{
                                                maxHeight: "200px",
                                                overflowY: "auto",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                padding: "5px",
                                            }}
                                        >
                                            {delayReasons.length > 0 ? (
                                                delayReasons.map((remarks, index) => (
                                                    <div
                                                        key={index}
                                                        className="d-flex justify-content-between align-items-center border-bottom py-2"
                                                    >
                                                        <div>
                                                            {remarks.reason}
                                                        </div>
                                                        <div>
                                                            <small className="text-muted">
                                                                {new Date(remarks.created_at).toLocaleString("en-GB", {
                                                                    day: "numeric",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                }).replace(",", "")}
                                                            </small>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <small className="text-muted">No delay reasons available.</small>
                                            )}
                                        </div>
                                    </div>
                                    <textarea
                                        className="form-control my-2"
                                        value={newDelayReason}
                                        onChange={handleDelayReasonChange}
                                        placeholder="Enter delay reason"
                                        rows="3"
                                    />
                                    {showSubmitButton && (
                                        <div className="text-center mt-3">
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={handleReasonUpdate}
                                            >
                                                Submit Delay Reason
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <style>
                    {`.modal-content {background: white;}`}
                </style>

            </Modal>

            <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
                <Modal.Body>
                    <small>Select Date Range for Export</small>
                    <div className="d-flex gap-3 mt-3">
                        <FormControl
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <FormControl
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="d-flex justify-content-end mt-3">
                        <Button variant="secondary" size="sm" onClick={handleExport}>
                            Export
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default RequestsList;
