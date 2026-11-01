import API_BASE_URL from "../apiConfig";
import  { useEffect, useRef, useState } from "react";
import axios from "axios";

function UsersRoles() {
  // =====================================
  // ROLES
  // =====================================
  const roles = ["Super Admin", "Admin", "Manager", "Broker", "Staff"];

  
const permissions = [
  "Dashboard",  
  "Brokers",
  "Customers",
  "Leads",
  "Projects",
  "Properties",
  "Inventory",
  "Employees",
  "Payments",
  "Follow-ups & Tasks",
  "Documents",
  "Reports & Analytics",
  "Users & Roles",
];


  // =====================================
  // USERS
  // =====================================
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const formRef = useRef(null);

  // =====================================
  // ROLE PERMISSIONS
  // =====================================
  // Permissions load from MySQL; no dummy permissions are preselected.
  const [selectedRole, setSelectedRole] = useState("Super Admin");
  const [rolePermissions, setRolePermissions] = useState({});
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // =====================================
  // USER FORM
  // =====================================
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    status: "",
  });

  // Scroll the form into view, accounting for a scrollable CRM content area
  // and leaving room for any fixed/sticky navbar.
  const scrollToForm = () => {
    window.setTimeout(() => {
      const element = formRef.current;
      if (!element) return;

      const scrollMargin = 135;
      let scrollParent = element.parentElement;

      while (scrollParent && scrollParent !== document.body) {
        const style = window.getComputedStyle(scrollParent);
        const canScroll =
          ["auto", "scroll", "overlay"].includes(style.overflowY) &&
          scrollParent.scrollHeight > scrollParent.clientHeight;

        if (canScroll) break;
        scrollParent = scrollParent.parentElement;
      }

      if (scrollParent && scrollParent !== document.body) {
        const parentTop = scrollParent.getBoundingClientRect().top;
        const elementTop = element.getBoundingClientRect().top;
        scrollParent.scrollTo({
          top: scrollParent.scrollTop + elementTop - parentTop - scrollMargin,
          behavior: "smooth",
        });
      } else {
        const elementTop = element.getBoundingClientRect().top;
        window.scrollTo({
          top: window.scrollY + elementTop - scrollMargin,
          behavior: "smooth",
        });
      }
    }, 300);
  };

  // =====================================
  // GET USERS
  // =====================================
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/User/all`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH USERS ERROR:", error);
      alert("Users could not be loaded.");
    }
  };

  // =====================================
  // GET ROLE PERMISSIONS FROM DATABASE
  // =====================================
  const fetchRolePermissions = async (role) => {
    try {
      setLoadingPermissions(true);
      const response = await axios.get(
        `${API_BASE_URL}/rolepermission/${encodeURIComponent(role)}`
      );

      const dbPermissions = response.data.permissions || [];
      const selectedPermissions = dbPermissions
        .filter((item) => Number(item.allowed) === 1)
        .map((item) => item.permission);

      setRolePermissions((previous) => ({
        ...previous,
        [role]: selectedPermissions,
      }));
    } catch (error) {
      console.log("FETCH ROLE PERMISSIONS ERROR:", error);
      setRolePermissions((previous) => ({
        ...previous,
        [role]: [],
      }));
    } finally {
      setLoadingPermissions(false);
    }
  };

  // =====================================
  // PAGE LOAD / FORM SCROLL
  // =====================================
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchRolePermissions(selectedRole);
  }, [selectedRole]);

  useEffect(() => {
    if (showForm) scrollToForm();
    // The form must render before the scroll action runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, editingId]);

  // Close details popup with Escape and prevent the page behind it from scrolling.
  useEffect(() => {
    if (!viewUser) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setViewUser(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewUser]);

  // =====================================
  // INPUT CHANGE
  // =====================================
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================
  // RESET FORM
  // =====================================
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "",
      status: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddUser = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "",
      status: "",
    });
    setEditingId(null);
    setViewUser(null);
    setShowForm(true);
  };

  // =====================================
  // ADD / UPDATE USER
  // =====================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      (editingId === null && !form.password) ||
      !form.role ||
      !form.status
    ) {
      alert("Please fill all user details.");
      return;
    }

    if (editingId !== null) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/User/${editingId}`,
          form
        );
        alert(response.data.message || "User updated successfully.");
        await fetchUsers();
        resetForm();
      } catch (error) {
        console.log("UPDATE USER ERROR:", error);
        alert(error.response?.data?.message || "User could not be updated.");
      }
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/User/register`,
        form
      );
      alert(response.data.message || "User added successfully.");
      await fetchUsers();
      resetForm();
    } catch (error) {
      console.log("ADD USER ERROR:", error);
      alert(error.response?.data?.message || "User could not be added.");
    }
  };

  // =====================================
  // VIEW USER
  // =====================================
  const handleView = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/User/${id}`);
      setViewUser(response.data);
      setShowForm(false);
    } catch (error) {
      console.log("VIEW USER ERROR:", error);
      alert("User details could not be loaded.");
    }
  };

  // =====================================
  // EDIT USER
  // =====================================
  const handleEdit = (user) => {
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      role: user.role || "",
      status: user.status || "",
    });
    setEditingId(user.id);
    setShowForm(true);
    setViewUser(null);
  };

  // =====================================
  // DELETE USER
  // =====================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/User/${id}`);
      alert(response.data.message || "User deleted successfully.");
      await fetchUsers();
      if (String(viewUser?.id) === String(id)) setViewUser(null);
    } catch (error) {
      console.log("DELETE USER ERROR:", error);
      alert(error.response?.data?.message || "User could not be deleted.");
    }
  };

  // =====================================
  // PERMISSION CHANGE / SELECT ALL / CLEAR ALL
  // =====================================
  const handlePermissionChange = (permission) => {
    const currentPermissions = rolePermissions[selectedRole] || [];
    const hasPermission = currentPermissions.includes(permission);

    if (hasPermission) {
      setRolePermissions((previous) => ({
        ...previous,
        [selectedRole]: currentPermissions.filter((item) => item !== permission),
      }));
    } else {
      setRolePermissions((previous) => ({
        ...previous,
        [selectedRole]: [...currentPermissions, permission],
      }));
    }
  };

  const handleSelectAll = () => {
    setRolePermissions((previous) => ({
      ...previous,
      [selectedRole]: [...permissions],
    }));
  };

  const handleClearAll = () => {
    setRolePermissions((previous) => ({
      ...previous,
      [selectedRole]: [],
    }));
  };

  // =====================================
  // SAVE PERMISSIONS
  // =====================================
  const handleSavePermissions = async () => {
    try {
      setSavingPermissions(true);
      const selectedPermissions = rolePermissions[selectedRole] || [];
      const response = await axios.put(
        `${API_BASE_URL}/rolepermission/${encodeURIComponent(selectedRole)}`,
        { permissions: selectedPermissions }
      );
      alert(response.data.message || "Permissions saved successfully.");
      // Keep the selected checkboxes on screen after save.
    } catch (error) {
      console.log("SAVE ROLE PERMISSIONS ERROR:", error);
      alert(error.response?.data?.message || "Permissions could not be saved.");
    } finally {
      setSavingPermissions(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Users &amp; Role Management</h1>
          <p className="page-subtitle">
            Manage system users, roles and configurable permissions.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAddUser}>
          <i className="bi bi-plus-lg me-2"></i>
          Add User
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Total Users</div>
            <h3 className="mb-0">{users.length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Active Users</div>
            <h3 className="mb-0">{users.filter((user) => user.status === "Active").length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Roles</div>
            <h3 className="mb-0">{roles.length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Inactive Users</div>
            <h3 className="mb-0">{users.filter((user) => user.status === "Inactive").length}</h3>
          </div></div>
        </div>
      </div>

      {/* ADD / EDIT USER FORM */}
      {showForm && (
        <div
          className="card mb-4"
          id="user-editor"
          ref={formRef}
          style={{ scrollMarginTop: "140px" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">
                {editingId !== null ? "Edit User" : "Add New User"}
              </h5>
              <small className="text-muted">Enter user account and role details.</small>
            </div>
            <button type="button" className="btn btn-light" onClick={resetForm} aria-label="Close user form">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="user-name">Full Name</label>
                  <input id="user-name" type="text" name="name" className="form-control" placeholder="Enter full name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="user-email">Email Address</label>
                  <input id="user-email" type="email" name="email" className="form-control" placeholder="Enter email address" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="user-phone">Phone Number</label>
                  <input id="user-phone" type="tel" name="phone" className="form-control" placeholder="Enter phone number" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="user-password">Password</label>
                  <input
                    id="user-password"
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder={editingId !== null ? "Leave blank to keep current password" : "Enter password"}
                    value={form.password}
                    onChange={handleChange}
                    required={editingId === null}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="user-role">User Role</label>
                  <select id="user-role" name="role" className="form-select" value={form.role} onChange={handleChange} required>
                    <option value="">Select Role</option>
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="user-status">User Status</label>
                  <select id="user-status" name="status" className="form-select" value={form.status} onChange={handleChange} required>
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary me-2">
                    <i className="bi bi-check-lg me-2"></i>
                    {editingId !== null ? "Update User" : "Save User"}
                  </button>
                  <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USERS LIST */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-1">All Users</h5>
          <small className="text-muted">View and manage system users.</small>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th><th>User</th><th>Phone</th><th>Role</th><th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted py-4">No users found.</td></tr>
                ) : users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="fw-semibold">{user.name}</div>
                      <small className="text-muted">{user.email}</small>
                    </td>
                    <td>{user.phone}</td>
                    <td><span className="badge bg-primary">{user.role}</span></td>
                    <td>
                      <span className={user.status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-2">
                        <button type="button" className="btn btn-sm btn-light" title="View User" aria-label={`View ${user.name}`} onClick={() => handleView(user.id)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        <button type="button" className="btn btn-sm btn-light" title="Edit User" aria-label={`Edit ${user.name}`} onClick={() => handleEdit(user)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button type="button" className="btn btn-sm btn-light text-danger" title="Delete User" aria-label={`Delete ${user.name}`} onClick={() => handleDelete(user.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROLE PERMISSIONS */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="card-title mb-1">Role Permissions</h5>
            <small className="text-muted">Configure access permissions for each role.</small>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-sm btn-light" onClick={handleSelectAll} disabled={loadingPermissions}>Select All</button>
            <button type="button" className="btn btn-sm btn-light" onClick={handleClearAll} disabled={loadingPermissions}>Clear All</button>
            <button type="button" className="btn btn-sm btn-primary" onClick={handleSavePermissions} disabled={savingPermissions || loadingPermissions}>
              {savingPermissions ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Saving...</>
              ) : (
                <><i className="bi bi-check-lg me-1"></i>Save Permissions</>
              )}
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <label className="form-label" htmlFor="select-permission-role">Select Role</label>
            <select id="select-permission-role" className="form-select" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} disabled={loadingPermissions}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>

          {loadingPermissions ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="text-muted mt-2">Loading permissions...</div>
            </div>
          ) : (
            <div className="row g-3">
              {permissions.map((permission) => {
                const isChecked = rolePermissions[selectedRole]?.includes(permission) || false;
                const checkboxId = `${selectedRole}-${permission}`.replace(/[^a-zA-Z0-9_-]/g, "-");
                return (
                  <div className="col-md-6 col-xl-4" key={permission}>
                    <div className="border rounded p-3 h-100">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={checkboxId}
                          checked={isChecked}
                          onChange={() => handlePermissionChange(permission)}
                        />
                        <label className="form-check-label fw-semibold" htmlFor={checkboxId}>{permission}</label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loadingPermissions && (
            <div className="mt-4">
              <small className="text-muted">
                {rolePermissions[selectedRole]?.length || 0} of {permissions.length} permissions selected for <strong>{selectedRole}</strong>
              </small>
            </div>
          )}
        </div>
      </div>

      {/* USER DETAILS POPUP - SAME DESIGN AS CUSTOMER POPUP */}
      {viewUser && (
        <div
          role="presentation"
          onClick={() => setViewUser(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            backgroundColor: "rgba(15, 23, 42, 0.62)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflowY: "auto",
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-popup-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.28)",
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e9ecef",
                background: "#f8fafc",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
            >
              <div>
                <h5 id="user-popup-title" className="mb-1">User Details</h5>
                <small className="text-muted">Complete user account information</small>
              </div>
              <button type="button" className="btn btn-light" onClick={() => setViewUser(null)} aria-label="Close user details popup">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Full Name</div>
                  <div className="fw-semibold">{viewUser.name || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">User ID</div>
                  <div className="fw-semibold">#{viewUser.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Phone Number</div>
                  <div className="fw-semibold">{viewUser.phone || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Email Address</div>
                  <div className="fw-semibold" style={{ overflowWrap: "anywhere" }}>{viewUser.email || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">User Role</div>
                  <span className="badge bg-primary">{viewUser.role || "Not assigned"}</span>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Status</div>
                  <span className={viewUser.status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                    {viewUser.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2" style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewUser(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => handleEdit(viewUser)}>
                <i className="bi bi-pencil me-2"></i>
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersRoles;
