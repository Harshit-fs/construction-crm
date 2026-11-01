import API_BASE_URL from "../apiConfig";
import  { useEffect, useRef, useState } from "react";
import axios from "axios";

function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewFollowUp, setViewFollowUp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [leadFilter, setLeadFilter] = useState("All");
  const [brokerFilter, setBrokerFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");

  const formRef = useRef(null);

  const emptyForm = {
    title: "",
    follow_up_date: "",
    customer_id: "",
    lead_id: "",
    broker_id: "",
    employee_id: "",
    notes: "",
    status: "Pending",
  };

  const [form, setForm] = useState(emptyForm);

  // Scroll the editor into view, accounting for a fixed/sticky CRM header.
  const getStickyHeaderBottom = () => {
    const selectors = [
      "header", "nav", ".navbar", ".site-header", ".topbar",
      ".app-header", ".main-header", ".main-navbar", ".header",
    ];
    let bottom = 0;

    document.querySelectorAll(selectors.join(",")).forEach((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (
        (styles.position === "fixed" || styles.position === "sticky") &&
        rect.height > 0 && rect.top <= 8 && rect.bottom > 0
      ) {
        bottom = Math.max(bottom, rect.bottom);
      }
    });

    return bottom;
  };

  const scrollToForm = () => {
    window.setTimeout(() => {
      const element = formRef.current;
      if (!element) return;

      let scrollParent = element.parentElement;
      while (scrollParent && scrollParent !== document.body) {
        const styles = window.getComputedStyle(scrollParent);
        const canScroll =
          ["auto", "scroll", "overlay"].includes(styles.overflowY) &&
          scrollParent.scrollHeight > scrollParent.clientHeight;
        if (canScroll) break;
        scrollParent = scrollParent.parentElement;
      }

      const elementRect = element.getBoundingClientRect();
      if (scrollParent && scrollParent !== document.body) {
        const parentRect = scrollParent.getBoundingClientRect();
        const headerBottom = getStickyHeaderBottom();
        const offset =
          headerBottom > parentRect.top && headerBottom < parentRect.bottom
            ? headerBottom - parentRect.top + 16
            : 20;
        scrollParent.scrollTo({
          top: scrollParent.scrollTop + elementRect.top - parentRect.top - offset,
          behavior: "smooth",
        });
      } else {
        const offset = Math.max(20, getStickyHeaderBottom() + 16);
        window.scrollTo({
          top: window.scrollY + elementRect.top - offset,
          behavior: "smooth",
        });
      }
    }, 300);
  };

  const fetchFollowUps = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/followup/all`);
      setFollowUps(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH FOLLOW-UPS ERROR:", error);
      alert(error.response?.data?.message || "Follow-ups could not be loaded.");
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/all`);
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH CUSTOMERS ERROR:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lead/all`);
      setLeads(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH LEADS ERROR:", error);
    }
  };

  const fetchBrokers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/broker/all`);
      setBrokers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH BROKERS ERROR:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employee/all`);
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH EMPLOYEES ERROR:", error);
    }
  };

  useEffect(() => {
    fetchFollowUps();
    fetchCustomers();
    fetchLeads();
    fetchBrokers();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (showForm) scrollToForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, editId]);

  // Match the other CRM detail popups: Escape closes it and the page stays locked.
  useEffect(() => {
    if (!viewFollowUp) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") setViewFollowUp(null);
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewFollowUp]);

  const filteredFollowUps = followUps.filter((item) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(searchText) ||
      item.customer_name?.toLowerCase().includes(searchText) ||
      item.lead_name?.toLowerCase().includes(searchText) ||
      item.broker_name?.toLowerCase().includes(searchText) ||
      item.employee_name?.toLowerCase().includes(searchText) ||
      item.notes?.toLowerCase().includes(searchText);
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesCustomer =
      customerFilter === "All" || String(item.customer_id ?? "") === String(customerFilter);
    const matchesLead =
      leadFilter === "All" || String(item.lead_id ?? "") === String(leadFilter);
    const matchesBroker =
      brokerFilter === "All" || String(item.broker_id ?? "") === String(brokerFilter);
    const matchesEmployee =
      employeeFilter === "All" || String(item.employee_id ?? "") === String(employeeFilter);

    return (
      matchesSearch && matchesStatus && matchesCustomer && matchesLead &&
      matchesBroker && matchesEmployee
    );
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setViewFollowUp(null);
    setShowForm(true);
  };

  const handleView = (item) => {
    setShowForm(false);
    setViewFollowUp(item);
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title || "",
      follow_up_date: item.follow_up_date ? String(item.follow_up_date).substring(0, 10) : "",
      customer_id: item.customer_id == null ? "" : String(item.customer_id),
      lead_id: item.lead_id == null ? "" : String(item.lead_id),
      broker_id: item.broker_id == null ? "" : String(item.broker_id),
      employee_id: item.employee_id == null ? "" : String(item.employee_id),
      notes: item.notes || "",
      status: item.status || "Pending",
    });
    setEditId(item.id);
    setViewFollowUp(null);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = {
        title: form.title.trim(),
        follow_up_date: form.follow_up_date,
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        lead_id: form.lead_id ? Number(form.lead_id) : null,
        broker_id: form.broker_id ? Number(form.broker_id) : null,
        employee_id: form.employee_id ? Number(form.employee_id) : null,
        notes: form.notes,
        status: form.status,
      };

      if (editId !== null) {
        await axios.put(`${API_BASE_URL}/followup/${editId}`, data);
        alert("Follow-up updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/followup/add`, data);
        alert("Follow-up added successfully.");
      }

      await fetchFollowUps();
      resetForm();
    } catch (error) {
      console.log("SAVE FOLLOW-UP ERROR:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this follow-up?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/followup/${id}`);
      alert("Follow-up deleted successfully.");
      await fetchFollowUps();
      if (String(viewFollowUp?.id) === String(id)) setViewFollowUp(null);
    } catch (error) {
      console.log("DELETE FOLLOW-UP ERROR:", error);
      alert(error.response?.data?.message || "Error deleting follow-up.");
    }
  };

  const handleStatusChange = async (item) => {
    if (item.status === "Completed") return;

    try {
      await axios.put(`${API_BASE_URL}/followup/${item.id}`, {
        title: item.title,
        follow_up_date: item.follow_up_date
          ? String(item.follow_up_date).substring(0, 10)
          : "",
        customer_id: item.customer_id || null,
        lead_id: item.lead_id || null,
        broker_id: item.broker_id || null,
        employee_id: item.employee_id || null,
        notes: item.notes || "",
        status: "Completed",
      });
      await fetchFollowUps();
      if (String(viewFollowUp?.id) === String(item.id)) {
        setViewFollowUp((previous) => previous ? { ...previous, status: "Completed" } : null);
      }
    } catch (error) {
      console.log("STATUS UPDATE ERROR:", error);
      alert(error.response?.data?.message || "Error marking follow-up as completed.");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCustomerFilter("All");
    setLeadFilter("All");
    setBrokerFilter("All");
    setEmployeeFilter("All");
  };

  const totalCount = followUps.length;
  const pendingCount = followUps.filter((item) => item.status === "Pending").length;
  const completedCount = followUps.filter((item) => item.status === "Completed").length;

  const formatDate = (date) => {
    if (!date) return "—";
    const value = String(date).substring(0, 10);
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-IN");
  };

  return (
    <div className="container-fluid py-4">
      {/* PAGE HEADER */}
      <div className="page-header mb-4 d-flex justify-content-between align-items-center gap-3 flex-wrap">
        <div>
          <h1 className="page-title">Follow-up &amp; Task Management</h1>
          <p className="page-subtitle mb-0">Manage customer and lead follow-ups</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddForm}>
          <i className="bi bi-plus-lg me-2"></i> Add Follow-up
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100"><div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div><p className="text-muted mb-1">Total Follow-ups</p><h4 className="mb-0">{totalCount}</h4></div>
              <i className="bi bi-list-check fs-2 text-primary"></i>
            </div>
          </div></div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100"><div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div><p className="text-muted mb-1">Pending</p><h4 className="mb-0">{pendingCount}</h4></div>
              <i className="bi bi-clock fs-2 text-warning"></i>
            </div>
          </div></div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100"><div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div><p className="text-muted mb-1">Completed</p><h4 className="mb-0">{completedCount}</h4></div>
              <i className="bi bi-check-circle fs-2 text-success"></i>
            </div>
          </div></div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div className="card shadow-sm border-0 mb-4" id="followup-editor" ref={formRef} style={{ scrollMarginTop: "140px" }}>
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{editId !== null ? "Edit Follow-up" : "Create Follow-up"}</h5>
              <small className="text-muted">Enter follow-up and assignment details.</small>
            </div>
            <button type="button" className="btn btn-light" aria-label="Close follow-up form" onClick={resetForm}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="followup-title">Follow-up / Task Title</label>
                  <input id="followup-title" type="text" name="title" className="form-control" value={form.title} onChange={handleChange} placeholder="Enter follow-up title" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="followup-date">Follow-up Date</label>
                  <input id="followup-date" type="date" name="follow_up_date" className="form-control" value={form.follow_up_date} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="followup-customer">Customer</label>
                  <select id="followup-customer" name="customer_id" className="form-select" value={form.customer_id} onChange={handleChange}>
                    <option value="">Select Customer</option>
                    {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="followup-lead">Lead</label>
                  <select id="followup-lead" name="lead_id" className="form-select" value={form.lead_id} onChange={handleChange}>
                    <option value="">Select Lead</option>
                    {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="followup-broker">Broker</label>
                  <select id="followup-broker" name="broker_id" className="form-select" value={form.broker_id} onChange={handleChange}>
                    <option value="">Select Broker</option>
                    {brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.name}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="followup-employee">Assign To Employee</label>
                  <select id="followup-employee" name="employee_id" className="form-select" value={form.employee_id} onChange={handleChange}>
                    <option value="">Select Employee</option>
                    {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}{employee.designation ? ` - ${employee.designation}` : ""}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="followup-status">Status</label>
                  <select id="followup-status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="followup-notes">Notes</label>
                  <textarea id="followup-notes" name="notes" className="form-control" rows="3" value={form.notes} onChange={handleChange} placeholder="Enter follow-up notes"></textarea>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary me-2" disabled={loading}>
                    <i className="bi bi-check-lg me-1"></i>
                    {loading ? "Saving..." : editId !== null ? "Update Follow-up" : "Save Follow-up"}
                  </button>
                  <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOLLOW-UP LIST */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-1">Follow-up List</h5>
          <small className="text-muted">View and manage all follow-up tasks.</small>
          <div className="w-100 mt-3">
            <div className="row g-2">
              <div className="col-xl-3 col-md-6">
                <input type="text" className="form-control" placeholder="Search title, customer, lead..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search follow-ups" />
              </div>
              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
                  <option value="All">All Status</option><option value="Pending">Pending</option><option value="Completed">Completed</option>
                </select>
              </div>
              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)} aria-label="Filter by customer">
                  <option value="All">All Customers</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </div>
              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={leadFilter} onChange={(event) => setLeadFilter(event.target.value)} aria-label="Filter by lead">
                  <option value="All">All Leads</option>
                  {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
                </select>
              </div>
              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={brokerFilter} onChange={(event) => setBrokerFilter(event.target.value)} aria-label="Filter by broker">
                  <option value="All">All Brokers</option>
                  {brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.name}</option>)}
                </select>
              </div>
              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)} aria-label="Filter by employee">
                  <option value="All">All Employees</option>
                  {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </select>
              </div>
              <div className="col-xl-1 col-md-6">
                <button type="button" className="btn btn-light w-100" title="Reset Filters" onClick={resetFilters}>
                  <i className="bi bi-arrow-counterclockwise me-1"></i><span className="d-xl-none">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th><th>Task</th><th>Date</th><th>Customer</th><th>Lead</th><th>Broker</th><th>Assigned To</th><th>Status</th><th>Notes</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFollowUps.length === 0 ? (
                  <tr><td colSpan="10" className="text-center py-5 text-muted">No follow-ups found.</td></tr>
                ) : filteredFollowUps.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td><strong>{item.title}</strong></td>
                    <td>{formatDate(item.follow_up_date)}</td>
                    <td>{item.customer_name || "—"}</td>
                    <td>{item.lead_name || "—"}</td>
                    <td>{item.broker_name || "—"}</td>
                    <td>{item.employee_name || "—"}</td>
                    <td>
                      <span className={item.status === "Completed" ? "badge bg-success" : "badge bg-warning text-dark"}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td><span title={item.notes || ""}>{item.notes ? item.notes.length > 25 ? `${item.notes.substring(0, 25)}...` : item.notes : "—"}</span></td>
                    <td>
                      <div className="d-inline-flex align-items-center gap-2">
                        <button type="button" className="btn btn-sm btn-light" title="View Follow-up" aria-label={`View ${item.title}`} onClick={() => handleView(item)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        <button type="button" className="btn btn-sm btn-light" title="Edit Follow-up" aria-label={`Edit ${item.title}`} onClick={() => handleEdit(item)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button type="button" className="btn btn-sm btn-light text-danger" title="Delete Follow-up" aria-label={`Delete ${item.title}`} onClick={() => handleDelete(item.id)}>
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

      {/* FOLLOW-UP DETAILS POPUP - SAME CUSTOMER-STYLE MODAL */}
      {viewFollowUp && (
        <div
          role="presentation"
          onClick={() => setViewFollowUp(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 2000,
            backgroundColor: "rgba(15, 23, 42, 0.62)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", overflowY: "auto", backdropFilter: "blur(3px)",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="followup-popup-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%", maxWidth: "760px", maxHeight: "90vh",
              overflowY: "auto", background: "#ffffff", borderRadius: "16px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.28)",
            }}
          >
            <div
              className="d-flex justify-content-between align-items-center"
              style={{
                padding: "20px 24px", borderBottom: "1px solid #e9ecef",
                background: "#f8fafc", borderTopLeftRadius: "16px", borderTopRightRadius: "16px",
              }}
            >
              <div>
                <h5 id="followup-popup-title" className="mb-1">Follow-up Details</h5>
                <small className="text-muted">Complete follow-up information</small>
              </div>
              <button type="button" className="btn btn-light" aria-label="Close follow-up details" onClick={() => setViewFollowUp(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Task Title</div>
                  <div className="fw-semibold text-break">{viewFollowUp.title || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Follow-up ID</div>
                  <div className="fw-semibold">#{viewFollowUp.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Follow-up Date</div>
                  <div className="fw-semibold">{formatDate(viewFollowUp.follow_up_date)}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Status</div>
                  <span className={viewFollowUp.status === "Completed" ? "badge bg-success" : "badge bg-warning text-dark"}>
                    {viewFollowUp.status || "Pending"}
                  </span>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Customer</div>
                  <div className="fw-semibold text-break">{viewFollowUp.customer_name || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Lead</div>
                  <div className="fw-semibold text-break">{viewFollowUp.lead_name || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Broker</div>
                  <div className="fw-semibold text-break">{viewFollowUp.broker_name || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Assigned Employee</div>
                  <div className="fw-semibold text-break">{viewFollowUp.employee_name || "Not Assigned"}</div>
                </div>
                <div className="col-12">
                  <div className="text-muted small mb-1">Notes</div>
                  <div className="fw-semibold" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                    {viewFollowUp.notes || "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}>
              <div>
                {viewFollowUp.status !== "Completed" && (
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={() => handleStatusChange(viewFollowUp)}
                  >
                    <i className="bi bi-check-lg me-2"></i> Mark as Completed
                  </button>
                )}
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setViewFollowUp(null)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => handleEdit(viewFollowUp)}>
                  <i className="bi bi-pencil me-2"></i> Edit Follow-up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FollowUps;
