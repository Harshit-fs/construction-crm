import API_BASE_URL from "../apiConfig";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function Customers() {
  const [brokers, setBrokers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [brokerFilter, setBrokerFilter] = useState("All");

  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "", 
    broker_id: "",
    status: "",
  });

  // ================================
  // GET ALL CUSTOMERS
  // ================================
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer/all`);
      setCustomers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH CUSTOMERS ERROR:", error);
      alert("Failed to fetch customers.");
    }
  };


  // ================================
  // GET ALL BROKERS
  // ================================
  const fetchBrokers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/broker/all`);
      setBrokers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH BROKERS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchBrokers();
  }, []);

  // Close details popup with Escape and prevent background scrolling while open.
  useEffect(() => {
    if (!viewCustomer) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setViewCustomer(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewCustomer]);

  // ================================
  // SEARCH & FILTER
  // ================================
  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchText) ||
      customer.phone?.toLowerCase().includes(searchText) ||
      customer.email?.toLowerCase().includes(searchText);
    const matchesStatus = statusFilter === "All" || customer.status === statusFilter;
    const matchesBroker =
      brokerFilter === "All" ||
      String(customer.broker_id ?? "") === String(brokerFilter);

    return matchesSearch && matchesStatus && matchesBroker;
  });

  // ================================
  // INPUT CHANGE
  // ================================
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  // ================================
  // RESET FORM
  // ================================
  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      broker_id: "",
      status: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ================================
  // SCROLL TO FORM
  // ================================
  const scrollToForm = () => {
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }, 250);
  };

  // ================================
  // SAVE / UPDATE CUSTOMER
  // ================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.address.trim() ||
      !form.broker_id ||
      !form.status
    ) {
      alert("Please fill all customer details.");
      return;
    }

    const customerData = {
      ...form,
      broker_id: Number(form.broker_id),
    };

    try {
      if (editingId !== null) {
        const response = await axios.put(
          `${API_BASE_URL}/customer/${editingId}`,
          customerData
        );
        console.log("UPDATE RESPONSE:", response.data);
        alert("Customer updated successfully.");
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/customer/add`,
          customerData
        );
        console.log("ADD RESPONSE:", response.data);
        alert("Customer added successfully.");
      }

      await fetchCustomers();
      resetForm();
    } catch (error) {
      console.log("SAVE CUSTOMER ERROR:", error);
      console.log("SERVER ERROR:", error.response?.data);
      alert(error.response?.data?.message || "Customer could not be saved.");
    }
  };

  // ================================
  // EDIT CUSTOMER
  // ================================
  const handleEdit = (customer) => {
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      broker_id: customer.broker_id == null ? "" : String(customer.broker_id),
      status: customer.status || "",
    });

    setEditingId(customer.id);
    setViewCustomer(null);
    setShowForm(true);
    scrollToForm();
  };

  // ================================
  // DELETE CUSTOMER
  // ================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/customer/${id}`);
      alert("Customer deleted successfully.");
      await fetchCustomers();

      if (viewCustomer?.id === id) setViewCustomer(null);
    } catch (error) {
      console.log("DELETE CUSTOMER ERROR:", error);
      alert(error.response?.data?.message || "Customer could not be deleted.");
    }
  };

  // ================================
  // VIEW CUSTOMER IN POPUP
  // ================================
  const handleView = (customer) => {
    setViewCustomer(customer);
    setShowForm(false);
  };

  // ================================
  // ADD CUSTOMER
  // ================================
  const handleAddCustomer = () => {
    resetForm();
    setViewCustomer(null);
    setShowForm(true);
    scrollToForm();
  };

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Customer Management</h1>
          <p className="page-subtitle">
            Manage customer profiles, contact details, assigned brokers and status.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleAddCustomer}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Customer
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted mb-2">Total Customers</div>
              <h3 className="mb-0">{customers.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted mb-2">Active Customers</div>
              <h3 className="mb-0">
                {customers.filter((customer) => customer.status === "Active").length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted mb-2">Inactive Customers</div>
              <h3 className="mb-0">
                {customers.filter((customer) => customer.status === "Inactive").length}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted mb-2">Assigned Brokers</div>
              <h3 className="mb-0">
                {new Set(
                  customers
                    .map((customer) => customer.broker_id)
                    .filter((brokerId) => brokerId !== null && brokerId !== undefined && brokerId !== "")
                ).size}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER FORM */}
      {showForm && (
        <div
          className="card mb-4"
          id="customer-editor"
          ref={formRef}
          style={{ scrollMarginTop: "140px" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">
                {editingId !== null ? "Edit Customer" : "Add Customer"}
              </h5>
              <small className="text-muted">Enter customer details below.</small>
            </div>
            <button
              type="button"
              className="btn btn-light"
              onClick={resetForm}
              aria-label="Close customer form"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="customer-name">Customer Name</label>
                  <input
                    id="customer-name"
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter customer name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="customer-phone">Phone Number</label>
                  <input
                    id="customer-phone"
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
                  <label className="form-label" htmlFor="customer-email">Email Address</label>
                  <input
                    id="customer-email"
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
                  <label className="form-label" htmlFor="customer-broker">Assigned Broker</label>
                  <select
                    id="customer-broker"
                    name="broker_id"
                    className="form-select"
                    value={form.broker_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Broker</option>
                    {brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>{broker.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="customer-address">Address</label>
                  <textarea
                    id="customer-address"
                    name="address"
                    className="form-control"
                    rows="3"
                    placeholder="Enter customer address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="customer-status">Customer Status</label>
                  <select
                    id="customer-status"
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
                    {editingId !== null ? "Update Customer" : "Save Customer"}
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

      {/* CUSTOMER LIST */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="card-title mb-1">All Customers</h5>
              <small className="text-muted">View and manage registered customers.</small>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <input
                type="text"
                className="form-control"
                placeholder="Search customer..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ width: "220px" }}
                aria-label="Search customers"
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
                value={brokerFilter}
                onChange={(event) => setBrokerFilter(event.target.value)}
                style={{ width: "170px" }}
                aria-label="Filter by broker"
              >
                <option value="All">All Brokers</option>
                {brokers.map((broker) => (
                  <option key={broker.id} value={broker.id}>{broker.name}</option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setBrokerFilter("All");
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
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Assigned Broker</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No customers found.</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, index) => (
                    <tr key={customer.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="fw-semibold">{customer.name}</div>
                        <small className="text-muted">{customer.address}</small>
                      </td>
                      <td>
                        <div>{customer.phone}</div>
                        <small className="text-muted">{customer.email}</small>
                      </td>
                      <td>{customer.broker_name || "Not Assigned"}</td>
                      <td>
                        <span className={customer.status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-light me-2"
                          title="View Customer"
                          aria-label={`View ${customer.name}`}
                          onClick={() => handleView(customer)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-light me-2"
                          title="Edit Customer"
                          aria-label={`Edit ${customer.name}`}
                          onClick={() => handleEdit(customer)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger"
                          title="Delete Customer"
                          aria-label={`Delete ${customer.name}`}
                          onClick={() => handleDelete(customer.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CUSTOMER DETAILS POPUP */}
      {viewCustomer && (
        <div
          role="presentation"
          onClick={() => setViewCustomer(null)}
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
            aria-labelledby="customer-popup-title"
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
                <h5 id="customer-popup-title" className="mb-1">Customer Details</h5>
                <small className="text-muted">Complete customer information</small>
              </div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setViewCustomer(null)}
                aria-label="Close customer details popup"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Customer Name</div>
                  <div className="fw-semibold">{viewCustomer.name || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Customer ID</div>
                  <div className="fw-semibold">#{viewCustomer.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Phone Number</div>
                  <div className="fw-semibold">{viewCustomer.phone || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Email Address</div>
                  <div className="fw-semibold text-break">{viewCustomer.email || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Assigned Broker</div>
                  <div className="fw-semibold">{viewCustomer.broker_name || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Status</div>
                  <span className={viewCustomer.status === "Active" ? "badge bg-success" : "badge bg-secondary"}>
                    {viewCustomer.status || "Unknown"}
                  </span>
                </div>
                <div className="col-12">
                  <div className="text-muted small mb-1">Address</div>
                  <div className="fw-semibold" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                    {viewCustomer.address || "—"}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="d-flex justify-content-end gap-2"
              style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}
            >
              <button type="button" className="btn btn-secondary" onClick={() => setViewCustomer(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleEdit(viewCustomer)}
              >
                <i className="bi bi-pencil me-2"></i>
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
