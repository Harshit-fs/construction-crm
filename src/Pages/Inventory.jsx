import API_BASE_URL from "../apiConfig";
import  { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
  // DATA
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewItem, setViewItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // FETCH INVENTORY
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/inventory/all`);
      setInventory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH INVENTORY ERROR:", error);
      alert(error.response?.data?.message || "Inventory could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Close popup with Escape and lock background scrolling while it is open.
  useEffect(() => {
    if (!viewItem) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setViewItem(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewItem]);

  // FILTER OPTIONS
  const projects = [
    ...new Set(inventory.map((item) => item.project_name).filter(Boolean)),
  ];
  const propertyTypes = [
    ...new Set(inventory.map((item) => item.property_type).filter(Boolean)),
  ];

  // FILTER INVENTORY
  const filteredInventory = inventory.filter((item) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      item.unit_number?.toLowerCase().includes(searchText) ||
      item.property_type?.toLowerCase().includes(searchText) ||
      item.project_name?.toLowerCase().includes(searchText) ||
      item.customer_name?.toLowerCase().includes(searchText) ||
      item.broker_name?.toLowerCase().includes(searchText) ||
      item.location?.toLowerCase().includes(searchText);

    const matchesProject = projectFilter === "All" || item.project_name === projectFilter;
    const matchesType = typeFilter === "All" || item.property_type === typeFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const matchesActive = activeFilter === "All" || item.active_status === activeFilter;

    return matchesSearch && matchesProject && matchesType && matchesStatus && matchesActive;
  });

  // RESET FILTERS
  const handleReset = () => {
    setSearch("");
    setProjectFilter("All");
    setTypeFilter("All");
    setStatusFilter("All");
    setActiveFilter("All");
  };

  // VIEW INVENTORY ITEM
  const handleView = (item) => setViewItem(item);

  // FORMAT MONEY
  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  // STATUS CLASS
  const getStatusClass = (status) => {
    if (status === "Available") return "badge bg-success";
    if (status === "Reserved") return "badge bg-warning text-dark";
    if (status === "Sold") return "badge bg-secondary";
    return "badge bg-light text-dark";
  };

  // ACTIVE STATUS CLASS
  const getActiveClass = (status) =>
    status === "Active" ? "badge bg-success" : "badge bg-danger";

  // COUNTS
  const totalProperties = inventory.length;
  const availableProperties = inventory.filter((item) => item.status === "Available").length;
  const reservedProperties = inventory.filter((item) => item.status === "Reserved").length;
  const soldProperties = inventory.filter((item) => item.status === "Sold").length;
  const activeProperties = inventory.filter((item) => item.active_status === "Active").length;
  const inactiveProperties = inventory.filter((item) => item.active_status === "Inactive").length;

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">
            Manage property and unit inventory, availability and assignment status.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">Total Properties</div>
                  <h3 className="mb-0 fw-bold">{totalProperties}</h3>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary" style={{ width: "50px", height: "50px" }}>
                  <i className="bi bi-buildings fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">Available</div>
                  <h3 className="mb-0 fw-bold">{availableProperties}</h3>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-success bg-opacity-10 text-success" style={{ width: "50px", height: "50px" }}>
                  <i className="bi bi-check-circle-fill fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">Reserved</div>
                  <h3 className="mb-0 fw-bold">{reservedProperties}</h3>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-warning bg-opacity-10 text-warning" style={{ width: "50px", height: "50px" }}>
                  <i className="bi bi-clock-fill fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">Sold</div>
                  <h3 className="mb-0 fw-bold">{soldProperties}</h3>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-secondary bg-opacity-10 text-secondary" style={{ width: "50px", height: "50px" }}>
                  <i className="bi bi-house-check-fill fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">Active</div>
                  <h3 className="mb-0 fw-bold">{activeProperties}</h3>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-success bg-opacity-10 text-success" style={{ width: "50px", height: "50px" }}>
                  <i className="bi bi-toggle-on fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">Inactive</div>
                  <h3 className="mb-0 fw-bold">{inactiveProperties}</h3>
                </div>
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-danger bg-opacity-10 text-danger" style={{ width: "50px", height: "50px" }}>
                  <i className="bi bi-toggle-off fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INVENTORY LIST */}
      <div className="card">
        <div className="card-header">
          <div>
            <h5 className="card-title mb-1">Property Inventory</h5>
            <small className="text-muted">
              View all property units and their current inventory status.
            </small>
          </div>

          {/* FILTERS */}
          <div className="w-100 mt-3">
            <div className="row g-2">
              <div className="col-xl-3 col-md-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search unit, project, customer, broker..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search inventory"
                />
              </div>

              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} aria-label="Filter by project">
                  <option value="All">All Projects</option>
                  {projects.map((project) => <option key={project} value={project}>{project}</option>)}
                </select>
              </div>

              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by property type">
                  <option value="All">All Types</option>
                  {propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by availability">
                  <option value="All">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div className="col-xl-2 col-md-6">
                <select className="form-select" value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} aria-label="Filter by active status">
                  <option value="All">All Active</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-xl-1 col-md-6">
                <button type="button" className="btn btn-light w-100" title="Reset Filters" onClick={handleReset}>
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2 text-muted">Loading inventory...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0 text-nowrap">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Unit</th>
                    <th>Project</th>
                    <th>Property</th>
                    <th>Price</th>
                    <th>Customer</th>
                    <th>Broker</th>
                    <th>Availability</th>
                    <th>Active</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center text-muted py-5">No inventory found.</td>
                    </tr>
                  ) : (
                    filteredInventory.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="fw-semibold">{item.unit_number || "-"}</div>
                          <small className="text-muted">{item.area || "-"}</small>
                        </td>
                        <td>{item.project_name || "Not Assigned"}</td>
                        <td>{item.property_type || "-"}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.customer_name || "Not Assigned"}</td>
                        <td>{item.broker_name || "Not Assigned"}</td>
                        <td><span className={getStatusClass(item.status)}>{item.status || "-"}</span></td>
                        <td><span className={getActiveClass(item.active_status)}>{item.active_status || "Active"}</span></td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-light"
                            title="View Inventory"
                            aria-label={`View inventory item ${item.unit_number || item.id}`}
                            onClick={() => handleView(item)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* INVENTORY DETAILS POPUP — SAME STYLE AS CUSTOMER POPUP */}
      {viewItem && (
        <div
          role="presentation"
          onClick={() => setViewItem(null)}
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
            aria-labelledby="inventory-popup-title"
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
                <h5 id="inventory-popup-title" className="mb-1">Inventory Details</h5>
                <small className="text-muted">Complete property information</small>
              </div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setViewItem(null)}
                aria-label="Close inventory details popup"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* POPUP DETAILS */}
            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Unit Number</div>
                  <div className="fw-semibold">{viewItem.unit_number || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Inventory ID</div>
                  <div className="fw-semibold">#{viewItem.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Property Type</div>
                  <div className="fw-semibold">{viewItem.property_type || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Area / Size</div>
                  <div className="fw-semibold">{viewItem.area || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Price</div>
                  <div className="fw-semibold">{formatCurrency(viewItem.price)}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project</div>
                  <div className="fw-semibold">{viewItem.project_name || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Location</div>
                  <div className="fw-semibold">{viewItem.location || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Customer</div>
                  <div className="fw-semibold">{viewItem.customer_name || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Broker</div>
                  <div className="fw-semibold">{viewItem.broker_name || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Availability Status</div>
                  <span className={getStatusClass(viewItem.status)}>{viewItem.status || "—"}</span>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Active Status</div>
                  <span className={getActiveClass(viewItem.active_status)}>{viewItem.active_status || "Active"}</span>
                </div>
              </div>
            </div>

            {/* POPUP FOOTER */}
            <div
              className="d-flex justify-content-end gap-2"
              style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}
            >
              <button type="button" className="btn btn-secondary" onClick={() => setViewItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
