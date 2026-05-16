const ROUTE_PATHS = {
  root: "/",
  login: "/login",
  notFound: "*",

  superAdmin: {
    auth: "/admin/auth",
    dashboard: "/admin/dashboard",
    complaints: "/admin/complaints",
    requests: "/admin/requests",
    users: "/admin/user-manage",
    staff: "/admin/staff-manage",
    feedback: "/ansar/feedback-manage",
    feedbackList: "/ansar/feedback-manage/list",
  },

  staffTeacher: {
    // login: "/user/user-login",
    home: "/user/user-home",
    requests: "/user/user-requests",
    legacyRequestForm: "/user/user-/user/admin/requests",
    complaints: "/user/user-complaints",
    allRequests: "/user/user-all-requests",
    allComplaints: "/user/user-all-complaints",
    profile: "/user/user-profile",
  },

  technicalStaff: {
    login: "/tech-support/tech-support-login",
    home: "/tech-support/tech-support-home",
    tasks: "/tech-support/tech-support-tasks",
    requests: "/tech-support/tech-support-request",
    profile: "/tech-support/tech-support-profile",
  },

  departmentAdmin: {
    dashboard: "/tech-admin/dashboard",
    complaints: "/tech-admin/complaints",
    requests: "/tech-admin/requests",
    users: "/tech-admin/users",
  },
};

export default ROUTE_PATHS;
