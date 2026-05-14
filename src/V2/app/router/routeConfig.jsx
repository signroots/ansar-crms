import AdminLayout from "../../../Admin/components/layout/Layout";
import Authentication from "../../../Admin/pages/Authentication";
import Complaints from "../../../Admin/pages/Complaints";
import Dashboard from "../../../Admin/pages/Dashboard";
import FeedbackList from "../../../Admin/pages/Feedback";
import Requests from "../../../Admin/pages/Requests";
import StaffManage from "../../../Admin/pages/StaffManage";
import UserManage from "../../../Admin/pages/UserManage";
import Landing from "../../../common/Landing";
import AuthStaff from "../../../Staff/pages/AuthStaff";
import ComplaintHandle from "../../../Staff/pages/ComplaintHandle";
import RequestHandle from "../../../Staff/pages/RequestHandle";
import StaffHome from "../../../Staff/pages/StaffHome";
import StaffProfile from "../../../Staff/pages/StaffProfile";
import StaffLayout from "../../../Staff/components/layout/StaffLayout";
import DepartmentAdminComplaints from "../../../TechAdmin/pages/TechAdminCom";
import DepartmentAdminDashboard from "../../../TechAdmin/pages/dashboard";
import DepartmentAdminRequests from "../../../TechAdmin/pages/TechAdminReq";
import DepartmentAdminUsers from "../../../TechAdmin/pages/TechUserManagement";
import AllComplaints from "../../../User/pages/AllComplaints";
import AllRequests from "../../../User/pages/AllRequests";
import Auth from "../../../User/pages/Auth";
import ComplaintForm from "../../../User/pages/ComplaintForm";
import Home from "../../../User/pages/Home";
import RequestForm from "../../../User/pages/RequestForm";
import UserProfile from "../../../User/pages/UserProfile";
import UserLayout from "../../../User/layout/UserLayout";
import { ROLE_GROUPS, USER_ROLES } from "../../shared/constants/roles";
import ROUTE_PATHS from "./paths";
import ProtectedRoute from "./ProtectedRoute";

const withLayout = (LayoutComponent, page) => <LayoutComponent>{page}</LayoutComponent>;

const protectedElement = (page, options) => <ProtectedRoute {...options}>{page}</ProtectedRoute>;

const superAdminOptions = {
  allowedRoles: ROLE_GROUPS.SUPER_ADMIN,
};

const staffTeacherOptions = {
  allowedRoles: ROLE_GROUPS.STAFF_TEACHER,
};

const technicalStaffOptions = {
  allowedRoles: ROLE_GROUPS.TECHNICAL_STAFF,
};

const departmentAdminOptions = {
  allowedRoles: [...ROLE_GROUPS.DEPARTMENT_ADMIN, USER_ROLES.TECHNICAL_STAFF],
  requireAdmin: true,
};

export const appRoutes = [
  { path: ROUTE_PATHS.login, element: <Landing /> },
  { path: ROUTE_PATHS.superAdmin.auth, element: <Authentication /> },
  { path: ROUTE_PATHS.staffTeacher.login, element: <Auth /> },
  { path: ROUTE_PATHS.technicalStaff.login, element: <AuthStaff /> },

  {
    path: ROUTE_PATHS.superAdmin.dashboard,
    element: protectedElement(withLayout(AdminLayout, <Dashboard />), superAdminOptions),
  },
  {
    path: ROUTE_PATHS.superAdmin.complaints,
    element: protectedElement(withLayout(AdminLayout, <Complaints />), superAdminOptions),
  },
  {
    path: ROUTE_PATHS.superAdmin.requests,
    element: protectedElement(withLayout(AdminLayout, <Requests />), superAdminOptions),
  },
  {
    path: ROUTE_PATHS.superAdmin.users,
    element: protectedElement(withLayout(AdminLayout, <UserManage />), superAdminOptions),
  },
  {
    path: ROUTE_PATHS.superAdmin.staff,
    element: protectedElement(withLayout(AdminLayout, <StaffManage />), superAdminOptions),
  },
  {
    path: ROUTE_PATHS.superAdmin.feedback,
    element: protectedElement(withLayout(AdminLayout, <FeedbackList />), superAdminOptions),
  },
  {
    path: ROUTE_PATHS.superAdmin.feedbackList,
    element: protectedElement(withLayout(AdminLayout, <FeedbackList />), superAdminOptions),
  },

  {
    path: ROUTE_PATHS.staffTeacher.home,
    element: protectedElement(withLayout(UserLayout, <Home />), staffTeacherOptions),
  },
  {
    path: ROUTE_PATHS.staffTeacher.requests,
    element: protectedElement(withLayout(UserLayout, <RequestForm />), staffTeacherOptions),
  },
  {
    path: ROUTE_PATHS.staffTeacher.legacyRequestForm,
    element: protectedElement(withLayout(UserLayout, <RequestForm />), staffTeacherOptions),
  },
  {
    path: ROUTE_PATHS.staffTeacher.complaints,
    element: protectedElement(withLayout(UserLayout, <ComplaintForm />), staffTeacherOptions),
  },
  {
    path: ROUTE_PATHS.staffTeacher.allRequests,
    element: protectedElement(withLayout(UserLayout, <AllRequests />), staffTeacherOptions),
  },
  {
    path: ROUTE_PATHS.staffTeacher.allComplaints,
    element: protectedElement(withLayout(UserLayout, <AllComplaints />), staffTeacherOptions),
  },
  {
    path: ROUTE_PATHS.staffTeacher.profile,
    element: protectedElement(withLayout(UserLayout, <UserProfile />), staffTeacherOptions),
  },

  {
    path: ROUTE_PATHS.technicalStaff.home,
    element: protectedElement(withLayout(StaffLayout, <StaffHome />), technicalStaffOptions),
  },
  {
    path: ROUTE_PATHS.technicalStaff.tasks,
    element: protectedElement(withLayout(StaffLayout, <ComplaintHandle />), technicalStaffOptions),
  },
  {
    path: ROUTE_PATHS.technicalStaff.requests,
    element: protectedElement(withLayout(StaffLayout, <RequestHandle />), technicalStaffOptions),
  },
  {
    path: ROUTE_PATHS.technicalStaff.profile,
    element: protectedElement(withLayout(StaffLayout, <StaffProfile />), technicalStaffOptions),
  },

  {
    path: ROUTE_PATHS.departmentAdmin.dashboard,
    element: protectedElement(
      withLayout(AdminLayout, <DepartmentAdminDashboard />),
      departmentAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.departmentAdmin.complaints,
    element: protectedElement(
      withLayout(AdminLayout, <DepartmentAdminComplaints />),
      departmentAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.departmentAdmin.requests,
    element: protectedElement(
      withLayout(AdminLayout, <DepartmentAdminRequests />),
      departmentAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.departmentAdmin.users,
    element: protectedElement(
      withLayout(AdminLayout, <DepartmentAdminUsers />),
      departmentAdminOptions,
    ),
  },
];
