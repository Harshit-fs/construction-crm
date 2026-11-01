import API_BASE_URL from "../apiConfig";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function Properties() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewProperty, setViewProperty] = useState(null);

  // DATA STATES
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);

  // SEARCH & FILTER STATES
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeStatusFilter, setActiveStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  const formRef = useRef(null);

  const [form, setForm] = useState({
    propertyType: "",
    area: "",
    price: "",
    location: "",
    image: "",
    project_id: "",
    unitNumber: "",
    floor: "",
    status: "",
    active_status: "Active",
    customer_id: "",
  });

  // Find any visible fixed/sticky header so the form heading is not hidden.
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

  // Scroll the Add/Edit form into view in the window or a scrollable CRM panel.
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
    }, 300);
  };

  // FETCH PROPERTIES
  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/property/all`);
      setProperties(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH PROPERTIES ERROR:", error);
      alert("Properties could not be loaded.");
    }
  };

  // FETCH PROJECTS
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Project/all`);
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH PROJECTS ERROR:", error);
    }
  };

  // FETCH CUSTOMERS
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/all`);
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH CUSTOMERS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchProjects();
    fetchCustomers();
  }, []);

  // Scroll when the Add/Edit form opens or the selected record changes.
  useEffect(() => {
    if (showForm) scrollToForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, editingId]);

  // Close the details popup with Escape and disable background scrolling.
  useEffect(() => {
    if (!viewProperty) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") setViewProperty(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewProperty]);

  // SEARCH & FILTER
  const filteredProperties = properties.filter((property) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      property.property_type?.toLowerCase().includes(searchText) ||
      property.location?.toLowerCase().includes(searchText) ||
      String(property.unit_number || "").toLowerCase().includes(searchText) ||
      property.customer_name?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || property.status === statusFilter;
    const matchesActiveStatus =
      activeStatusFilter === "All" ||
      property.active_status === activeStatusFilter;
    const matchesType =
      typeFilter === "All" || property.property_type === typeFilter;
    const matchesProject =
      projectFilter === "All" ||
      String(property.project_id ?? "") === String(projectFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesActiveStatus &&
      matchesType &&
      matchesProject
    );
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
  const clearForm = () => {
    setForm({
      propertyType: "",
      area: "",
      price: "",
      location: "",
      image: "",
      project_id: "",
      unitNumber: "",
      floor: "",
      status: "",
      active_status: "Active",
      customer_id: "",
    });
    setEditingId(null);
  };

  const resetForm = () => {
    clearForm();
    setShowForm(false);
  };

  // ADD PROPERTY
  const handleAddProperty = () => {
    clearForm();
    setViewProperty(null);
    setShowForm(true);
  };

  // ADD / UPDATE PROPERTY
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.propertyType ||
      !form.area ||
      !form.price ||
      !form.location ||
      !form.project_id ||
      !form.unitNumber ||
      !form.floor ||
      !form.status ||
      !form.customer_id
    ) {
      alert("Please fill all property details.");
      return;
    }

    const propertyData = {
      property_type: form.propertyType,
      area: form.area,
      price: Number(form.price),
      location: form.location,
      project_id: Number(form.project_id),
      unit_number: form.unitNumber,
      floor: form.floor,
      status: form.status,
      active_status: form.active_status,
      customer_id: Number(form.customer_id),
      image: form.image || null,
    };

    try {
      if (editingId !== null) {
        await axios.put(
          `${API_BASE_URL}/property/${editingId}`,
          propertyData
        );
        alert("Property updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/property/add`, propertyData);
        alert("Property added successfully.");
      }

      await fetchProperties();
      resetForm();
    } catch (error) {
      console.log("SAVE PROPERTY ERROR:", error);
      alert(error.response?.data?.message || "Property could not be saved.");
    }
  };

  // VIEW PROPERTY
  const handleView = (property) => {
    setShowForm(false);
    setViewProperty(property);
  };

  // EDIT PROPERTY
  const handleEdit = (property) => {
    setForm({
      propertyType: property.property_type || "",
      area: property.area || "",
      price: property.price ?? "",
      location: property.location || "",
      project_id: property.project_id != null ? String(property.project_id) : "",
      unitNumber: property.unit_number || "",
      floor: property.floor || "",
      status: property.status || "",
      active_status: property.active_status || "Active",
      customer_id:
        property.customer_id != null ? String(property.customer_id) : "",
      image: property.image || "",
    });

    setEditingId(property.id);
    setViewProperty(null);
    setShowForm(true);
  };

  // DELETE PROPERTY
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this property?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/property/${id}`);
      await fetchProperties();
      if (String(viewProperty?.id) === String(id)) setViewProperty(null);
      alert("Property deleted successfully.");
    } catch (error) {
      console.log("DELETE PROPERTY ERROR:", error);
      alert(error.response?.data?.message || "Property could not be deleted.");
    }
  };

  // FORMAT PRICE
  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Property Management</h1>
          <p className="page-subtitle">
            Manage properties, units, pricing, projects, customers and availability.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddProperty}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Property
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Total Properties</div>
            <h3 className="mb-0">{properties.length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Available</div>
            <h3 className="mb-0">{properties.filter((property) => property.status === "Available").length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Reserved</div>
            <h3 className="mb-0">{properties.filter((property) => property.status === "Reserved").length}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Sold</div>
            <h3 className="mb-0">{properties.filter((property) => property.status === "Sold").length}</h3>
          </div></div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div
          className="card mb-4"
          id="property-editor"
          ref={formRef}
          style={{ scrollMarginTop: "140px" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">
                {editingId !== null ? "Edit Property" : "Add New Property"}
              </h5>
              <small className="text-muted">Enter property or unit information below.</small>
            </div>
            <button type="button" className="btn btn-light" onClick={resetForm} aria-label="Close property form">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-type">Property Type</label>
                  <select id="property-type" name="propertyType" className="form-select" value={form.propertyType} onChange={handleChange} required>
                    <option value="">Select Property Type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="House">House</option>
                    <option value="Shop">Shop</option>
                    <option value="Office">Office</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-area">Area / Size</label>
                  <input id="property-area" type="text" name="area" className="form-control" placeholder="Example: 1450 sq.ft" value={form.area} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-price">Price</label>
                  <input id="property-price" type="number" name="price" className="form-control" placeholder="Example: 8500000" min="0" value={form.price} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-location">Location</label>
                  <input id="property-location" type="text" name="location" className="form-control" placeholder="Enter property location" value={form.location} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-image">Property Image</label>
                  <input
                    id="property-image"
                    type="file"
                    name="image"
                    className="form-control"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {form.image && (
                    <small className="text-muted">Selected: {form.image}</small>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-project">Project</label>
                  <select id="property-project" name="project_id" className="form-select" value={form.project_id} onChange={handleChange} required>
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="property-unit">Unit Number</label>
                  <input id="property-unit" type="text" name="unitNumber" className="form-control" placeholder="A-101" value={form.unitNumber} onChange={handleChange} required />
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="property-floor">Floor</label>
                  <input id="property-floor" type="text" name="floor" className="form-control" placeholder="1st Floor" value={form.floor} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-status">Availability Status</label>
                  <select id="property-status" name="status" className="form-select" value={form.status} onChange={handleChange} required>
                    <option value="">Select Status</option>
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-active-status">Property Active Status</label>
                  <select id="property-active-status" name="active_status" className="form-select" value={form.active_status} onChange={handleChange} required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <small className="text-muted">Admin can enable or disable this property.</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="property-customer">Customer Assignment</label>
                  <select id="property-customer" name="customer_id" className="form-select" value={form.customer_id} onChange={handleChange} required>
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-primary me-2">
                    <i className="bi bi-check-lg me-2"></i>
                    {editingId !== null ? "Update Property" : "Save Property"}
                  </button>
                  <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROPERTY LIST */}
      <div className="card">
        <div className="card-header">
          <div>
            <h5 className="card-title mb-1">All Properties / Units</h5>
            <small className="text-muted">View and manage all properties and units.</small>
          </div>

          <div className="w-100 mt-3">
            <div className="row g-2">
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Search property, location, unit..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search properties" />
              </div>
              <div className="col-md-2">
                <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by availability">
                  <option value="All">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select" value={activeStatusFilter} onChange={(event) => setActiveStatusFilter(event.target.value)} aria-label="Filter by active status">
                  <option value="All">All Active Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by property type">
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Plot">Plot</option>
                  <option value="House">House</option>
                  <option value="Shop">Shop</option>
                  <option value="Office">Office</option>
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} aria-label="Filter by project">
                  <option value="All">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-1">
                <button type="button" className="btn btn-light w-100" aria-label="Reset filters" title="Reset filters" onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setActiveStatusFilter("All");
                  setTypeFilter("All");
                  setProjectFilter("All");
                }}>
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Property</th>
                  <th>Project</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Customer</th>
                  <th>Availability</th>
                  <th>Active</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.length === 0 ? (
                  <tr><td colSpan="9" className="text-center text-muted py-4">No properties found.</td></tr>
                ) : (
                  filteredProperties.map((property, index) => (
                    <tr key={property.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="fw-semibold">{property.property_type}</div>
                        <small className="text-muted">{property.unit_number} · {property.area}</small>
                      </td>
                      <td>{property.project_name || "Not Assigned"}</td>
                      <td>{property.location}</td>
                      <td>{formatPrice(property.price)}</td>
                      <td>{property.customer_name || "Not Assigned"}</td>
                      <td>
                        <span className={property.status === "Available" ? "badge bg-success" : property.status === "Reserved" ? "badge bg-warning text-dark" : "badge bg-secondary"}>
                          {property.status}
                        </span>
                      </td>
                      <td>
                        <span className={property.active_status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                          {property.active_status || "Active"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-2">
                          <button type="button" className="btn btn-sm btn-light" title="View Property" aria-label={`View property ${property.unit_number || property.id}`} onClick={() => handleView(property)}>
                            <i className="bi bi-eye"></i>
                          </button>
                          <button type="button" className="btn btn-sm btn-light" title="Edit Property" aria-label={`Edit property ${property.unit_number || property.id}`} onClick={() => handleEdit(property)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button type="button" className="btn btn-sm btn-light text-danger" title="Delete Property" aria-label={`Delete property ${property.unit_number || property.id}`} onClick={() => handleDelete(property.id)}>
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

      {/* PROPERTY DETAILS POPUP - SAME DESIGN AS CUSTOMER POPUP */}
      {viewProperty && (
        <div
          role="presentation"
          onClick={() => setViewProperty(null)}
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
            aria-labelledby="property-popup-title"
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
                <h5 id="property-popup-title" className="mb-1">Property Details</h5>
                <small className="text-muted">Complete property information</small>
              </div>
              <button type="button" className="btn btn-light" onClick={() => setViewProperty(null)} aria-label="Close property details popup">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* POPUP DETAILS */}
            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Property Type</div>
                  <div className="fw-semibold">{viewProperty.property_type || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Property ID</div>
                  <div className="fw-semibold">#{viewProperty.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Area / Size</div>
                  <div className="fw-semibold">{viewProperty.area || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Price</div>
                  <div className="fw-semibold">{formatPrice(viewProperty.price)}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Location</div>
                  <div className="fw-semibold text-break">{viewProperty.location || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project</div>
                  <div className="fw-semibold">{viewProperty.project_name || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Unit Number</div>
                  <div className="fw-semibold">{viewProperty.unit_number || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Floor</div>
                  <div className="fw-semibold">{viewProperty.floor || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Availability Status</div>
                  <span className={viewProperty.status === "Available" ? "badge bg-success" : viewProperty.status === "Reserved" ? "badge bg-warning text-dark" : "badge bg-secondary"}>
                    {viewProperty.status || "Unknown"}
                  </span>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Property Active Status</div>
                  <span className={viewProperty.active_status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                    {viewProperty.active_status || "Active"}
                  </span>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Assigned Customer</div>
                  <div className="fw-semibold">{viewProperty.customer_name || "Not Assigned"}</div>
                </div>
              </div>
            </div>

            {/* POPUP FOOTER */}
            <div className="d-flex justify-content-end gap-2" style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewProperty(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => handleEdit(viewProperty)}>
                <i className="bi bi-pencil me-2"></i>
                Edit Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Properties;
