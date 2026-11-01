import API_BASE_URL from "../apiConfig";
import  { useState, useEffect } from "react";
import axios from "axios";

function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewBroker, setViewBroker] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    commission: "",
    status: "Active",
  });

  // Find the visible fixed/sticky navbar so the section title does not hide behind it.
  const getStickyHeaderBottom = () => {
    const selectors = [
      "header", 
      "nav",
      ".navbar",
      ".site-header",
      ".topbar",
      ".app-header",
      ".main-header",
      ".main-navbar",
      ".header",
    ];

    let bottom = 0;
    document.querySelectorAll(selectors.join(",")).forEach((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const isFixedOrSticky =
        styles.position === "fixed" || styles.position === "sticky";

      if (
        isFixedOrSticky &&
        rect.height > 0 &&
        rect.top <= 8 &&
        rect.bottom > 0
      ) {
        bottom = Math.max(bottom, rect.bottom);
      }
    });

    return bottom;
  };

  // Scroll the form into view in either the browser window or CRM content area.
  const scrollToSection = (id) => {
    window.setTimeout(() => {
      const element = document.getElementById(id);
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
        const headerOffset =
          headerBottom > parentRect.top && headerBottom < parentRect.bottom
            ? headerBottom - parentRect.top + 16
            : 20;

        scrollParent.scrollTo({
          top:
            scrollParent.scrollTop +
            elementRect.top -
            parentRect.top -
            headerOffset,
          behavior: "smooth",
        });
      } else {
        const headerOffset = Math.max(20, getStickyHeaderBottom() + 16);
        window.scrollTo({
          top: window.scrollY + elementRect.top - headerOffset,
          behavior: "smooth",
        });
      }
    }, 350);
  };

  // GET ALL BROKERS
  const fetchBrokers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/broker/all`);
      setBrokers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH BROKERS ERROR:", error);
      alert("Brokers could not be loaded.");
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  // Close popup with Escape and prevent background scrolling while it is open.
  useEffect(() => {
    if (!viewBroker) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setViewBroker(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewBroker]);

  // SEARCH & FILTER
  const filteredBrokers = brokers.filter((broker) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      broker.name?.toLowerCase().includes(searchText) ||
      broker.phone?.toLowerCase().includes(searchText) ||
      broker.email?.toLowerCase().includes(searchText);
    const matchesStatus =
      statusFilter === "All" || broker.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      phone: "",
      email: "",
      address: "",
      commission: "",
      status: "Active",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ADD / UPDATE BROKER
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.address.trim() ||
      form.commission === "" ||
      !form.status
    ) {
      alert("Please fill all broker details.");
      return;
    }

    try {
      if (editingId !== null) {
        const response = await axios.put(
          `${API_BASE_URL}/broker/${editingId}`,
          form
        );
        alert(response.data?.message || "Broker updated successfully.");
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/broker/add`,
          form
        );
        alert(response.data?.message || "Broker added successfully.");
      }

      await fetchBrokers();
      resetForm();
    } catch (error) {
      console.log("SAVE BROKER ERROR:", error);
      alert(error.response?.data?.message || "Broker could not be saved.");
    }
  };

  // VIEW BROKER IN POPUP
  const handleView = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/broker/${id}`);
      setViewBroker(response.data);
      setShowForm(false);
    } catch (error) {
      console.log("VIEW BROKER ERROR:", error);
      alert(error.response?.data?.message || "Broker details could not be loaded.");
    }
  };

  // EDIT BROKER: also used by the Edit button inside the details popup.
  const handleEdit = (broker) => {
    setForm({
      name: broker.name || "",
      phone: broker.phone || "",
      email: broker.email || "",
      address: broker.address || "",
      commission: broker.commission ?? "",
      status: broker.status || "Active",
    });

    setEditingId(broker.id);
    setViewBroker(null);
    setShowForm(true);
    scrollToSection("broker-editor");
  };

  // DELETE BROKER
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this broker?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/broker/${id}`);
      alert(response.data?.message || "Broker deleted successfully.");
      await fetchBrokers();

      if (String(viewBroker?.id) === String(id)) setViewBroker(null);
    } catch (error) {
      console.log("DELETE BROKER ERROR:", error);
      alert(error.response?.data?.message || "Broker could not be deleted.");
    }
  };

  const handleAddBroker = () => {
    resetForm();
    setViewBroker(null);
    setShowForm(true);
    scrollToSection("broker-editor");
  };

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Brokers</h3>
          <p className="text-muted mb-0">Manage your brokers</p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleAddBroker}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Broker
        </button>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div
          className="card mb-4"
          id="broker-editor"
          style={{ scrollMarginTop: "120px" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {editingId !== null ? "Edit Broker" : "Add Broker"}
            </h5>
            <button
              type="button"
              className="btn btn-light"
              title="Close form"
              aria-label="Close form"
              onClick={resetForm}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="broker-name">Broker Name</label>
                  <input
                    id="broker-name"
                    type="text"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter broker name"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="broker-phone">Phone</label>
                  <input
                    id="broker-phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="broker-email">Email</label>
                  <input
                    id="broker-email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="broker-commission">Commission</label>
                  <input
                    id="broker-commission"
                    type="number"
                    name="commission"
                    className="form-control"
                    value={form.commission}
                    onChange={handleChange}
                    placeholder="Enter commission"
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label" htmlFor="broker-address">Address</label>
                  <textarea
                    id="broker-address"
                    name="address"
                    className="form-control"
                    rows="3"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    required
                  ></textarea>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="broker-status">Status</label>
                  <select
                    id="broker-status"
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary me-2">
                {editingId !== null ? "Update Broker" : "Add Broker"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BROKER TABLE */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h5 className="mb-0">Broker List</h5>

            <div className="d-flex gap-2 flex-wrap">
              <input
                type="text"
                className="form-control"
                placeholder="Search broker..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: "220px" }}
                aria-label="Search brokers"
              />

              <select
                className="form-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ width: "150px" }}
                aria-label="Filter by broker status"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
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
            <table className="table table-bordered table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBrokers.length > 0 ? (
                  filteredBrokers.map((broker) => (
                    <tr key={broker.id}>
                      <td>{broker.id}</td>
                      <td>{broker.name}</td>
                      <td>{broker.phone}</td>
                      <td>{broker.email}</td>
                      <td>{broker.commission}</td>
                      <td>
                        <span className={broker.status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                          {broker.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-inline-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-info"
                            title="View broker"
                            aria-label={`View ${broker.name}`}
                            onClick={() => handleView(broker.id)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-warning"
                            title="Edit broker"
                            aria-label={`Edit ${broker.name}`}
                            onClick={() => handleEdit(broker)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            title="Delete broker"
                            aria-label={`Delete ${broker.name}`}
                            onClick={() => handleDelete(broker.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">No brokers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BROKER DETAILS POPUP - SAME DESIGN AS CUSTOMER POPUP */}
      {viewBroker && (
        <div
          role="presentation"
          onClick={() => setViewBroker(null)}
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
            aria-labelledby="broker-popup-title"
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
            {/* POPUP HEADER: matches Customer Details */}
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
                <h5 id="broker-popup-title" className="mb-1">Broker Details</h5>
                <small className="text-muted">Complete broker information</small>
              </div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setViewBroker(null)}
                aria-label="Close broker details popup"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* POPUP DETAILS: same grid and label style as Customer Details */}
            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Broker Name</div>
                  <div className="fw-semibold">{viewBroker.name || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Broker ID</div>
                  <div className="fw-semibold">#{viewBroker.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Phone Number</div>
                  <div className="fw-semibold">{viewBroker.phone || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Email Address</div>
                  <div className="fw-semibold" style={{ overflowWrap: "anywhere" }}>
                    {viewBroker.email || "—"}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Commission</div>
                  <div className="fw-semibold">
                    {viewBroker.commission !== undefined &&
                    viewBroker.commission !== null &&
                    viewBroker.commission !== ""
                      ? viewBroker.commission
                      : "—"}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Status</div>
                  <span className={viewBroker.status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                    {viewBroker.status || "Unknown"}
                  </span>
                </div>
                <div className="col-12">
                  <div className="text-muted small mb-1">Address</div>
                  <div
                    className="fw-semibold"
                    style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {viewBroker.address || "—"}
                  </div>
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
                onClick={() => setViewBroker(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleEdit(viewBroker)}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Broker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Brokers;
