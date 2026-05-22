 
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Drawer, Input, Select, TimePicker } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

import { USER_ROLES } from "../../../../shared/constants/roles";
import BASE_URL from "../../../../shared/utils/baseUrl";
import {
  extractApiFieldErrors,
  getFirstApiErrorMessage,
} from "../../../../shared/utils/formErrors";

const initialFormData = {
  allRequest: "",
  category: "",
  location: "",
  notes: "",
  phoneNumber: "",
  priority: "Medium",
  program_date: "",
  program_name: "",
  program_time: "",
  staffId: "",
  subLocation: "",
  typeOfRequest: "",
};

const getAccessToken = () => localStorage.getItem("access_token");

const apiRequest = async (method, url, data = null) => {
  const token = getAccessToken();

  return axios({
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    url: `${BASE_URL}${url}`,
  });
};

const styles = {
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    height: "44px",
    border: "0",
    borderRadius: "12px",
    background: "#3b82f6",
    color: "#ffffff",
    fontWeight: 800,
  },
  hero: {},
  heroTitle: {
    margin: 0,
    color: "var(--admin-text, #101828)",
    fontSize: "24px",
    fontWeight: 850,
    lineHeight: 1.2,
    letterSpacing: "0",
  },
  heroText: {
    maxWidth: "620px",
    margin: "8px 0 0",
    color: "var(--admin-muted, #667085)",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  form: {
    display: "grid",
    gap: "20px",
  },
  section: {
    padding: 0,
    border: 0,
    background: "var(--admin-surface, #ffffff)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },
  sectionTitle: {
    margin: 0,
    color: "var(--admin-text, #101828)",
    fontSize: "18px",
    fontWeight: 850,
    letterSpacing: "0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    color: "var(--admin-text, #101828)",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "0",
  },
  error: {
    color: "#ef4444",
    fontSize: "13px",
    fontWeight: 700,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid var(--admin-border, #e2e8f0)",
  },
  control: {
    height: "48px",
    fontSize: "15px",
    width: "100%",
  },
  submitButton: {
    minWidth: "160px",
    height: "46px",
    borderRadius: "12px",
    fontWeight: 800,
  },
  cancelButton: {
    height: "46px",
    borderRadius: "12px",
    fontWeight: 700,
  },
};

const normalizeApiList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.requests)) {
    return data.requests;
  }

  if (Array.isArray(data?.all_requests)) {
    return data.all_requests;
  }

  if (Array.isArray(data?.issues)) {
    return data.issues;
  }

  return [];
};

const getItemLabel = (item) =>
  item.name ||
  item.request ||
  item.title ||
  item.request_name ||
  item.issue ||
  item.issue_request?.name ||
  "Untitled";

const toOptions = (items, getLabel = getItemLabel) =>
  items.map((item) => ({
    label: getLabel(item),
    value: item.id,
  }));

const findById = (items, value) => items.find((item) => String(item.id) === String(value));
const normalizeLabel = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const getSelectedLabel = (items, value) => {
  const item = findById(items, value);

  return item ? getItemLabel(item) : "";
};

const apiFieldMap = {
  issue_request: "allRequest",
  phone_number: "phoneNumber",
  staff_id: "staffId",
  sub_location: "subLocation",
  type_of_request: "typeOfRequest",
};

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <span style={styles.error}>{children}</span>;
}

function CreateRequests({ fetchRequests }) {
  const [allRequests, setAllRequests] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [institutions, setInstitutions] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [requestCategoriesLoading, setRequestCategoriesLoading] = useState(false);
  const [requestTypeName, setRequestTypeName] = useState("");
  const [staffIds, setStaffIds] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [subLocationsLoading, setSubLocationsLoading] = useState(false);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [typesOfRequest, setTypesOfRequest] = useState([]);
  const [userRole, setUserRole] = useState("");

  const isTechSupport = userRole === USER_ROLES.TECHNICAL_STAFF;
  const isDepartmentAdmin = userRole === USER_ROLES.DEPARTMENT_ADMIN || isTechSupport;
  const selectedCategoryName = getSelectedLabel(allRequests, formData.allRequest);
  const selectedRequestTypeName =
    requestTypeName || getSelectedLabel(typesOfRequest, formData.typeOfRequest);
  const selectedCategoryKey = normalizeLabel(selectedCategoryName);
  const selectedRequestTypeKey = normalizeLabel(selectedRequestTypeName);
  const isMaintenance = selectedRequestTypeKey === "maintenance";
  const isStageProgram =
    selectedCategoryKey.includes("stage") && selectedCategoryKey.includes("program");

  const staffOptions = useMemo(
    () =>
      staffIds.map((staff) => ({
        label: `${staff.id}${staff.name ? ` - ${staff.name}` : ""}`,
        value: staff.id,
      })),
    [staffIds],
  );
  const requestTypeOptions = useMemo(() => toOptions(typesOfRequest), [typesOfRequest]);
  const requestCategoryOptions = useMemo(() => toOptions(allRequests), [allRequests]);
  const institutionOptions = useMemo(() => toOptions(institutions), [institutions]);
  const subLocationOptions = useMemo(() => toOptions(subLocations), [subLocations]);
  const isSubLocationEnabled = Boolean(formData.location) && subLocationOptions.length > 0;

  const setField = (name, value, extra = {}) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
      ...extra,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  };

  const resetForm = () => {
    const storedTypeId = localStorage.getItem("type_of_issue_id") || "";
    const storedTypeName = localStorage.getItem("type_of_issue") || "";
    const storedRole = localStorage.getItem("user_role") || localStorage.getItem("role") || "";
    const shouldUseStoredType =
      storedRole === USER_ROLES.DEPARTMENT_ADMIN || storedRole === USER_ROLES.TECHNICAL_STAFF;

    setFormData({
      ...initialFormData,
      typeOfRequest: shouldUseStoredType ? storedTypeId : "",
    });
    setRequestTypeName(shouldUseStoredType ? storedTypeName : "");
    setErrors({});
    setAllRequests([]);
    setSubLocations([]);
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
    resetForm();
  };

  const loadLookups = useCallback(async () => {
    if (lookupsLoaded || lookupsLoading) {
      return;
    }

    setLookupsLoading(true);

    try {
      const [staffResponse, institutionsResponse, requestTypesResponse] = await Promise.all([
        apiRequest("GET", "/api/check-staff-id/?data=DepartmentHead"),
        apiRequest("GET", "/api/institutions/"),
        apiRequest("GET", "/api/types-of-request/"),
      ]);

      setStaffIds(staffResponse.data.staff_ids || []);
      setInstitutions(normalizeApiList(institutionsResponse.data));
      setTypesOfRequest(normalizeApiList(requestTypesResponse.data));
      setLookupsLoaded(true);
    } catch (error) {
      console.error("Request form lookup fetch error:", error);
      setStaffIds([]);
      setInstitutions([]);
      setTypesOfRequest([]);
      toast.error("Unable to load request form data");
    } finally {
      setLookupsLoading(false);
    }
  }, [lookupsLoaded, lookupsLoading]);

  const openRequestDrawer = () => {
    resetForm();
    setOpenDrawer(true);
  };

  useEffect(() => {
    const role = localStorage.getItem("user_role") || localStorage.getItem("role") || "";
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (!openDrawer || !isDepartmentAdmin) {
      return;
    }

    const storedTypeId = localStorage.getItem("type_of_issue_id");
    const storedTypeName = localStorage.getItem("type_of_issue");

    if (storedTypeId) {
      setFormData((currentFormData) => ({
        ...currentFormData,
        typeOfRequest: storedTypeId,
      }));
      setRequestTypeName(storedTypeName || "");
    }
  }, [isDepartmentAdmin, openDrawer]);

  useEffect(() => {
    if (!openDrawer) {
      return;
    }

    loadLookups();
  }, [loadLookups, openDrawer]);

  useEffect(() => {
    if (!openDrawer || !formData.typeOfRequest) {
      setAllRequests([]);
      return;
    }

    setRequestCategoriesLoading(true);

    apiRequest("GET", `/api/allrequests/${formData.typeOfRequest}/`)
      .then((res) => setAllRequests(normalizeApiList(res.data)))
      .catch(() => setAllRequests([]))
      .finally(() => setRequestCategoriesLoading(false));
  }, [formData.typeOfRequest, openDrawer]);

  const handleStaffChange = (value) => {
    const selectedStaff = findById(staffIds, value);

    setField("staffId", value, {
      phoneNumber: selectedStaff?.phone || selectedStaff?.mobile_number || "",
    });
  };

  const handleRequestTypeChange = (value) => {
    const selectedType = findById(typesOfRequest, value);

    setAllRequests([]);
    setRequestTypeName(selectedType ? getItemLabel(selectedType) : "");
    setField("typeOfRequest", value, {
      allRequest: "",
      category: "",
      location: "",
      program_date: "",
      program_name: "",
      program_time: "",
      subLocation: "",
    });
  };

  const handleLocationChange = (value) => {
    setSubLocations([]);
    setSubLocationsLoading(true);
    setField("location", value, {
      subLocation: "",
    });

    apiRequest("GET", `/api/sublocation/${value}/`)
      .then((res) => setSubLocations(normalizeApiList(res.data)))
      .catch(() => setSubLocations([]))
      .finally(() => setSubLocationsLoading(false));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.staffId) {
      nextErrors.staffId = "Staff ID is required";
    }

    if (!isDepartmentAdmin && !formData.typeOfRequest) {
      nextErrors.typeOfRequest = "Required";
    }

    if (!formData.allRequest) {
      nextErrors.allRequest = "Required";
    }

    if (isMaintenance) {
      if (!formData.location) {
        nextErrors.location = "Required";
      }

      if (isSubLocationEnabled && !formData.subLocation) {
        nextErrors.subLocation = "Required";
      }
    }

    if (isStageProgram) {
      if (!formData.program_name) {
        nextErrors.program_name = "Required";
      }

      if (!formData.program_date) {
        nextErrors.program_date = "Required";
      }

      if (!formData.program_time) {
        nextErrors.program_time = "Required";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      category: formData.category,
      created_by: "Admin",
      issue_request: formData.allRequest,
      location: formData.location,
      notes: formData.notes,
      phone_number: formData.phoneNumber,
      priority: formData.priority,
      program_date: formData.program_date,
      program_name: formData.program_name,
      program_time: formData.program_time,
      staff_id: formData.staffId,
      sub_location: formData.subLocation,
      type_of_request: formData.typeOfRequest,
    };

    setSubmitting(true);

    try {
      await apiRequest("POST", "/api/requests/submit/", payload);
      toast.success("Request submitted successfully");
      fetchRequests?.();
      resetForm();
      setOpenDrawer(false);
    } catch (error) {
      console.error("Request submission failed:", error);
      const apiErrors = extractApiFieldErrors(error, apiFieldMap);

      setErrors((currentErrors) => ({ ...currentErrors, ...apiErrors }));
      toast.error(getFirstApiErrorMessage(apiErrors, "Submission failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        icon={<FiPlus size={17} />}
        onClick={openRequestDrawer}
        style={styles.trigger}
        type="primary"
      >
        New Request
      </Button>

      <Drawer
        destroyOnHidden
        footer={null}
        onClose={closeDrawer}
        open={openDrawer}
        title={
          <div style={styles.hero}>
            <h2 style={styles.heroTitle}>Create Request</h2>
            <p style={styles.heroText}>Fill the required details and submit the request.</p>
          </div>
        }
        width={720}
      >
        <div style={styles.form}>
          <section style={styles.section}>
            <div style={styles.grid}>
              <label style={styles.field}>
                <span style={styles.label}>Staff ID</span>
                <Select
                  optionFilterProp="label"
                  options={staffOptions}
                  placeholder="Select staff"
                  showSearch
                  loading={lookupsLoading}
                  status={errors.staffId ? "error" : undefined}
                  style={styles.control}
                  value={formData.staffId || undefined}
                  onChange={handleStaffChange}
                />
                <FieldError>{errors.staffId}</FieldError>
              </label>
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.grid}>
              {!isDepartmentAdmin && (
                <label style={styles.field}>
                  <span style={styles.label}>Type of Request</span>
                  <Select
                    optionFilterProp="label"
                    options={requestTypeOptions}
                    placeholder="Select type"
                    showSearch
                    loading={lookupsLoading}
                    status={errors.typeOfRequest ? "error" : undefined}
                    style={styles.control}
                    value={formData.typeOfRequest || undefined}
                    onChange={handleRequestTypeChange}
                  />
                  <FieldError>{errors.typeOfRequest}</FieldError>
                </label>
              )}

              {isDepartmentAdmin && (
                <label style={styles.field}>
                  <span style={styles.label}>Type of Request</span>
                  <Select
                    disabled
                    options={[
                      {
                        label: requestTypeName || "Department",
                        value: formData.typeOfRequest,
                      },
                    ]}
                    loading={lookupsLoading}
                    style={styles.control}
                    value={formData.typeOfRequest || undefined}
                  />
                </label>
              )}

              <label style={styles.field}>
                <span style={styles.label}>Category</span>
                <Select
                  disabled={!formData.typeOfRequest}
                  loading={requestCategoriesLoading}
                  notFoundContent={
                    formData.typeOfRequest ? "No categories found" : "Select request type first"
                  }
                  optionFilterProp="label"
                  options={requestCategoryOptions}
                  placeholder="Select category"
                  showSearch
                  status={errors.allRequest ? "error" : undefined}
                  style={styles.control}
                  value={formData.allRequest || undefined}
                  onChange={(value) => setField("allRequest", value)}
                />
                <FieldError>{errors.allRequest}</FieldError>
              </label>
            </div>
          </section>

          {isMaintenance && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Maintenance Location</h3>
              </div>

              <div style={styles.grid}>
                <label style={styles.field}>
                  <span style={styles.label}>Location</span>
                  <Select
                    optionFilterProp="label"
                    options={institutionOptions}
                    placeholder="Select location"
                    showSearch
                    loading={lookupsLoading}
                    status={errors.location ? "error" : undefined}
                    style={styles.control}
                    value={formData.location || undefined}
                    onChange={handleLocationChange}
                  />
                  <FieldError>{errors.location}</FieldError>
                </label>

                <label style={styles.field}>
                  <span style={styles.label}>Sub Location</span>
                  <Select
                    disabled={!formData.location || subLocationsLoading || !isSubLocationEnabled}
                    loading={subLocationsLoading}
                    notFoundContent={
                      formData.location ? "No sub locations found" : "Select location first"
                    }
                    optionFilterProp="label"
                    options={subLocationOptions}
                    placeholder="Select sub location"
                    showSearch
                    status={errors.subLocation ? "error" : undefined}
                    style={styles.control}
                    value={formData.subLocation || undefined}
                    onChange={(value) => setField("subLocation", value)}
                  />
                  <FieldError>{errors.subLocation}</FieldError>
                </label>
              </div>
            </section>
          )}

          {isStageProgram && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Program Details</h3>
              </div>

              <div style={styles.grid}>
                <label style={styles.field}>
                  <span style={styles.label}>Program Name</span>
                  <Input
                    placeholder="Program name"
                    status={errors.program_name ? "error" : undefined}
                    style={styles.control}
                    value={formData.program_name}
                    onChange={(event) => setField("program_name", event.target.value)}
                  />
                  <FieldError>{errors.program_name}</FieldError>
                </label>

                <label style={styles.field}>
                  <span style={styles.label}>Program Date</span>
                  <DatePicker
                    disabledDate={(date) => date && date < dayjs().startOf("day")}
                    status={errors.program_date ? "error" : undefined}
                    style={styles.control}
                    value={formData.program_date ? dayjs(formData.program_date) : undefined}
                    onChange={(date) =>
                      setField("program_date", date ? date.format("YYYY-MM-DD") : "")
                    }
                  />
                  <FieldError>{errors.program_date}</FieldError>
                </label>

                <label style={styles.field}>
                  <span style={styles.label}>Program Time</span>
                  <TimePicker
                    format="HH:mm"
                    status={errors.program_time ? "error" : undefined}
                    style={styles.control}
                    value={
                      formData.program_time ? dayjs(formData.program_time, "HH:mm") : undefined
                    }
                    onChange={(time) => setField("program_time", time ? time.format("HH:mm") : "")}
                  />
                  <FieldError>{errors.program_time}</FieldError>
                </label>
              </div>
            </section>
          )}

          <section style={styles.section}>
            {/* <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Notes</h3>
            </div> */}

            <label style={styles.field}>
              <span style={styles.label}>Notes</span>
              <Input.TextArea
                placeholder="Add notes"
                rows={4}
                style={{ fontSize: "15px", minHeight: "112px", padding: "12px" }}
                value={formData.notes}
                onChange={(event) => setField("notes", event.target.value)}
              />
            </label>
          </section>
        </div>

        <div style={styles.footer}>
          <Button onClick={closeDrawer} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button
            loading={submitting}
            onClick={handleSubmit}
            style={styles.submitButton}
            type="primary"
          >
            Submit Request
          </Button>
        </div>
      </Drawer>
    </>
  );
}

export default CreateRequests;
