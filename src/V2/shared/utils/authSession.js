import { USER_ROLES } from "../constants/roles";
import { LEGACY_TOKEN_KEYS, STORAGE_KEYS } from "../constants/storageKeys";

const readBoolean = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "false") === true;
  } catch {
    return false;
  }
};

const getFirstStoredValue = (keys) => {
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
};

export const getAuthSession = () => ({
  accessToken: getFirstStoredValue([STORAGE_KEYS.ACCESS_TOKEN, ...LEGACY_TOKEN_KEYS]),
  role: getFirstStoredValue([STORAGE_KEYS.ROLE, STORAGE_KEYS.USER_ROLE]),
  staffId: localStorage.getItem(STORAGE_KEYS.STAFF_ID),
  isAdmin: readBoolean(STORAGE_KEYS.IS_ADMIN),
  typeOfIssueId: localStorage.getItem(STORAGE_KEYS.TYPE_OF_ISSUE_ID),
  typeOfIssue: localStorage.getItem(STORAGE_KEYS.TYPE_OF_ISSUE),
});

export const getAuthenticatedHomePath = ({ role, isAdmin = false } = getAuthSession()) => {
  if (role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.SUPER_ADMIN_LABEL) {
    return "/admin/dashboard";
  }

  if (role === USER_ROLES.TECHNICAL_STAFF) {
    return isAdmin ? "/tech-admin/dashboard" : "/tech-support/tech-support-home";
  }

  if (
    role === USER_ROLES.STAFF ||
    role === USER_ROLES.TEACHER ||
    role === USER_ROLES.DEPARTMENT_HEAD
  ) {
    return "/user/user-home";
  }

  if (role === USER_ROLES.DEPARTMENT_ADMIN) {
    return "/tech-admin/dashboard";
  }

  return "/login";
};

export const clearAuthSession = () => {
  [
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.ROLE,
    STORAGE_KEYS.USER_ROLE,
    STORAGE_KEYS.STAFF_ID,
    STORAGE_KEYS.IS_ADMIN,
    STORAGE_KEYS.TYPE_OF_ISSUE_ID,
    STORAGE_KEYS.TYPE_OF_ISSUE,
    STORAGE_KEYS.ADMIN_REFRESH_TOKEN,
    ...LEGACY_TOKEN_KEYS,
  ].forEach((key) => localStorage.removeItem(key));
};

export const setAuthSession = ({
  accessToken,
  role,
  staffId,
  isAdmin = false,
  typeOfIssueId,
  typeOfIssue,
}) => {
  clearAuthSession();

  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

    if (role === USER_ROLES.SUPER_ADMIN) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, accessToken);
    }

    if (
      role === USER_ROLES.STAFF ||
      role === USER_ROLES.TEACHER ||
      role === USER_ROLES.DEPARTMENT_HEAD
    ) {
      localStorage.setItem(STORAGE_KEYS.USER_ACCESS_TOKEN, accessToken);
    }

    if (role === USER_ROLES.TECHNICAL_STAFF) {
      localStorage.setItem(STORAGE_KEYS.TECH_SUPPORT_ACCESS_TOKEN, accessToken);
    }
  }

  if (role) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }

  if (staffId) {
    localStorage.setItem(STORAGE_KEYS.STAFF_ID, staffId);
  }

  localStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(isAdmin));

  if (typeOfIssueId) {
    localStorage.setItem(STORAGE_KEYS.TYPE_OF_ISSUE_ID, String(typeOfIssueId));
  }

  if (typeOfIssue) {
    localStorage.setItem(STORAGE_KEYS.TYPE_OF_ISSUE, typeOfIssue);
  }
};
