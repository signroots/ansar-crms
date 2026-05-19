import UsersList from "../../superAdmin/components/userManagement/UsersList";

const departmentAdminUsersContext = {
  eyebrow: "Department Team",
  title: "Department Users",
  subtitle: "Manage the staff and technical users connected with your department workflow.",
};

function DepartmentAdminUsers() {
  return <UsersList roleContext={departmentAdminUsersContext} />;
}

export default DepartmentAdminUsers;
