import { Table } from 'react-bootstrap';

function TableList() {
  const data = [
    { id: 1, name: 'Sanin', email: 'Sanin@example.com', status: 'Active' },
    { id: 2, name: 'Dummy', email: 'Dummy@example.com', status: 'Inactive' },
    { id: 3, name: 'Ramu', email: 'Ramu@example.com', status: 'Active' },
    { id: 4, name: 'Sanin', email: 'Sanin@example.com', status: 'Pending' },
    { id: 5, name: 'Sanabil', email: 'Sanabil@example.com', status: 'Active' },
    { id: 6, name: 'Dummy', email: 'Dummy@example.com', status: 'Inactive' },
    { id: 7, name: 'Ramu', email: 'Ramu@example.com', status: 'Active' },
    { id: 8, name: 'Sanin', email: 'Sanin@example.com', status: 'Pending' },
  ];

  return (
    <div
      className=" w-100 mt-3"
      style={{
        borderRadius: "1rem",
        backgroundColor: "white",
        padding: "1rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h5 className="mb-2">Todays</h5>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} >
              <td >{row.id}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>
                <span
                  className={`badge ${
                    row.status === "Active"
                      ? "bg-success"
                      : row.status === "Pending"
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default TableList;
