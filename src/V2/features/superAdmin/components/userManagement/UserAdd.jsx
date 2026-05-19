 
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Drawer, Input, Select } from "antd";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

import { apiService } from "../../../../services/api/Api.service";
import { USER_ROLES } from "../../../../shared/constants/roles";

const USERS_CREATE_ENDPOINT = "/api/api/users/create/";
const INSTITUTIONS_ENDPOINT = "/api/api/institutions/";
const TYPES_OF_ISSUE_ENDPOINT = "/api/api/types-of-issue/";
const CHECK_STAFF_ID_ENDPOINT = "/api/api/check-staff-id/";
const CHECK_MOBILE_ENDPOINT = "/api/api/check-mobile/";
const DEPARTMENTS_ENDPOINT = (institutionId, role) =>
  `/api/api/departments/${institutionId}/?data=${encodeURIComponent(role || "")}`;

const roleOptions = [
  { label: "Staff", value: USER_ROLES.STAFF },
  { label: "Teacher", value: USER_ROLES.TEACHER },
  { label: "Tech Support", value: USER_ROLES.TECHNICAL_STAFF },
];

const initialFormData = {
  department: "",
  institution: "",
  is_admin: false,
  mobile_number: "",
  name: "",
  role: "",
  staff_id: "",
  typeofissue: "",
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
  control: {
    height: "48px",
    fontSize: "15px",
    width: "100%",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "18px",
    borderTop: "1px solid var(--admin-border, #e2e8f0)",
  },
  submitButton: {
    minWidth: "150px",
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

  if (Array.isArray(data?.types)) {
    return data.types;
  }

  return [];
};

const toOptions = (items) =>
  items.map((item) => ({
    label: item.name || item.title || "Untitled",
    value: item.id,
  }));

const normalizeExistingValues = (items, key) =>
  (Array.isArray(items) ? items : []).map((item) =>
    typeof item === "object"
      ? String(item[key] || item.staff_id || item.mobile_number || item.value || item.id || "")
      : String(item),
  );

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <span style={styles.error}>{children}</span>;
}

function UserAdd({ onUserAdded }) {
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [institutions, setInstitutions] = useState([]);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [staffIdError, setStaffIdError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [typesOfIssue, setTypesOfIssue] = useState([]);

  const needsInstitution =
    formData.role === USER_ROLES.STAFF || formData.role === USER_ROLES.TEACHER;
  const isTechSupport = formData.role === USER_ROLES.TECHNICAL_STAFF;

  const institutionOptions = useMemo(() => toOptions(institutions), [institutions]);
  const departmentOptions = useMemo(() => toOptions(departments), [departments]);
  const issueTypeOptions = useMemo(() => toOptions(typesOfIssue), [typesOfIssue]);

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
    setFormData(initialFormData);
    setErrors({});
    setDepartments([]);
    setMobileNumberError("");
    setStaffIdError("");
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
      const [institutionsData, issueTypesData] = await Promise.all([
        apiService.get(INSTITUTIONS_ENDPOINT),
        apiService.get(TYPES_OF_ISSUE_ENDPOINT),
      ]);

      setInstitutions(normalizeApiList(institutionsData));
      setTypesOfIssue(normalizeApiList(issueTypesData));
      setLookupsLoaded(true);
    } catch (error) {
      console.error("User form lookup fetch error:", error);
      setInstitutions([]);
      setTypesOfIssue([]);
      toast.error("Unable to load user form data");
    } finally {
      setLookupsLoading(false);
    }
  }, [lookupsLoaded, lookupsLoading]);

  useEffect(() => {
    if (!openDrawer) {
      return;
    }

    loadLookups();
  }, [loadLookups, openDrawer]);

  useEffect(() => {
    if (!openDrawer || !formData.institution || !needsInstitution) {
      setDepartments([]);
      return;
    }

    apiService
      .get(DEPARTMENTS_ENDPOINT(formData.institution, formData.role))
      .then((data) => setDepartments(normalizeApiList(data)))
      .catch(() => setDepartments([]));
  }, [formData.institution, formData.role, needsInstitution, openDrawer]);

  const checkStaffIdExists = async (staffId) => {
    if (!staffId || staffIdError) {
      return;
    }

    try {
      const data = await apiService.get(CHECK_STAFF_ID_ENDPOINT);
      const existingStaffIds = normalizeExistingValues(data?.staff_ids, "staff_id");

      setStaffIdError(
        existingStaffIds.includes(String(staffId)) ? "This Staff ID is already used." : "",
      );
    } catch (error) {
      console.error("Error checking Staff ID:", error);
    }
  };

  const checkMobileNumberExists = async (mobileNumber) => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      return;
    }

    try {
      const data = await apiService.get(CHECK_MOBILE_ENDPOINT);
      const existingMobileNumbers = normalizeExistingValues(data?.mobile_numbers, "mobile_number");

      setMobileNumberError(
        existingMobileNumbers.includes(String(mobileNumber))
          ? "This mobile number is already used."
          : "",
      );
    } catch (error) {
      console.error("Error checking mobile number:", error);
    }
  };

  const handleStaffIdChange = (event) => {
    const value = event.target.value.trim().toUpperCase();

    if (value && !/^[A-Z][0-9]{0,5}$/.test(value)) {
      setStaffIdError("Staff ID must start with a letter and use numbers after it.");
      return;
    }

    setStaffIdError("");
    setField("staff_id", value);
  };

  const handleMobileChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setMobileNumberError("");
    setField("mobile_number", value);
  };

  const handleRoleChange = (value) => {
    setField("role", value, {
      department: "",
      institution: "",
      is_admin: false,
      typeofissue: "",
    });
  };

  const validateForm = () => {
    const nextErrors = {
      department: needsInstitution && !formData.department ? "Department is required" : "",
      institution: needsInstitution && !formData.institution ? "Institution is required" : "",
      mobile_number: !formData.mobile_number
        ? "Mobile number is required"
        : formData.mobile_number.length !== 10
          ? "Enter a 10 digit mobile number"
          : "",
      name: !formData.name.trim() ? "Name is required" : "",
      role: !formData.role ? "Role is required" : "",
      staff_id: !formData.staff_id ? "Staff ID is required" : staffIdError,
      typeofissue: isTechSupport && !formData.typeofissue ? "Section is required" : "",
    };

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean) && !mobileNumberError;
  };

  const saveUser = async () => {
    if (!validateForm()) {
      toast.warning("Please complete the required fields");
      return;
    }

    const payload = {
      department_id: needsInstitution ? formData.department : null,
      institution_id: needsInstitution ? formData.institution : null,
      is_admin: isTechSupport ? formData.is_admin : false,
      mobile_number: formData.mobile_number,
      name: formData.name.trim(),
      role: formData.role,
      staff_id: formData.staff_id,
      typeofissue_id: isTechSupport ? formData.typeofissue : null,
    };

    setSubmitting(true);

    try {
      await apiService.post(USERS_CREATE_ENDPOINT, payload);
      toast.success("User added successfully");
      closeDrawer();
      onUserAdded?.();
    } catch (error) {
      console.error("Error adding user:", error);
      const errorMessage =
        error.response?.data?.error || error.response?.data?.message || "Unable to add user";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        icon={<FiPlus size={17} />}
        onClick={() => {
          resetForm();
          setOpenDrawer(true);
        }}
        style={styles.trigger}
        type="primary"
      >
        New User
      </Button>

      <Drawer
        destroyOnHidden
        footer={null}
        onClose={closeDrawer}
        open={openDrawer}
        title={
          <div>
            <h2 style={styles.heroTitle}>Create User</h2>
            <p style={styles.heroText}>Add a staff, teacher, or technical support user.</p>
          </div>
        }
        width={720}
      >
        <div style={styles.form}>
          <section style={styles.section}>
            <div style={styles.grid}>
              <label style={styles.field}>
                <span style={styles.label}>Name</span>
                <Input
                  placeholder="Full name"
                  status={errors.name ? "error" : undefined}
                  style={styles.control}
                  value={formData.name}
                  onChange={(event) => setField("name", event.target.value)}
                />
                <FieldError>{errors.name}</FieldError>
              </label>

              <label style={styles.field}>
                <span style={styles.label}>Staff ID</span>
                <Input
                  placeholder="A12345"
                  status={errors.staff_id || staffIdError ? "error" : undefined}
                  style={styles.control}
                  value={formData.staff_id}
                  onBlur={() => checkStaffIdExists(formData.staff_id)}
                  onChange={handleStaffIdChange}
                />
                <FieldError>{errors.staff_id || staffIdError}</FieldError>
              </label>

              <label style={styles.field}>
                <span style={styles.label}>Role</span>
                <Select
                  options={roleOptions}
                  placeholder="Select role"
                  status={errors.role ? "error" : undefined}
                  style={styles.control}
                  value={formData.role || undefined}
                  onChange={handleRoleChange}
                />
                <FieldError>{errors.role}</FieldError>
              </label>

              <label style={styles.field}>
                <span style={styles.label}>Mobile Number</span>
                <Input
                  placeholder="10 digit mobile number"
                  status={errors.mobile_number || mobileNumberError ? "error" : undefined}
                  style={styles.control}
                  value={formData.mobile_number}
                  onBlur={() => checkMobileNumberExists(formData.mobile_number)}
                  onChange={handleMobileChange}
                />
                <FieldError>{errors.mobile_number || mobileNumberError}</FieldError>
              </label>
            </div>
          </section>

          {needsInstitution ? (
            <section style={styles.section}>
              <div style={styles.grid}>
                <label style={styles.field}>
                  <span style={styles.label}>Institution</span>
                  <Select
                    optionFilterProp="label"
                    options={institutionOptions}
                    placeholder="Select institution"
                    showSearch
                    loading={lookupsLoading}
                    status={errors.institution ? "error" : undefined}
                    style={styles.control}
                    value={formData.institution || undefined}
                    onChange={(value) =>
                      setField("institution", value, {
                        department: "",
                      })
                    }
                  />
                  <FieldError>{errors.institution}</FieldError>
                </label>

                <label style={styles.field}>
                  <span style={styles.label}>Department</span>
                  <Select
                    disabled={!formData.institution}
                    loading={lookupsLoading}
                    optionFilterProp="label"
                    options={departmentOptions}
                    placeholder="Select department"
                    showSearch
                    status={errors.department ? "error" : undefined}
                    style={styles.control}
                    value={formData.department || undefined}
                    onChange={(value) => setField("department", value)}
                  />
                  <FieldError>{errors.department}</FieldError>
                </label>
              </div>
            </section>
          ) : null}

          {isTechSupport ? (
            <section style={styles.section}>
              <div style={styles.grid}>
                <label style={styles.field}>
                  <span style={styles.label}>Section</span>
                  <Select
                    optionFilterProp="label"
                    options={issueTypeOptions}
                    placeholder="Select section"
                    showSearch
                    loading={lookupsLoading}
                    status={errors.typeofissue ? "error" : undefined}
                    style={styles.control}
                    value={formData.typeofissue || undefined}
                    onChange={(value) => setField("typeofissue", value)}
                  />
                  <FieldError>{errors.typeofissue}</FieldError>
                </label>

                <label style={{ ...styles.field, alignContent: "end" }}>
                  <Checkbox
                    checked={formData.is_admin}
                    onChange={(event) => setField("is_admin", event.target.checked)}
                  >
                    Department Admin
                  </Checkbox>
                </label>
              </div>
            </section>
          ) : null}
        </div>

        <div style={styles.footer}>
          <Button onClick={closeDrawer} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button
            loading={submitting}
            onClick={saveUser}
            style={styles.submitButton}
            type="primary"
          >
            Save User
          </Button>
        </div>
      </Drawer>
    </>
  );
}

export default UserAdd;
