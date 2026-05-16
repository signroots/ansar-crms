 
import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Drawer, Input, Select } from "antd";
import { toast } from "react-toastify";

import { apiService } from "../../../../services/api/Api.service";
import { USER_ROLES } from "../../../../shared/constants/roles";

const USER_UPDATE_ENDPOINT = (id) => `/api/api/users/${id}/update/`;
const INSTITUTIONS_ENDPOINT = "/api/api/institutions/";
const TYPES_OF_ISSUE_ENDPOINT = "/api/api/types-of-issue/";
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
    fontWeight: 500,
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

const findById = (items, value) => items.find((item) => String(item.id) === String(value));

const normalizeExistingValues = (items, key) =>
  (Array.isArray(items) ? items : []).map((item) =>
    typeof item === "object"
      ? String(item[key] || item.staff_id || item.mobile_number || item.value || item.id || "")
      : String(item),
  );

const getUserIssueId = (user) =>
  user?.typeofissue?.id ||
  user?.type_of_issue?.id ||
  user?.type_of_issue_id ||
  user?.typeofissue_id ||
  "";

function FieldError({ children }) {
  if (!children) {
    return null;
  }

  return <span style={styles.error}>{children}</span>;
}

function UserEdit({ onClose, onUpdate, open, user }) {
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialFormData);
  const [institutions, setInstitutions] = useState([]);
  const [mobileNumberError, setMobileNumberError] = useState("");
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

  useEffect(() => {
    apiService
      .get(INSTITUTIONS_ENDPOINT)
      .then((data) => setInstitutions(normalizeApiList(data)))
      .catch(() => setInstitutions([]));

    apiService
      .get(TYPES_OF_ISSUE_ENDPOINT)
      .then((data) => setTypesOfIssue(normalizeApiList(data)))
      .catch(() => setTypesOfIssue([]));
  }, []);

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    setFormData({
      department: user.department?.id || "",
      institution: user.institution?.id || "",
      is_admin: Boolean(user.is_admin),
      mobile_number: user.mobile_number || "",
      name: user.name || "",
      role: user.role || "",
      staff_id: user.staff_id || "",
      typeofissue: getUserIssueId(user),
    });
    setErrors({});
    setMobileNumberError("");
  }, [open, user]);

  useEffect(() => {
    if (!formData.institution || !needsInstitution) {
      setDepartments([]);
      return;
    }

    apiService
      .get(DEPARTMENTS_ENDPOINT(formData.institution, formData.role))
      .then((data) => setDepartments(normalizeApiList(data)))
      .catch(() => setDepartments([]));
  }, [formData.institution, formData.role, needsInstitution]);

  useEffect(() => {
    if (
      !open ||
      !isTechSupport ||
      !formData.typeofissue ||
      findById(typesOfIssue, formData.typeofissue)
    ) {
      return;
    }

    const matchingIssue = typesOfIssue.find(
      (issue) =>
        String(issue.name || "")
          .trim()
          .toLowerCase() === String(formData.typeofissue).trim().toLowerCase(),
    );

    if (matchingIssue) {
      setFormData((currentFormData) => ({
        ...currentFormData,
        typeofissue: matchingIssue.id,
      }));
    }
  }, [formData.typeofissue, isTechSupport, open, typesOfIssue]);

  const checkMobileNumberExists = async (mobileNumber) => {
    if (!mobileNumber || mobileNumber.length !== 10 || mobileNumber === user?.mobile_number) {
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
      staff_id: !formData.staff_id ? "Staff ID is required" : "",
      typeofissue: isTechSupport && !formData.typeofissue ? "Section is required" : "",
    };

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean) && !mobileNumberError;
  };

  const updateUser = async () => {
    if (!user?.id || !validateForm()) {
      toast.warning("Please complete the required fields");
      return;
    }

    const selectedIssue = findById(typesOfIssue, formData.typeofissue);
    const payload = {
      department_id: needsInstitution ? formData.department : null,
      institution_id: needsInstitution ? formData.institution : null,
      is_admin: isTechSupport ? formData.is_admin : false,
      mobile_number: formData.mobile_number,
      name: formData.name.trim(),
      role: formData.role,
      section_for_staff: isTechSupport
        ? selectedIssue?.name || user.section_for_staff || null
        : null,
      staff_id: formData.staff_id,
      typeofissue_id: isTechSupport ? formData.typeofissue : null,
    };

    setSubmitting(true);

    try {
      await apiService.put(USER_UPDATE_ENDPOINT(user.id), payload);
      toast.success("User updated successfully");
      onUpdate?.();
      onClose?.();
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || "Unable to update user";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      destroyOnHidden
      footer={null}
      onClose={onClose}
      open={open}
      title={
        <div>
          <h2 style={styles.heroTitle}>Edit User</h2>
          <p style={styles.heroText}>Update role, contact, and institution details.</p>
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
                status={errors.staff_id ? "error" : undefined}
                style={styles.control}
                value={formData.staff_id}
                onChange={(event) => setField("staff_id", event.target.value.trim().toUpperCase())}
              />
              <FieldError>{errors.staff_id}</FieldError>
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
        <Button onClick={onClose} style={styles.cancelButton}>
          Cancel
        </Button>
        <Button
          loading={submitting}
          onClick={updateUser}
          style={styles.submitButton}
          type="primary"
        >
          Update User
        </Button>
      </div>
    </Drawer>
  );
}

export default UserEdit;
