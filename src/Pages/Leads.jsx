import API_BASE_URL from "../apiConfig";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function Leads() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewLead, setViewLead] = useState(null);

  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [brokerFilter, setBrokerFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");

  const [brokers, setBrokers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    source: "",
    broker_id: "",
    employee_id: "",
    status: "",
    notes: "",
  });

  // Scroll the form into view while leaving space for the fixed/sticky navbar.
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

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lead/all`);
      setLeads(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("FETCH LEADS ERROR:", error);
    }
  };

  const fetchBrokers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/broker/all`);
      setBrokers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("FETCH BROKERS ERROR:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee/all`);
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("FETCH EMPLOYEES ERROR:", error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchBrokers();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (showForm) scrollToForm();
    // Scroll after the form has been rendered/opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, editingId]);

  // Close the details popup with Escape and prevent background scrolling.
  useEffect(() => {
    if (!viewLead) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setViewLead(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewLead]);

  const filteredLeads = leads.filter((lead) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchText) ||
      String(lead.phone || "").toLowerCase().includes(searchText) ||
      lead.email?.toLowerCase().includes(searchText);
    const matchesStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "All" || lead.lead_source === sourceFilter;
    const matchesBroker =
      brokerFilter === "All" || String(lead.broker_id ?? "") === String(brokerFilter);
    const matchesEmployee =
      employeeFilter === "All" || String(lead.employee_id ?? "") === String(employeeFilter);

    return matchesSearch && matchesStatus && matchesSource && matchesBroker && matchesEmployee;
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  const clearForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      source: "",
      broker_id: "",
      employee_id: "",
      status: "",
      notes: "",
    });
    setEditingId(null);
  };

  const resetForm = () => {
    clearForm();
    setShowForm(false);
  };

  const handleAdd = () => {
    clearForm();
    setViewLead(null);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.source ||
      !form.broker_id ||
      !form.employee_id ||
      !form.status
    ) {
      alert("Please fill all lead details.");
      return;
    }

    const leadData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      lead_source: form.source,
      broker_id: Number(form.broker_id),
      employee_id: Number(form.employee_id),
      status: form.status,
      notes: form.notes.trim(),
    };

    try {
      if (editingId !== null) {
        await axios.put(`${API_BASE_URL}/lead/${editingId}`, leadData);
        alert("Lead updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/lead/add`, leadData);
        alert("Lead added successfully.");
      }

      await fetchLeads();
      resetForm();
    } catch (error) {
      console.error("SAVE LEAD ERROR:", error);
      alert(error.response?.data?.message || "Lead could not be saved.");
    }
  };

  const handleEdit = (lead) => {
    setViewLead(null);
    setForm({
      name: lead.name || "",
      phone: lead.phone || "",
      email: lead.email || "",
      source: lead.lead_source || "",
      broker_id: lead.broker_id != null ? String(lead.broker_id) : "",
      employee_id: lead.employee_id != null ? String(lead.employee_id) : "",
      status: lead.status || "",
      notes: lead.notes || "",
    });
    setEditingId(lead.id);
    setShowForm(true);
  };

  const handleView = (lead) => {
    setShowForm(false);
    setViewLead(lead);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/lead/${id}`);
      alert("Lead deleted successfully.");
      await fetchLeads();
      if (String(viewLead?.id) === String(id)) setViewLead(null);
    } catch (error) {
      console.error("DELETE LEAD ERROR:", error);
      alert(error.response?.data?.message || "Lead could not be deleted.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSourceFilter("All");
    setBrokerFilter("All");
    setEmployeeFilter("All");
  };

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Lead Management</h1>
          <p className="page-subtitle">
            Manage leads, lead sources, assignments and lead status.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAdd}>
          <i className="bi bi-plus-lg me-2"></i>
          Add New Lead
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Total Leads</div>
            <h3 className="mb-0">{leads.length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">New Leads</div>
            <h3 className="mb-0">{leads.filter((lead) => lead.status === "New").length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Follow-ups</div>
            <h3 className="mb-0">{leads.filter((lead) => lead.status === "Follow-up").length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Converted Leads</div>
            <h3 className="mb-0">{leads.filter((lead) => lead.status === "Converted").length}</h3>
          </div></div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div
          className="card mb-4"
          ref={formRef}
          id="lead-editor"
          style={{ scrollMarginTop: "140px" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">{editingId !== null ? "Edit Lead" : "Add New Lead"}</h5>
              <small className="text-muted">Enter lead details and assignment information.</small>
            </div>
            <button type="button" className="btn btn-light" aria-label="Close lead form" onClick={resetForm}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">Lead Name</label>
                  <input type="text" name="name" className="form-control" placeholder="Enter lead name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" name="phone" className="form-control" placeholder="Enter phone number" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" className="form-control" placeholder="Enter email address" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Lead Source</label>
                  <select name="source" className="form-select" value={form.source} onChange={handleChange} required>
                    <option value="">Select Lead Source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Assign to Broker</label>
                  <select name="broker_id" className="form-select" value={form.broker_id} onChange={handleChange} required>
                    <option value="">Select Broker</option>
                    {brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Assign to Employee</label>
                  <select name="employee_id" className="form-select" value={form.employee_id} onChange={handleChange} required>
                    <option value="">Select Employee</option>
                    {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Lead Status</label>
                  <select name="status" className="form-select" value={form.status} onChange={handleChange} required>
                    <option value="">Select Status</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Notes</label>
                  <textarea name="notes" className="form-control" rows="3" placeholder="Enter lead notes" value={form.notes} onChange={handleChange}></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary me-2"><i className="bi bi-check-lg me-2"></i>{editingId !== null ? "Update Lead" : "Save Lead"}</button>
                  <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {/* LEAD DETAILS POPUP - SAME DESIGN AS CUSTOMER POPUP */}
      {viewLead && (
        <div
          role="presentation"
          onClick={() => setViewLead(null)}
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
            aria-labelledby="lead-popup-title"
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
                <h5 id="lead-popup-title" className="mb-1">
                  Lead Details
                </h5>
                <small className="text-muted">
                  Complete lead information
                </small>
              </div>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => setViewLead(null)}
                aria-label="Close lead details popup"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* POPUP DETAILS */}
            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Lead Name</div>
                  <div className="fw-semibold">
                    {viewLead.name || "—"}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small mb-1">Lead ID</div>
                  <div className="fw-semibold">
                    #{viewLead.id ?? "—"}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small mb-1">Phone Number</div>
                  <div className="fw-semibold">
                    {viewLead.phone || "—"}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small mb-1">Email Address</div>
                  <div
                    className="fw-semibold"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {viewLead.email || "—"}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small mb-1">Lead Source</div>
                  <div className="fw-semibold">
                    {viewLead.lead_source || "—"}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small mb-1">Assigned Broker</div>
                  <div className="fw-semibold">
                    {viewLead.broker_name || "Not Assigned"}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small mb-1">Assigned Employee</div>
                  <div className="fw-semibold">
                    {viewLead.employee_name || "Not Assigned"}
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="text-muted small mb-1">Lead Status</div>
                  <span
                    className={
                      viewLead.status === "Converted"
                        ? "badge bg-success"
                        : viewLead.status === "Lost"
                        ? "badge bg-danger"
                        : viewLead.status === "Follow-up"
                        ? "badge bg-warning text-dark"
                        : viewLead.status === "Contacted"
                        ? "badge bg-info text-dark"
                        : "badge bg-primary"
                    }
                  >
                    {viewLead.status || "Unknown"}
                  </span>
                </div>

                <div className="col-12">
                  <div className="text-muted small mb-1">Notes</div>
                  <div
                    className="fw-semibold"
                    style={{
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {viewLead.notes || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* POPUP FOOTER */}
            <div
              className="d-flex justify-content-end gap-2"
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e9ecef",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setViewLead(null)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleEdit(viewLead)}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAD LIST */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="card-title mb-1">All Leads</h5>
              <small className="text-muted">View and manage all registered leads.</small>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <input type="text" className="form-control" placeholder="Search lead..." value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: "200px" }} aria-label="Search leads" />
              <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ width: "150px" }} aria-label="Filter by status">
                <option value="All">All Status</option><option value="New">New</option><option value="Contacted">Contacted</option><option value="Follow-up">Follow-up</option><option value="Converted">Converted</option><option value="Lost">Lost</option>
              </select>
              <select className="form-select" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} style={{ width: "160px" }} aria-label="Filter by source">
                <option value="All">All Sources</option><option value="Website">Website</option><option value="Referral">Referral</option><option value="Social Media">Social Media</option><option value="Advertisement">Advertisement</option><option value="Walk-in">Walk-in</option><option value="Other">Other</option>
              </select>
              <select className="form-select" value={brokerFilter} onChange={(event) => setBrokerFilter(event.target.value)} style={{ width: "160px" }} aria-label="Filter by broker">
                <option value="All">All Brokers</option>
                {brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.name}</option>)}
              </select>
              <select className="form-select" value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)} style={{ width: "170px" }} aria-label="Filter by employee">
                <option value="All">All Employees</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </select>
              <button type="button" className="btn btn-light" onClick={resetFilters}><i className="bi bi-arrow-counterclockwise me-1"></i>Reset</button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>#</th><th>Lead</th><th>Contact</th><th>Source</th><th>Broker</th><th>Employee</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr><td colSpan="8" className="text-center text-muted py-4">No leads found.</td></tr>
                ) : (
                  filteredLeads.map((lead, index) => (
                    <tr key={lead.id}>
                      <td>{index + 1}</td>
                      <td><div className="fw-semibold">{lead.name}</div><small className="text-muted">Lead #{lead.id}</small></td>
                      <td><div>{lead.phone}</div><small className="text-muted">{lead.email}</small></td>
                      <td>{lead.lead_source || "—"}</td>
                      <td>{lead.broker_name || "Not Assigned"}</td>
                      <td>{lead.employee_name || "Not Assigned"}</td>
                      <td><span className={lead.status === "Converted" ? "badge bg-success" : lead.status === "Follow-up" ? "badge bg-warning text-dark" : lead.status === "Lost" ? "badge bg-danger" : lead.status === "Contacted" ? "badge bg-info text-dark" : "badge bg-primary"}>{lead.status}</span></td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-2">
                          <button type="button" className="btn btn-sm btn-light" title="View Lead" aria-label={`View ${lead.name}`} onClick={() => handleView(lead)}><i className="bi bi-eye"></i></button>
                          <button type="button" className="btn btn-sm btn-light" title="Edit Lead" aria-label={`Edit ${lead.name}`} onClick={() => handleEdit(lead)}><i className="bi bi-pencil"></i></button>
                          <button type="button" className="btn btn-sm btn-light text-danger" title="Delete Lead" aria-label={`Delete ${lead.name}`} onClick={() => handleDelete(lead.id)}><i className="bi bi-trash"></i></button>
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
    </div>
  );
}

export default Leads;
