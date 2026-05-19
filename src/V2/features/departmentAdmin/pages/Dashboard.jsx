import Dashboard from "../../superAdmin/pages/Dashboard";

const departmentAdminDashboardContext = {
  eyebrow: "Department Desk",
  title: "Department Admin Dashboard",
  subtitle: "Track assigned complaints, service requests, and team workload in one view.",
};

function DepartmentAdminDashboard() {
  return <Dashboard roleContext={departmentAdminDashboardContext} />;
}

export default DepartmentAdminDashboard;
