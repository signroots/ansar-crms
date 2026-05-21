import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Drawer, Form, Input, Select } from "antd";
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
  { label: "Tech Admin", value: USER_ROLES.DEPARTMENT_ADMIN },
];

const initialFormData = {
  department: "",
  institution: "",
  mobile_number: "",
  name: "",
  password: "",
  role: "",
  staff_id: "",
  typeofissue: "",
  username: "",
};

const formItemStyle = {
  marginBottom: 0,
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

function UserEdit({ onClose, onUpdate, open, user }) {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [typesOfIssue, setTypesOfIssue] = useState([]);

  const selectedInstitution = Form.useWatch("institution", form);
  const selectedRole = Form.useWatch("role", form);
  const selectedIssueId = Form.useWatch("typeofissue", form);

  const needsInstitution = selectedRole === USER_ROLES.STAFF || selectedRole === USER_ROLES.TEACHER;
  const isTechSupport = selectedRole === USER_ROLES.TECHNICAL_STAFF;
  const isDepartmentAdmin = selectedRole === USER_ROLES.DEPARTMENT_ADMIN;
  const needsSection = isTechSupport || isDepartmentAdmin;
  const needsStaffContact = Boolean(selectedRole) && !isDepartmentAdmin;

  const institutionOptions = useMemo(() => toOptions(institutions), [institutions]);
  const departmentOptions = useMemo(() => toOptions(departments), [departments]);
  const issueTypeOptions = useMemo(() => toOptions(typesOfIssue), [typesOfIssue]);

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
      console.error("User edit lookup fetch error:", error);
      setInstitutions([]);
      setTypesOfIssue([]);
      toast.error("Unable to load user form data");
    } finally {
      setLookupsLoading(false);
    }
  }, [lookupsLoaded, lookupsLoading]);

  useEffect(() => {
    if (!open) {
      return;
    }

    loadLookups();
  }, [loadLookups, open]);

  useEffect(() => {
    if (!open || !user) {
      return;
    }

    form.setFieldsValue({
      department: user.department?.id || "",
      institution: user.institution?.id || "",
      mobile_number: user.mobile_number || "",
      name: user.name || "",
      password: "",
      role: user.is_admin ? USER_ROLES.DEPARTMENT_ADMIN : user.role || "",
      staff_id: user.staff_id || "",
      typeofissue: getUserIssueId(user),
      username: user.username || "",
    });
    setMobileNumberError("");
    form.setFields([
      { name: "mobile_number", errors: [] },
      { name: "name", errors: [] },
      { name: "role", errors: [] },
      { name: "staff_id", errors: [] },
      { name: "password", errors: [] },
      { name: "username", errors: [] },
      { name: "department", errors: [] },
      { name: "institution", errors: [] },
      { name: "typeofissue", errors: [] },
    ]);
  }, [form, open, user]);

  useEffect(() => {
    if (!open || !selectedInstitution || !needsInstitution) {
      setDepartments([]);
      return;
    }

    apiService
      .get(DEPARTMENTS_ENDPOINT(selectedInstitution, selectedRole))
      .then((data) => setDepartments(normalizeApiList(data)))
      .catch(() => setDepartments([]));
  }, [needsInstitution, open, selectedInstitution, selectedRole]);

  useEffect(() => {
    if (!open || !needsSection || !selectedIssueId || findById(typesOfIssue, selectedIssueId)) {
      return;
    }

    const matchingIssue = typesOfIssue.find(
      (issue) =>
        String(issue.name || "")
          .trim()
          .toLowerCase() === String(selectedIssueId).trim().toLowerCase(),
    );

    if (matchingIssue) {
      form.setFieldsValue({
        typeofissue: matchingIssue.id,
      });
    }
  }, [form, needsSection, open, selectedIssueId, typesOfIssue]);

  const checkMobileNumberExists = async (mobileNumber) => {
    if (!mobileNumber || mobileNumber.length !== 10 || mobileNumber === user?.mobile_number) {
      return true;
    }

    try {
      const data = await apiService.get(CHECK_MOBILE_ENDPOINT);
      const existingMobileNumbers = normalizeExistingValues(data?.mobile_numbers, "mobile_number");
      const message = existingMobileNumbers.includes(String(mobileNumber))
        ? "This mobile number is already used."
        : "";

      setMobileNumberError(message);
      form.setFields([{ name: "mobile_number", errors: message ? [message] : [] }]);

      return !message;
    } catch (error) {
      console.error("Error checking mobile number:", error);
      return true;
    }
  };

  const handleMobileChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setMobileNumberError("");
    form.setFields([{ name: "mobile_number", value, errors: [] }]);
  };

  const handleRoleChange = (value) => {
    setMobileNumberError("");
    form.setFields([
      { name: "mobile_number", errors: [] },
      { name: "staff_id", errors: [] },
    ]);
    form.setFieldsValue({
      role: value,
      department: "",
      institution: "",
      mobile_number: "",
      password: "",
      staff_id: "",
      typeofissue: "",
      username: "",
    });
  };

  const updateUser = async () => {
    if (!user?.id) {
      toast.warning("Please complete the required fields");
      return;
    }

    let values;

    try {
      values = await form.validateFields();
    } catch {
      toast.warning("Please complete the required fields");
      return;
    }

    const isMobileAvailable = needsStaffContact
      ? await checkMobileNumberExists(values.mobile_number)
      : true;

    if (!isMobileAvailable || mobileNumberError) {
      toast.warning("Please fix the highlighted fields");
      return;
    }

    const selectedIssue = findById(typesOfIssue, values.typeofissue);
    const payload = {
      department_id: needsInstitution ? values.department : null,
      institution_id: needsInstitution ? values.institution : null,
      is_admin: isDepartmentAdmin,
      mobile_number: needsStaffContact ? values.mobile_number : undefined,
      name: values.name.trim(),
      password: isDepartmentAdmin && values.password ? values.password : undefined,
      role: values.role,
      section_for_staff: needsSection
        ? selectedIssue?.name || user.section_for_staff || null
        : null,
      staff_id: needsStaffContact ? values.staff_id : undefined,
      typeofissue_id: needsSection ? values.typeofissue : null,
      username: isDepartmentAdmin ? values.username.trim() : undefined,
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
      <Form
        form={form}
        initialValues={initialFormData}
        layout="vertical"
        requiredMark={false}
        style={styles.form}
      >
        <section style={styles.section}>
          <div style={styles.grid}>
            <Form.Item
              label={<span style={styles.label}>Name</span>}
              name="name"
              rules={[{ required: true, whitespace: true, message: "Name is required" }]}
              style={formItemStyle}
            >
              <Input placeholder="Full name" style={styles.control} />
            </Form.Item>

            <Form.Item
              label={<span style={styles.label}>Role</span>}
              name="role"
              rules={[{ required: true, message: "Role is required" }]}
              style={formItemStyle}
            >
              <Select
                options={roleOptions}
                placeholder="Select role"
                style={styles.control}
                onChange={handleRoleChange}
              />
            </Form.Item>

            {needsStaffContact ? (
              <>
                <Form.Item
                  label={<span style={styles.label}>Staff ID</span>}
                  name="staff_id"
                  rules={[
                    { required: true, message: "Staff ID is required" },
                    {
                      pattern: /^[A-Z][0-9]{0,5}$/,
                      message: "Staff ID must start with a letter and use numbers after it.",
                    },
                  ]}
                  style={formItemStyle}
                >
                  <Input
                    placeholder="A12345"
                    style={styles.control}
                    onChange={(event) => {
                      const value = event.target.value.trim().toUpperCase();
                      form.setFieldsValue({ staff_id: value });
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={styles.label}>Mobile Number</span>}
                  name="mobile_number"
                  rules={[
                    { required: true, message: "Mobile number is required" },
                    { len: 10, message: "Enter a 10 digit mobile number" },
                  ]}
                  style={formItemStyle}
                >
                  <Input
                    placeholder="10 digit mobile number"
                    style={styles.control}
                    onBlur={() => checkMobileNumberExists(form.getFieldValue("mobile_number"))}
                    onChange={handleMobileChange}
                  />
                </Form.Item>
              </>
            ) : null}

            {isDepartmentAdmin ? (
              <>
                <Form.Item
                  label={<span style={styles.label}>Username</span>}
                  name="username"
                  rules={[{ required: true, whitespace: true, message: "Username is required" }]}
                  style={formItemStyle}
                >
                  <Input
                    autoComplete="username"
                    placeholder="Admin username"
                    style={styles.control}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={styles.label}>Password</span>}
                  name="password"
                  style={formItemStyle}
                >
                  <Input.Password
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current password"
                    style={styles.control}
                  />
                </Form.Item>
              </>
            ) : null}
          </div>
        </section>

        {needsInstitution ? (
          <section style={styles.section}>
            <div style={styles.grid}>
              <Form.Item
                label={<span style={styles.label}>Institution</span>}
                name="institution"
                rules={[{ required: true, message: "Institution is required" }]}
                style={formItemStyle}
              >
                <Select
                  optionFilterProp="label"
                  options={institutionOptions}
                  placeholder="Select institution"
                  showSearch
                  loading={lookupsLoading}
                  style={styles.control}
                  onChange={(value) =>
                    form.setFieldsValue({
                      institution: value,
                      department: "",
                    })
                  }
                />
              </Form.Item>

              <Form.Item
                label={<span style={styles.label}>Department</span>}
                name="department"
                rules={[{ required: true, message: "Department is required" }]}
                style={formItemStyle}
              >
                <Select
                  disabled={!selectedInstitution}
                  loading={lookupsLoading}
                  optionFilterProp="label"
                  options={departmentOptions}
                  placeholder="Select department"
                  showSearch
                  style={styles.control}
                />
              </Form.Item>
            </div>
          </section>
        ) : null}

        {needsSection ? (
          <section style={styles.section}>
            <div style={styles.grid}>
              <Form.Item
                label={<span style={styles.label}>Section</span>}
                name="typeofissue"
                rules={[{ required: true, message: "Section is required" }]}
                style={formItemStyle}
              >
                <Select
                  optionFilterProp="label"
                  options={issueTypeOptions}
                  placeholder="Select section"
                  showSearch
                  loading={lookupsLoading}
                  style={styles.control}
                />
              </Form.Item>
            </div>
          </section>
        ) : null}
      </Form>

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
