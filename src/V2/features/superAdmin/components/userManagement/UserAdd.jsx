 
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Drawer, Form, Input, Select } from "antd";
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

const formItemStyle = {
  marginBottom: 0,
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

function UserAdd({ onUserAdded }) {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [lookupsLoaded, setLookupsLoaded] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [staffIdError, setStaffIdError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [typesOfIssue, setTypesOfIssue] = useState([]);

  const selectedInstitution = Form.useWatch("institution", form);
  const selectedRole = Form.useWatch("role", form);

  const needsInstitution =
    selectedRole === USER_ROLES.STAFF || selectedRole === USER_ROLES.TEACHER;
  const isTechSupport = selectedRole === USER_ROLES.TECHNICAL_STAFF;

  const institutionOptions = useMemo(() => toOptions(institutions), [institutions]);
  const departmentOptions = useMemo(() => toOptions(departments), [departments]);
  const issueTypeOptions = useMemo(() => toOptions(typesOfIssue), [typesOfIssue]);

  const resetForm = () => {
    form.resetFields();
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
    if (!openDrawer || !selectedInstitution || !needsInstitution) {
      setDepartments([]);
      return;
    }

    apiService
      .get(DEPARTMENTS_ENDPOINT(selectedInstitution, selectedRole))
      .then((data) => setDepartments(normalizeApiList(data)))
      .catch(() => setDepartments([]));
  }, [needsInstitution, openDrawer, selectedInstitution, selectedRole]);

  const checkStaffIdExists = async (staffId) => {
    if (!staffId || !/^[A-Z][0-9]{0,5}$/.test(staffId)) {
      return false;
    }

    try {
      const data = await apiService.get(CHECK_STAFF_ID_ENDPOINT);
      const existingStaffIds = normalizeExistingValues(data?.staff_ids, "staff_id");
      const message = existingStaffIds.includes(String(staffId))
        ? "This Staff ID is already used."
        : "";

      setStaffIdError(message);
      form.setFields([{ name: "staff_id", errors: message ? [message] : [] }]);

      return !message;
    } catch (error) {
      console.error("Error checking Staff ID:", error);
      return true;
    }
  };

  const checkMobileNumberExists = async (mobileNumber) => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      return false;
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

  const handleStaffIdChange = (event) => {
    const value = event.target.value.trim().toUpperCase();

    if (value && !/^[A-Z][0-9]{0,5}$/.test(value)) {
      const message = "Staff ID must start with a letter and use numbers after it.";
      setStaffIdError(message);
      form.setFields([{ name: "staff_id", errors: [message] }]);
      return;
    }

    setStaffIdError("");
    form.setFields([{ name: "staff_id", value, errors: [] }]);
  };

  const handleMobileChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setMobileNumberError("");
    form.setFields([{ name: "mobile_number", value, errors: [] }]);
  };

  const handleRoleChange = (value) => {
    form.setFieldsValue({
      role: value,
      department: "",
      institution: "",
      is_admin: false,
      typeofissue: "",
    });
  };

  const saveUser = async () => {
    let values;

    try {
      values = await form.validateFields();
    } catch {
      toast.warning("Please complete the required fields");
      return;
    }

    const [isStaffIdAvailable, isMobileAvailable] = await Promise.all([
      checkStaffIdExists(values.staff_id),
      checkMobileNumberExists(values.mobile_number),
    ]);

    if (!isStaffIdAvailable || !isMobileAvailable || staffIdError || mobileNumberError) {
      toast.warning("Please fix the highlighted fields");
      return;
    }

    const payload = {
      department_id: needsInstitution ? values.department : null,
      institution_id: needsInstitution ? values.institution : null,
      is_admin: isTechSupport ? Boolean(values.is_admin) : false,
      mobile_number: values.mobile_number,
      name: values.name.trim(),
      role: values.role,
      staff_id: values.staff_id,
      typeofissue_id: isTechSupport ? values.typeofissue : null,
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
                <Input
                  placeholder="Full name"
                  style={styles.control}
                />
              </Form.Item>

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
                  onBlur={() => checkStaffIdExists(form.getFieldValue("staff_id"))}
                  onChange={handleStaffIdChange}
                />
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
                  rules={[{ required: false, message: "Department is required" }]}
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

          {isTechSupport ? (
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

                <Form.Item
                  name="is_admin"
                  style={{ ...formItemStyle, alignContent: "end" }}
                  valuePropName="checked"
                >
                  <Checkbox
                  >
                    Department Admin
                  </Checkbox>
                </Form.Item>
              </div>
            </section>
          ) : null}
        </Form>

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
