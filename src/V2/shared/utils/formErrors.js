const GENERAL_ERROR_KEYS = new Set([
  "detail",
  "error",
  "errors",
  "message",
  "non_field_errors",
  "nonFieldErrors",
]);

export const getErrorText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(getErrorText).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value).map(getErrorText).filter(Boolean).join(" ");
  }

  return String(value);
};

export const extractApiFieldErrors = (error, fieldMap = {}) => {
  const data = error?.response?.data || error?.data || error;
  const fieldErrors = {};
  const generalMessages = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    const message = getErrorText(data);
    return message ? { _error: message } : {};
  }

  Object.entries(data).forEach(([key, value]) => {
    const message = getErrorText(value);

    if (!message) {
      return;
    }

    const mappedKey = fieldMap[key] || key;

    if (GENERAL_ERROR_KEYS.has(key) && !fieldMap[key]) {
      generalMessages.push(message);
      return;
    }

    fieldErrors[mappedKey] = message;
  });

  if (generalMessages.length) {
    fieldErrors._error = generalMessages.join(" ");
  }

  return fieldErrors;
};

export const getFirstApiErrorMessage = (fieldErrors, fallback = "Submission failed") =>
  fieldErrors._error ||
  Object.values(fieldErrors).find((value) => typeof value === "string" && value.trim()) ||
  fallback;

export const setAntdFormFieldErrors = (form, fieldErrors) => {
  const fields = Object.entries(fieldErrors)
    .filter(([name]) => name !== "_error")
    .map(([name, message]) => ({
      name,
      errors: message ? [message] : [],
    }));

  if (fields.length) {
    form.setFields(fields);
  }
};
