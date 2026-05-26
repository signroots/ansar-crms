 
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Drawer, Input, Select, Tag } from "antd";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

import { apiService } from "../../../../services/api/Api.service";
import {
  extractApiFieldErrors,
  getFirstApiErrorMessage,
} from "../../../../shared/utils/formErrors";

const initialFormData = {
  staffId: "",
  complaintType: "",
  complaintTypeName: "",
  issue: "",
  category: "",
  location: "",
  subLocation: "",
  notes: "",
  phoneNumber: "",
  priority: "",
};

const apiRequest = async (method, url, data = null) => {
  const normalizedMethod = method.toLowerCase();

  return normalizedMethod === "get" ? apiService.get(url) : apiService[normalizedMethod](url, data);
};

const styles = {
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    height: "44px",
    border: "0",
    borderRadius: "12px",
    background: "#0cb899",
    color: "#ffffff",
    fontWeight: 800,
  },
  hero: {
    // padding: "0 0 18px",
    // borderBottom: "1px solid var(--admin-border, #e2e8f0)",
  },
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
    marginTop: "22px",
  },
  section: {
    padding: "0",
    borderRadius: "16px",
    border: "0",
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

const toOptions = (items, getLabel = (item) => item.name) =>
  items.map((item) => ({
    label: getLabel(item),
    value: item.id,
  }));

const normalizeApiList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.issues)) {
    return data.issues;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getIssueLabel = (item) =>
  item.name || item.issue || item.title || item.issue_name || item.complaint || "Untitled";

const normalizeLabel = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "Emergency", value: "emergency" },
];

const apiFieldMap = {
  complaint_type: "complaintType",
  issue_complaint: "issue",
  phone_number: "phoneNumber",
  staff_id: "staffId",
  sub_location: "subLocation",
  type_of_issue: "complaintType",
};

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <span style={styles.error}>{children}</span>;
}

function CreateComplaints({ onCreated }) {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [institutions, setInstitutions] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [issues, setIssues] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [staffIds, setStaffIds] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [subLocationsLoading, setSubLocationsLoading] = useState(false);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("");

  const isTechSupport = userRole === "Tech Support";
  const isMaintenance = ["maintenance", "maintanance"].includes(
    normalizeLabel(formData.complaintTypeName),
  );
  const selectedIssueName = getIssueLabel(
    issues.find((issue) => String(issue.id) === String(formData.issue)) || {},
  );
  const isNotesRequired = isMaintenance && normalizeLabel(selectedIssueName) === "others";

  const staffOptions = useMemo(
    () =>
      staffIds.map((staff) => ({
        label: `${staff.id}${staff.name ? ` - ${staff.name}` : ""}`,
        value: staff.id,
      })),
    [staffIds],
  );

  const issueTypeOptions = useMemo(() => toOptions(issueTypes), [issueTypes]);
  const issueOptions = useMemo(() => toOptions(issues, getIssueLabel), [issues]);
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

    setFormData({
      ...initialFormData,
      complaintType: isTechSupport ? storedTypeId : "",
      complaintTypeName: isTechSupport ? storedTypeName : "",
    });
    setErrors({});
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
      const [staffResponse, issueTypesResponse, institutionsResponse] = await Promise.all([
        apiRequest("GET", "/api/api/check-staff-id/?data=DepartmentHead"),
        apiRequest("GET", "/api/api/types-of-issue/"),
        apiRequest("GET", "/api/api/institutions/"),
      ]);

      setStaffIds(staffResponse.staff_ids || []);
      setIssueTypes(normalizeApiList(issueTypesResponse));
      setInstitutions(normalizeApiList(institutionsResponse));
      setLookupsLoaded(true);
    } catch (error) {
      console.error("Complaint form lookup fetch error:", error);
      setStaffIds([]);
      setIssueTypes([]);
      setInstitutions([]);
      toast.error("Unable to load complaint form data");
    } finally {
      setLookupsLoading(false);
    }
  }, [lookupsLoaded, lookupsLoading]);

  const openComplaintDrawer = () => {
    resetForm();
    setOpenDrawer(true);
  };

  useEffect(() => {
    const role = localStorage.getItem("user_role") || localStorage.getItem("role") || "";
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (!openDrawer || !isTechSupport) {
      return;
    }

    const storedTypeId = localStorage.getItem("type_of_issue_id");
    const storedTypeName = localStorage.getItem("type_of_issue");

    if (storedTypeId) {
      setFormData((currentFormData) => ({
        ...currentFormData,
        complaintType: storedTypeId,
        complaintTypeName: storedTypeName || "",
      }));
    }
  }, [isTechSupport, openDrawer]);

  useEffect(() => {
    if (!openDrawer) {
      return;
    }

    loadLookups();
  }, [loadLookups, openDrawer]);

  useEffect(() => {
    if (!openDrawer || !formData.complaintType) {
      setIssues([]);
      return;
    }

    setIssuesLoading(true);

    apiRequest("GET", `/api/api/issues/${formData.complaintType}/`)
      .then((data) => setIssues(normalizeApiList(data)))
      .catch((err) => {
        console.error("Issue fetch error:", err);
        setIssues([]);
      })
      .finally(() => {
        setIssuesLoading(false);
      });
  }, [formData.complaintType, openDrawer]);

  const handleStaffChange = (value) => {
    const selectedStaff = staffIds.find((staff) => staff.id === value);

    setField("staffId", value, {
      phoneNumber: selectedStaff?.phone || selectedStaff?.mobile_number || "",
    });
  };

  const handleComplaintTypeChange = (value) => {
    const selectedType = issueTypes.find((type) => type.id === value);

    setField("complaintType", value, {
      complaintTypeName: selectedType?.name || "",
      issue: "",
      location: "",
      priority: "",
      subLocation: "",
    });
  };

  const handleLocationChange = (value) => {
    setSubLocations([]);
    setSubLocationsLoading(true);
    setField("location", value, {
      subLocation: "",
    });

    apiRequest("GET", `/api/api/sublocation/${value}/`)
      .then((data) => setSubLocations(normalizeApiList(data)))
      .catch(() => setSubLocations([]))
      .finally(() => setSubLocationsLoading(false));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.staffId) {
      nextErrors.staffId = "Staff ID is required";
    }

    if (!formData.complaintType) {
      nextErrors.complaintType = "Required";
    }

    if (isMaintenance) {
      if (!formData.priority) {
        nextErrors.priority = "Required";
      }

      if (!formData.location) {
        nextErrors.location = "Required";
      }

      if (isSubLocationEnabled && !formData.subLocation) {
        nextErrors.subLocation = "Required";
      }

      if (isNotesRequired && !formData.notes.trim()) {
        nextErrors.notes = "Required";
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
      complaint_type: formData.complaintType,
      issue_complaint: formData.issue,
      location: formData.location,
      notes: formData.notes,
      phone_number: formData.phoneNumber,
      priority: formData.priority,
      staff_id: formData.staffId,
      sub_location: formData.subLocation,
    };

    setSubmitting(true);

    try {
      await apiRequest("POST", "/api/complaints/submit/", payload);
      toast.success("Complaint submitted successfully");
      setOpenDrawer(false);
      resetForm();
      onCreated?.();
    } catch (error) {
      console.error(error);
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
        onClick={openComplaintDrawer}
        style={styles.trigger}
        type="primary"
      >
        New Complaint
      </Button>

      <Drawer
        destroyOnHidden
        footer={null}
        onClose={closeDrawer}
        open={openDrawer}
        title={
          <div style={styles.hero}>
            <h2 style={styles.heroTitle}>Create Complaint</h2>
            <p style={styles.heroText}>Fill the required details and submit the complaint.</p>
          </div>
        }
        width={720}
      >
        <div style={styles.form}>
          <section style={styles.section}>
            {/* <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Requester Details</h3>
            </div> */}

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
            {/* <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Complaint Details</h3>
            </div> */}

            <div style={styles.grid}>
              {!isTechSupport && (
                <label style={styles.field}>
                  <span style={styles.label}>Type of Complaint</span>
                  <Select
                    optionFilterProp="label"
                    options={issueTypeOptions}
                    placeholder="Select type"
                    showSearch
                    loading={lookupsLoading}
                    status={errors.complaintType ? "error" : undefined}
                    style={styles.control}
                    value={formData.complaintType || undefined}
                    onChange={handleComplaintTypeChange}
                  />
                  <FieldError>{errors.complaintType}</FieldError>
                </label>
              )}

              {isTechSupport && (
                <div style={styles.field}>
                  <span style={styles.label}>Type of Complaint</span>
                  <Tag color="processing">{formData.complaintTypeName || "Tech Support"}</Tag>
                </div>
              )}

              <label style={styles.field}>
                <span style={styles.label}>Complaint Category</span>
                <Select
                  disabled={!formData.complaintType}
                  loading={issuesLoading}
                  notFoundContent={
                    formData.complaintType ? "No categories found" : "Select complaint type first"
                  }
                  optionFilterProp="label"
                  options={issueOptions}
                  placeholder="Select category"
                  showSearch
                  style={styles.control}
                  value={formData.issue || undefined}
                  onChange={(value) => setField("issue", value)}
                />
              </label>
            </div>
          </section>

          {isMaintenance && (
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Maintenance Details</h3>
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

                <label style={styles.field}>
                  <span style={styles.label}>Priority</span>
                  <Select
                    options={priorityOptions}
                    placeholder="Select priority"
                    status={errors.priority ? "error" : undefined}
                    style={styles.control}
                    value={formData.priority || undefined}
                    onChange={(value) => setField("priority", value)}
                  />
                  <FieldError>{errors.priority}</FieldError>
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
                placeholder={isNotesRequired ? "Describe the other maintenance complaint" : "Add notes"}
                rows={4}
                style={{ fontSize: "15px", minHeight: "112px", padding: "12px" }}
                value={formData.notes}
                onChange={(event) => setField("notes", event.target.value)}
              />
              <FieldError>{errors.notes}</FieldError>
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
            Submit Complaint
          </Button>
        </div>
      </Drawer>
    </>
  );
}

export default CreateComplaints;
