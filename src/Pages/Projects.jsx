import API_BASE_URL from "../apiConfig";
import  { useEffect, useRef, useState } from "react";
import axios from "axios";

function Projects() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewProject, setViewProject] = useState(null);

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    location: "",
    type: "",
    description: "",
    image: "",
    startDate: "",
    completionDate: "",
    status: "",
    team: "",
    budget: "",
    progress: "",
  });

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee/all`);
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH EMPLOYEES ERROR:", error);
    }
  };

  // FETCH PROJECTS
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Project/all`);
      const projectRows = Array.isArray(response.data) ? response.data : [];

      const formattedProjects = projectRows.map((project) => ({
        id: project.id,
        name: project.name || "",
        location: project.location || "",
        type: project.project_type || "",
        description: project.description || "",
        image: project.image || "",
        startDate: project.start_date
          ? String(project.start_date).split("T")[0]
          : "",
        completionDate: project.completion_date
          ? String(project.completion_date).split("T")[0]
          : "",
        status: project.status || "",
        team: project.team || "",
        budget: project.budget ?? 0,
        progress: Number(project.progress || 0),
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.log("FETCH PROJECTS ERROR:", error);
      alert("Projects could not be loaded.");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  // Scroll the Add/Edit form into view, accounting for a fixed/sticky navbar
  // and a scrollable CRM content area.
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
    }, 250);
  };

  // Automatically scroll to the form whenever Add or Edit opens it.
  useEffect(() => {
    if (showForm) scrollToForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, editingId]);

  // Match the popup behavior used on the Customers page.
  useEffect(() => {
    if (!viewProject) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setViewProject(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewProject]);

  const filteredProjects = projects.filter((project) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      project.name?.toLowerCase().includes(searchText) ||
      project.location?.toLowerCase().includes(searchText);
    const matchesStatus = statusFilter === "All" || project.status === statusFilter;
    const matchesType = typeFilter === "All" || project.type === typeFilter;
    const matchesTeam = teamFilter === "All" || project.team === teamFilter;

    return matchesSearch && matchesStatus && matchesType && matchesTeam;
  });

  // INPUT CHANGE
  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((previousForm) => ({
      ...previousForm,
      [name]: files ? files[0]?.name || "" : value,
    }));
  };

  // RESET FORM
  const resetForm = () => {
    setForm({
      name: "",
      location: "",
      type: "",
      description: "",
      image: "",
      startDate: "",
      completionDate: "",
      status: "",
      team: "",
      budget: "",
      progress: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ADD / UPDATE PROJECT
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.location.trim() ||
      !form.type ||
      !form.description.trim() ||
      !form.startDate ||
      !form.completionDate ||
      !form.status ||
      !form.team ||
      form.budget === "" ||
      form.progress === ""
    ) {
      alert("Please fill all project details.");
      return;
    }

    const projectData = {
      name: form.name.trim(),
      location: form.location.trim(),
      project_type: form.type,
      description: form.description.trim(),
      image: form.image || null,
      start_date: form.startDate || null,
      completion_date: form.completionDate || null,
      status: form.status,
      team: form.team,
      budget: Number(form.budget),
      progress: Number(form.progress),
    };

    try {
      if (editingId !== null) {
        await axios.put(`${API_BASE_URL}/Project/${editingId}`, projectData);
        alert("Project updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/Project/add`, projectData);
        alert("Project added successfully.");
      }

      await fetchProjects();
      resetForm();
    } catch (error) {
      console.log("SAVE PROJECT ERROR:", error);
      if (error.response) console.log("SERVER RESPONSE:", error.response.data);
      alert(error.response?.data?.message || "Project could not be saved.");
    }
  };

  // VIEW PROJECT
  const handleView = (project) => {
    setShowForm(false);
    setViewProject(project);
  };

  // EDIT PROJECT
  const handleEdit = (project) => {
    setForm({
      name: project.name || "",
      location: project.location || "",
      type: project.type || "",
      description: project.description || "",
      image: project.image || "",
      startDate: project.startDate || "",
      completionDate: project.completionDate || "",
      status: project.status || "",
      team: project.team || "",
      budget: project.budget ?? "",
      progress: project.progress ?? "",
    });

    setEditingId(project.id);
    setViewProject(null);
    setShowForm(true);
  };

  // DELETE PROJECT
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/Project/${id}`);
      if (String(viewProject?.id) === String(id)) setViewProject(null);
      await fetchProjects();
      alert("Project deleted successfully.");
    } catch (error) {
      console.log("DELETE PROJECT ERROR:", error);
      alert(error.response?.data?.message || "Project could not be deleted.");
    }
  };

  const handleAddProject = () => {
    resetForm();
    setViewProject(null);
    setShowForm(true);
  };

  // FORMAT BUDGET
  const formatBudget = (budget) => {
    if (budget === null || budget === undefined || budget === "") return "₹0";
    return `₹${Number(budget).toLocaleString("en-IN")}`;
  };

  const projectStatusClass = (status) => {
    if (status === "Completed") return "badge bg-success";
    if (status === "Ongoing") return "badge bg-primary";
    if (status === "On Hold") return "badge bg-warning text-dark";
    return "badge bg-info text-dark";
  };

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Project Management</h1>
          <p className="page-subtitle">
            Manage construction projects, teams, budgets, timelines and progress.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAddProject}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Project
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Total Projects</div>
            <h3 className="mb-0">{projects.length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Ongoing Projects</div>
            <h3 className="mb-0">{projects.filter((project) => project.status === "Ongoing").length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Upcoming Projects</div>
            <h3 className="mb-0">{projects.filter((project) => project.status === "Upcoming").length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Completed Projects</div>
            <h3 className="mb-0">{projects.filter((project) => project.status === "Completed").length}</h3>
          </div></div>
        </div>
      </div>

      {/* ADD / EDIT PROJECT FORM */}
      {showForm && (
        <div
          className="card mb-4"
          id="project-editor"
          ref={formRef}
          style={{ scrollMarginTop: "140px" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">
                {editingId !== null ? "Edit Project" : "Add New Project"}
              </h5>
              <small className="text-muted">Enter complete project information below.</small>
            </div>
            <button type="button" className="btn btn-light" onClick={resetForm} aria-label="Close project form">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-name">Project Name</label>
                  <input id="project-name" type="text" name="name" className="form-control" placeholder="Enter project name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-location">Project Location</label>
                  <input id="project-location" type="text" name="location" className="form-control" placeholder="Enter project location" value={form.location} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-type">Project Type</label>
                  <select id="project-type" name="type" className="form-select" value={form.type} onChange={handleChange} required>
                    <option value="">Select Project Type</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Villa">Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Plot">Plot Development</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-image">Project Image</label>
                  <input id="project-image" type="file" name="image" className="form-control" accept="image/*" onChange={handleChange} />
                  {form.image && <small className="text-muted">Selected: {form.image}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-start-date">Start Date</label>
                  <input id="project-start-date" type="date" name="startDate" className="form-control" value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-completion-date">Expected Completion Date</label>
                  <input id="project-completion-date" type="date" name="completionDate" className="form-control" value={form.completionDate} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-status">Project Status</label>
                  <select id="project-status" name="status" className="form-select" value={form.status} onChange={handleChange} required>
                    <option value="">Select Status</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-team">Assigned Team</label>
                  <select id="project-team" name="team" className="form-select" value={form.team} onChange={handleChange} required>
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.name}>
                        {employee.name} - {employee.designation}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-budget">Project Budget</label>
                  <input id="project-budget" type="number" name="budget" className="form-control" placeholder="Example: 25000000" min="0" value={form.budget} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="project-progress">Project Progress (%)</label>
                  <input id="project-progress" type="number" name="progress" className="form-control" placeholder="Enter progress" min="0" max="100" value={form.progress} onChange={handleChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="project-description">Project Description</label>
                  <textarea id="project-description" name="description" className="form-control" rows="4" placeholder="Enter project description" value={form.description} onChange={handleChange} required></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary me-2">
                    <i className="bi bi-check-lg me-2"></i>
                    {editingId !== null ? "Update Project" : "Save Project"}
                  </button>
                  <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT LIST */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="card-title mb-1">All Projects</h5>
              <small className="text-muted">View and manage all construction projects.</small>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <input type="text" className="form-control" placeholder="Search project..." value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: "200px" }} aria-label="Search projects" />
              <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ width: "150px" }} aria-label="Filter by status">
                <option value="All">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
              <select className="form-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} style={{ width: "160px" }} aria-label="Filter by project type">
                <option value="All">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="Plot">Plot Development</option>
                <option value="Other">Other</option>
              </select>
              <select className="form-select" value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)} style={{ width: "180px" }} aria-label="Filter by team">
                <option value="All">All Teams</option>
                {[...new Set(projects.map((project) => project.team).filter(Boolean))].map((team) => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </select>
              <button type="button" className="btn btn-light" onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setTypeFilter("All");
                setTeamFilter("All");
              }}>
                <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th><th>Project</th><th>Location</th><th>Type</th><th>Budget</th><th>Progress</th><th>Status</th><th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr><td colSpan="8" className="text-center text-muted py-4">No projects found.</td></tr>
                ) : (
                  filteredProjects.map((project, index) => (
                    <tr key={project.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="fw-semibold">{project.name}</div>
                        <small className="text-muted">{project.startDate || "—"}</small>
                      </td>
                      <td>{project.location || "—"}</td>
                      <td>{project.type || "—"}</td>
                      <td>{formatBudget(project.budget)}</td>
                      <td style={{ minWidth: "150px" }}>
                        <div className="d-flex justify-content-between mb-1"><small>{project.progress}%</small></div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div className="progress-bar" role="progressbar" aria-valuenow={project.progress} aria-valuemin="0" aria-valuemax="100" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </td>
                      <td><span className={projectStatusClass(project.status)}>{project.status || "Unknown"}</span></td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <button type="button" className="btn btn-sm btn-light" title="View Project" aria-label={`View ${project.name}`} onClick={() => handleView(project)}><i className="bi bi-eye"></i></button>
                          <button type="button" className="btn btn-sm btn-light" title="Edit Project" aria-label={`Edit ${project.name}`} onClick={() => handleEdit(project)}><i className="bi bi-pencil"></i></button>
                          <button type="button" className="btn btn-sm btn-light text-danger" title="Delete Project" aria-label={`Delete ${project.name}`} onClick={() => handleDelete(project.id)}><i className="bi bi-trash"></i></button>
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

      {/* PROJECT DETAILS POPUP - SAME DESIGN AS CUSTOMER POPUP */}
      {viewProject && (
        <div
          role="presentation"
          onClick={() => setViewProject(null)}
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
            aria-labelledby="project-popup-title"
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
                <h5 id="project-popup-title" className="mb-1">Project Details</h5>
                <small className="text-muted">Complete project information</small>
              </div>
              <button type="button" className="btn btn-light" onClick={() => setViewProject(null)} aria-label="Close project details popup">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* POPUP DETAILS */}
            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project Name</div>
                  <div className="fw-semibold text-break">{viewProject.name || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project ID</div>
                  <div className="fw-semibold">#{viewProject.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project Location</div>
                  <div className="fw-semibold text-break">{viewProject.location || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project Type</div>
                  <div className="fw-semibold">{viewProject.type || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project Budget</div>
                  <div className="fw-semibold">{formatBudget(viewProject.budget)}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Assigned Team</div>
                  <div className="fw-semibold text-break">{viewProject.team || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Start Date</div>
                  <div className="fw-semibold">{viewProject.startDate || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Expected Completion</div>
                  <div className="fw-semibold">{viewProject.completionDate || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project Status</div>
                  <span className={projectStatusClass(viewProject.status)}>{viewProject.status || "Unknown"}</span>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project Image</div>
                  <div className="fw-semibold text-break">{viewProject.image || "Not provided"}</div>
                </div>
                <div className="col-12">
                  <div className="text-muted small mb-2">Project Progress</div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      aria-valuenow={Number(viewProject.progress) || 0}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      style={{ width: `${Math.min(100, Math.max(0, Number(viewProject.progress) || 0))}%` }}
                    ></div>
                  </div>
                  <small className="text-muted">{Number(viewProject.progress) || 0}% completed</small>
                </div>
                <div className="col-12">
                  <div className="text-muted small mb-1">Project Description</div>
                  <div className="fw-semibold" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                    {viewProject.description || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* POPUP FOOTER */}
            <div className="d-flex justify-content-end gap-2" style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewProject(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => handleEdit(viewProject)}>
                <i className="bi bi-pencil me-2"></i>
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
