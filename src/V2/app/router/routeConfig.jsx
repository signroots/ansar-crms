import Landing from "../../features/auth/pages/Landing";
import SuperAdminLayout from "../../features/superAdmin/components/layout/Layout";
import SuperAdminComplaints from "../../features/superAdmin/pages/Complaints";
import SuperAdminDashboard from "../../features/superAdmin/pages/Dashboard";
import SuperAdminFeedbackList from "../../features/superAdmin/pages/Feedback";
import SuperAdminRequests from "../../features/superAdmin/pages/Requests";
import SuperAdminStaffManage from "../../features/superAdmin/pages/StaffManage";
import SuperAdminUserManage from "../../features/superAdmin/pages/UserManage";
import StaffLayout from "../../features/technicalStaff/layout/StaffLayout";
import ComplaintHandle from "../../features/technicalStaff/pages/ComplaintHandle";
import RequestHandle from "../../features/technicalStaff/pages/RequestHandle";
import StaffHome from "../../features/technicalStaff/pages/StaffHome";
import StaffProfile from "../../features/technicalStaff/pages/StaffProfile";
import { ROLE_GROUPS, USER_ROLES } from "../../shared/constants/roles";
import ROUTE_PATHS from "./paths";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { v1RouteAdapters } from "./v1RouteAdapters";

const {
  DepartmentAdminComplaints,
  DepartmentAdminDashboard,
  DepartmentAdminRequests,
  DepartmentAdminUsers,
  AllComplaints,
  AllRequests,
  ComplaintForm,
  Home,
  RequestForm,
  UserProfile,
  UserLayout,
} = v1RouteAdapters;

const withLayout = (LayoutComponent, page) => <LayoutComponent>{page}</LayoutComponent>;

const protectedElement = (page, options) => <ProtectedRoute {...options}>{page}</ProtectedRoute>;
const publicElement = (page) => <PublicRoute>{page}</PublicRoute>;

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
  { path: ROUTE_PATHS.login, element: publicElement(<Landing />) },
  { path: ROUTE_PATHS.superAdmin.auth, element: publicElement(<Landing />) },
  { path: ROUTE_PATHS.staffTeacher.login, element: publicElement(<Landing />) },
  { path: ROUTE_PATHS.technicalStaff.login, element: publicElement(<Landing />) },

  {
    path: ROUTE_PATHS.superAdmin.dashboard,
    element: protectedElement(
      withLayout(SuperAdminLayout, <SuperAdminDashboard />),
      superAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.superAdmin.complaints,
    element: protectedElement(
      withLayout(SuperAdminLayout, <SuperAdminComplaints />),
      superAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.superAdmin.requests,
    element: protectedElement(
      withLayout(SuperAdminLayout, <SuperAdminRequests />),
      superAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.superAdmin.users,
    element: protectedElement(
      withLayout(SuperAdminLayout, <SuperAdminUserManage />),
      superAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.superAdmin.staff,
    element: protectedElement(
      withLayout(SuperAdminLayout, <SuperAdminStaffManage />),
      superAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.superAdmin.feedback,
    element: protectedElement(
      withLayout(SuperAdminLayout, <SuperAdminFeedbackList />),
      superAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.superAdmin.feedbackList,
    element: protectedElement(
      withLayout(SuperAdminLayout, <SuperAdminFeedbackList />),
      superAdminOptions,
    ),
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
      withLayout(SuperAdminLayout, <DepartmentAdminDashboard />),
      departmentAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.departmentAdmin.complaints,
    element: protectedElement(
      withLayout(SuperAdminLayout, <DepartmentAdminComplaints />),
      departmentAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.departmentAdmin.requests,
    element: protectedElement(
      withLayout(SuperAdminLayout, <DepartmentAdminRequests />),
      departmentAdminOptions,
    ),
  },
  {
    path: ROUTE_PATHS.departmentAdmin.users,
    element: protectedElement(
      withLayout(SuperAdminLayout, <DepartmentAdminUsers />),
      departmentAdminOptions,
    ),
  },
];
