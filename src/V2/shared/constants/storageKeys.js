export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  ADMIN_ACCESS_TOKEN: "admin_access_token",
  USER_ACCESS_TOKEN: "user_access_token",
  TECH_SUPPORT_ACCESS_TOKEN: "ts_access_token",
  TECH_ADMIN_ACCESS_TOKEN: "tech_access_token",
  REFRESH_TOKEN: "refresh_token",
  ADMIN_REFRESH_TOKEN: "admin_refresh_token",
  ROLE: "role",
  USER_ROLE: "user_role",
  STAFF_ID: "staff_id",
  IS_ADMIN: "is_admin",
  TYPE_OF_ISSUE_ID: "type_of_issue_id",
  TYPE_OF_ISSUE: "type_of_issue",
  UI_THEME: "ui_theme",
};

export const LEGACY_TOKEN_KEYS = [
  STORAGE_KEYS.ADMIN_ACCESS_TOKEN,
  STORAGE_KEYS.USER_ACCESS_TOKEN,
  STORAGE_KEYS.TECH_SUPPORT_ACCESS_TOKEN,
  STORAGE_KEYS.TECH_ADMIN_ACCESS_TOKEN,
];
