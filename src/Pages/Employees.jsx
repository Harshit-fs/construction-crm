import API_BASE_URL from "../apiConfig";
import  { useEffect, useState } from "react";
import axios from "axios";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [projects, setProjects] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);

  const [form, setForm] = useState({
    name: "",
    designation: "",
    department: "",
    phone: "",
    email: "",
    project_id: "",
    status: "",
  });

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee/all`);
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("FETCH EMPLOYEES ERROR:", error);
      alert("Employees could not be loaded.");
    }
  };

  // FETCH PROJECTS
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Project/all`);
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("FETCH PROJECTS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  // Close employee details popup with Escape and prevent background scrolling.
  useEffect(() => {
    if (!viewEmployee) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setViewEmployee(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewEmployee]);

  // SEARCH & FILTER
  const filteredEmployees = employees.filter((employee) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchText) ||
      employee.email?.toLowerCase().includes(searchText) ||
      String(employee.phone || "").toLowerCase().includes(searchText) ||
      employee.designation?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || employee.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "All" || employee.department === departmentFilter;
    const matchesProject =
      projectFilter === "All" ||
      String(employee.project_id ?? "") === String(projectFilter);

    return matchesSearch && matchesStatus && matchesDepartment && matchesProject;
  });

  // INPUT CHANGE
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  // RESET FORM
  const resetForm = () => {
    setForm({
      name: "",
      designation: "",
      department: "",
      phone: "",
      email: "",
      project_id: "",
      status: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ADD / UPDATE EMPLOYEE
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.designation.trim() ||
      !form.department.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.status
    ) {
      alert("Please fill all required employee details.");
      return;
    }

    const employeeData = {
      name: form.name.trim(),
      designation: form.designation.trim(),
      department: form.department.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      project_id: form.project_id ? Number(form.project_id) : null,
      status: form.status,
    };

    try {
      if (editingId !== null) {
        await axios.put(
          `${API_BASE_URL}/employee/${editingId}`,
          employeeData
        );
        alert("Employee updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/employee/add`, employeeData);
        alert("Employee added successfully.");
      }

      await fetchEmployees();
      resetForm();
    } catch (error) {
      console.error("SAVE EMPLOYEE ERROR:", error);
      alert(error.response?.data?.message || "Employee could not be saved.");
    }
  };

  // VIEW EMPLOYEE IN CUSTOMER-STYLE POPUP
  const handleView = (employee) => {
    setShowForm(false);
    setViewEmployee(employee);
  };

  // EDIT EMPLOYEE
  const handleEdit = (employee) => {
    setForm({
      name: employee.name || "",
      designation: employee.designation || "",
      department: employee.department || "",
      phone: employee.phone || "",
      email: employee.email || "",
      project_id:
        employee.project_id !== null && employee.project_id !== undefined
          ? String(employee.project_id)
          : "",
      status: employee.status || "",
    });
    setEditingId(employee.id);
    setViewEmployee(null);
    setShowForm(true);
    window.setTimeout(() => {
      const editor = document.getElementById("employee-editor");
      editor?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  };

  // DELETE EMPLOYEE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/employee/${id}`);
      await fetchEmployees();
      if (String(viewEmployee?.id) === String(id)) setViewEmployee(null);
      alert("Employee deleted successfully.");
    } catch (error) {
      console.error("DELETE EMPLOYEE ERROR:", error);
      alert(error.response?.data?.message || "Employee could not be deleted.");
    }
  };

  // ADD EMPLOYEE
  const handleAddEmployee = () => {
    setForm({
      name: "",
      designation: "",
      department: "",
      phone: "",
      email: "",
      project_id: "",
      status: "",
    });
    setEditingId(null);
    setViewEmployee(null);
    setShowForm(true);
    window.setTimeout(() => {
      const editor = document.getElementById("employee-editor");
      editor?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  };

  // SUMMARY COUNTS
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;
  const inactiveEmployees = employees.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">
            Manage employees, departments, designations and assigned projects.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddEmployee}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Employee
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted mb-2">Total Employees</div>
              <h3 className="mb-0">{totalEmployees}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted mb-2">Active Employees</div>
              <h3 className="mb-0">{activeEmployees}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted mb-2">Inactive Employees</div>
              <h3 className="mb-0">{inactiveEmployees}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div
          className="card mb-4"
          id="employee-editor"
          style={{ scrollMarginTop: "140px" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">
                {editingId !== null ? "Edit Employee" : "Add New Employee"}
              </h5>
              <small className="text-muted">Enter employee information.</small>
            </div>
            <button
              type="button"
              className="btn btn-light"
              aria-label="Close employee form"
              onClick={resetForm}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="employee-name">Employee Name</label>
                  <input
                    id="employee-name"
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter employee name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="employee-designation">Designation</label>
                  <input
                    id="employee-designation"
                    type="text"
                    name="designation"
                    className="form-control"
                    placeholder="Example: Site Engineer"
                    value={form.designation}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="employee-department">Department</label>
                  <input
                    id="employee-department"
                    type="text"
                    name="department"
                    className="form-control"
                    placeholder="Example: Construction"
                    value={form.department}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="employee-phone">Phone</label>
                  <input
                    id="employee-phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="employee-email">Email</label>
                  <input
                    id="employee-email"
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="employee-project">Assigned Project</label>
                  <select
                    id="employee-project"
                    name="project_id"
                    className="form-select"
                    value={form.project_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="employee-status">Status</label>
                  <select
                    id="employee-status"
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-primary me-2">
                    <i className="bi bi-check-lg me-2"></i>
                    {editingId !== null ? "Update Employee" : "Save Employee"}
                  </button>
                  <button type="button" className="btn btn-light" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE TABLE */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="card-title mb-1">All Employees</h5>
              <small className="text-muted">View and manage all employees.</small>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <input
                type="text"
                className="form-control"
                placeholder="Search employee..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: "200px" }}
                aria-label="Search employees"
              />

              <select
                className="form-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ width: "150px" }}
                aria-label="Filter by status"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                className="form-select"
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                style={{ width: "170px" }}
                aria-label="Filter by department"
              >
                <option value="All">All Departments</option>
                {[...new Set(employees.map((employee) => employee.department).filter(Boolean))].map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>

              <select
                className="form-select"
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
                style={{ width: "170px" }}
                aria-label="Filter by project"
              >
                <option value="All">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setDepartmentFilter("All");
                  setProjectFilter("All");
                }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee, index) => (
                    <tr key={employee.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="fw-semibold">{employee.name}</div>
                        <small className="text-muted">{employee.email}</small>
                      </td>
                      <td>{employee.designation}</td>
                      <td>{employee.department}</td>
                      <td>{employee.phone}</td>
                      <td>
                        {employee.project_name || (
                          <span className="text-muted">Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <span className={employee.status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                          {employee.status || "Unknown"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-light"
                            title="View Employee"
                            aria-label={`View ${employee.name}`}
                            onClick={() => handleView(employee)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light"
                            title="Edit Employee"
                            aria-label={`Edit ${employee.name}`}
                            onClick={() => handleEdit(employee)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light text-danger"
                            title="Delete Employee"
                            aria-label={`Delete ${employee.name}`}
                            onClick={() => handleDelete(employee.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EMPLOYEE DETAILS POPUP - SAME DESIGN AS CUSTOMER POPUP */}
      {viewEmployee && (
        <div
          role="presentation"
          onClick={() => setViewEmployee(null)}
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
            aria-labelledby="employee-popup-title"
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
            {/* POPUP HEADER */}
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
                <h5 id="employee-popup-title" className="mb-1">Employee Details</h5>
                <small className="text-muted">Complete employee information</small>
              </div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setViewEmployee(null)}
                aria-label="Close employee details popup"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* POPUP DETAILS */}
            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Employee Name</div>
                  <div className="fw-semibold">{viewEmployee.name || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Employee ID</div>
                  <div className="fw-semibold">#{viewEmployee.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Designation</div>
                  <div className="fw-semibold">{viewEmployee.designation || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Department</div>
                  <div className="fw-semibold">{viewEmployee.department || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Phone Number</div>
                  <div className="fw-semibold">{viewEmployee.phone || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Email Address</div>
                  <div className="fw-semibold" style={{ overflowWrap: "anywhere" }}>
                    {viewEmployee.email || "—"}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Assigned Project</div>
                  <div className="fw-semibold">
                    {viewEmployee.project_name ||
                      projects.find((project) => String(project.id) === String(viewEmployee.project_id))?.name ||
                      "Not Assigned"}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Status</div>
                  <span className={viewEmployee.status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                    {viewEmployee.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* POPUP FOOTER */}
            <div
              className="d-flex justify-content-end gap-2"
              style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setViewEmployee(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleEdit(viewEmployee)}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
