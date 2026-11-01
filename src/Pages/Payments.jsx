import API_BASE_URL from "../apiConfig";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function Payments() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewPayment, setViewPayment] = useState(null);

  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [projectFilter, setProjectFilter] = useState("All");

  const formRef = useRef(null);

  const emptyForm = {
    customer_id: "",
    broker_id: "",
    project_id: "",
    totalAmount: "",
    paidAmount: "",
    pendingAmount: "",
    paymentDate: "",
    paymentMethod: "",
    status: "",
  };

  const [form, setForm] = useState(emptyForm);

  // Scroll to the form, taking the CRM's scrollable content area and sticky header into account.
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
        const headerOffset =
          headerBottom > parentRect.top && headerBottom < parentRect.bottom
            ? headerBottom - parentRect.top + 16
            : 20;
        scrollParent.scrollTo({
          top: scrollParent.scrollTop + elementRect.top - parentRect.top - headerOffset,
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

  useEffect(() => {
    if (showForm) scrollToForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, editingId]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment/all`);
      const rows = Array.isArray(response.data) ? response.data : [];
      const formattedPayments = rows.map((payment) => ({
        id: payment.id,
        customer_id: payment.customer_id,
        customer: payment.customer_name || "Not Assigned",
        broker_id: payment.broker_id || "",
        broker: payment.broker_name || "Not Assigned",
        project_id: payment.project_id,
        project: payment.project_name || "Not Assigned",
        totalAmount: Number(payment.total_amount || 0),
        paidAmount: Number(payment.paid_amount || 0),
        pendingAmount: Number(payment.pending_amount || 0),
        paymentDate: payment.payment_date
          ? String(payment.payment_date).split("T")[0]
          : "",
        paymentMethod: payment.payment_method || "",
        status: payment.status || "",
      }));
      setPayments(formattedPayments);
    } catch (error) {
      console.log("FETCH PAYMENTS ERROR:", error);
      alert(error.response?.data?.message || "Payments could not be loaded.");
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

  const fetchBrokers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/broker/all`);
      setBrokers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH BROKERS ERROR:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Project/all`);
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("FETCH PROJECTS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchCustomers();
    fetchBrokers();
    fetchProjects();
  }, []);

  // Close the details popup with Escape and prevent background scrolling while open.
  useEffect(() => {
    if (!viewPayment) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") setViewPayment(null);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewPayment]);

  const filteredPayments = payments.filter((payment) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      payment.customer?.toLowerCase().includes(searchText) ||
      payment.broker?.toLowerCase().includes(searchText) ||
      payment.project?.toLowerCase().includes(searchText) ||
      payment.paymentMethod?.toLowerCase().includes(searchText);
    const matchesStatus = statusFilter === "All" || payment.status === statusFilter;
    const matchesCustomer =
      customerFilter === "All" || String(payment.customer_id) === String(customerFilter);
    const matchesProject =
      projectFilter === "All" || String(payment.project_id) === String(projectFilter);
    return matchesSearch && matchesStatus && matchesCustomer && matchesProject;
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => {
      const updatedForm = { ...previousForm, [name]: value };
      if (name === "totalAmount" || name === "paidAmount") {
        const total = Number(updatedForm.totalAmount) || 0;
        const paid = Number(updatedForm.paidAmount) || 0;
        updatedForm.pendingAmount = String(Math.max(total - paid, 0));
        if (paid === 0) updatedForm.status = "Pending";
        else if (paid >= total && total > 0) updatedForm.status = "Paid";
        else updatedForm.status = "Partial";
      }
      return updatedForm;
    });
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddPayment = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setViewPayment(null);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.customer_id || !form.project_id || !form.totalAmount ||
      form.paidAmount === "" || !form.paymentDate || !form.paymentMethod
    ) {
      alert("Please fill all payment details.");
      return;
    }

    const totalAmount = Number(form.totalAmount);
    const paidAmount = Number(form.paidAmount);
    if (totalAmount < 0) {
      alert("Total amount cannot be negative.");
      return;
    }
    if (paidAmount < 0) {
      alert("Paid amount cannot be negative.");
      return;
    }
    if (paidAmount > totalAmount) {
      alert("Paid amount cannot be greater than total amount.");
      return;
    }

    const pendingAmount = Math.max(totalAmount - paidAmount, 0);
    let status = "Pending";
    if (paidAmount === totalAmount && totalAmount > 0) status = "Paid";
    else if (paidAmount > 0) status = "Partial";

    const paymentData = {
      customer_id: Number(form.customer_id),
      broker_id: form.broker_id ? Number(form.broker_id) : null,
      project_id: Number(form.project_id),
      total_amount: totalAmount,
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      payment_date: form.paymentDate,
      payment_method: form.paymentMethod,
      status,
    };

    try {
      if (editingId !== null) {
        await axios.put(`${API_BASE_URL}/payment/${editingId}`, paymentData);
        alert("Payment updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}/payment/add`, paymentData);
        alert("Payment added successfully.");
      }
      await fetchPayments();
      resetForm();
    } catch (error) {
      console.log("SAVE PAYMENT ERROR:", error);
      if (error.response) console.log("SERVER RESPONSE:", error.response.data);
      alert(error.response?.data?.message || "Payment could not be saved.");
    }
  };

  const handleView = (payment) => {
    setViewPayment(payment);
    setShowForm(false);
  };

  const handleEdit = (payment) => {
    setForm({
      customer_id: payment.customer_id || "",
      broker_id: payment.broker_id || "",
      project_id: payment.project_id || "",
      totalAmount: String(payment.totalAmount ?? ""),
      paidAmount: String(payment.paidAmount ?? ""),
      pendingAmount: String(payment.pendingAmount ?? ""),
      paymentDate: payment.paymentDate || "",
      paymentMethod: payment.paymentMethod || "",
      status: payment.status || "",
    });
    setEditingId(payment.id);
    setShowForm(true);
    setViewPayment(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/payment/${id}`);
      if (String(viewPayment?.id) === String(id)) setViewPayment(null);
      await fetchPayments();
      alert("Payment deleted successfully.");
    } catch (error) {
      console.log("DELETE PAYMENT ERROR:", error);
      alert(error.response?.data?.message || "Payment could not be deleted.");
    }
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.totalAmount || 0), 0);
  const paidAmount = payments.reduce((sum, payment) => sum + Number(payment.paidAmount || 0), 0);
  const pendingAmount = payments.reduce((sum, payment) => sum + Number(payment.pendingAmount || 0), 0);

  const getPaymentStatusClass = (status) =>
    status === "Paid"
      ? "badge bg-success"
      : status === "Partial"
      ? "badge bg-warning text-dark"
      : "badge bg-danger";

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Payment Management</h1>
          <p className="page-subtitle">
            Manage customer and project payments, balances and payment status.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAddPayment}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Payment
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100 payment-summary-card">
            <div className="card-body">
              <div className="text-muted mb-2">Total Amount</div>
              <div className="payment-amount">{formatCurrency(totalAmount)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100 payment-summary-card">
            <div className="card-body">
              <div className="text-muted mb-2">Paid Amount</div>
              <div className="payment-amount">{formatCurrency(paidAmount)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100 payment-summary-card">
            <div className="card-body">
              <div className="text-muted mb-2">Pending Amount</div>
              <div className="payment-amount">{formatCurrency(pendingAmount)}</div>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-muted mb-2">Payment Records</div>
              <h3 className="mb-0">{payments.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div
          className="card mb-4"
          id="payment-editor"
          ref={formRef}
          style={{ scrollMarginTop: "140px" }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-1">
                {editingId !== null ? "Edit Payment" : "Add New Payment"}
              </h5>
              <small className="text-muted">
                Enter customer, broker and project payment details.
              </small>
            </div>
            <button type="button" className="btn btn-light" onClick={resetForm} aria-label="Close payment form">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="payment-customer">Customer</label>
                  <select id="payment-customer" name="customer_id" className="form-select" value={form.customer_id} onChange={handleChange} required>
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="payment-broker">Broker</label>
                  <select id="payment-broker" name="broker_id" className="form-select" value={form.broker_id} onChange={handleChange}>
                    <option value="">Select Broker</option>
                    {brokers.map((broker) => (
                      <option key={broker.id} value={broker.id}>{broker.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="payment-project">Project</label>
                  <select id="payment-project" name="project_id" className="form-select" value={form.project_id} onChange={handleChange} required>
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="payment-total">Total Amount</label>
                  <input id="payment-total" type="number" name="totalAmount" className="form-control" placeholder="Enter total amount" min="0" value={form.totalAmount} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="payment-paid">Paid Amount</label>
                  <input id="payment-paid" type="number" name="paidAmount" className="form-control" placeholder="Enter paid amount" min="0" value={form.paidAmount} onChange={handleChange} required />
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="payment-pending">Pending Amount</label>
                  <input id="payment-pending" type="number" name="pendingAmount" className="form-control" value={form.pendingAmount} readOnly />
                  <small className="text-muted">Automatically calculated.</small>
                </div>

                <div className="col-md-4">
                  <label className="form-label" htmlFor="payment-date">Payment Date</label>
                  <input id="payment-date" type="date" name="paymentDate" className="form-control" value={form.paymentDate} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="payment-method">Payment Method</label>
                  <select id="payment-method" name="paymentMethod" className="form-select" value={form.paymentMethod} onChange={handleChange} required>
                    <option value="">Select Payment Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Online">Online</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="payment-status">Payment Status</label>
                  <input id="payment-status" type="text" className="form-control" value={form.status} readOnly placeholder="Automatically calculated" />
                  <small className="text-muted">Status is calculated automatically.</small>
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-primary me-2">
                    <i className="bi bi-check-lg me-2"></i>
                    {editingId !== null ? "Update Payment" : "Save Payment"}
                  </button>
                  <button type="button" className="btn btn-light" onClick={resetForm}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT LIST */}
      <div className="card">
        <div className="card-header">
          <div>
            <h5 className="card-title mb-1">All Payments</h5>
            <small className="text-muted">
              View and manage customer, broker and project payment records.
            </small>
          </div>

          <div className="w-100 mt-3">
            <div className="row g-2">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search customer, broker, project, method..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search payments"
                />
              </div>
              <div className="col-md-2">
                <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by payment status">
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="col-md-2">
                <select className="form-select" value={customerFilter} onChange={(event) => setCustomerFilter(event.target.value)} aria-label="Filter by customer">
                  <option value="All">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
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
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-light w-100"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setCustomerFilter("All");
                    setProjectFilter("All");
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table className="table align-middle mb-0 text-nowrap">
              <thead>
                <tr>
                  <th>#</th><th>Customer</th><th>Broker</th><th>Project</th>
                  <th>Total Amount</th><th>Paid</th><th>Pending</th><th>Date</th>
                  <th>Method</th><th>Status</th><th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan="11" className="text-center text-muted py-4">No payment records found.</td></tr>
                ) : (
                  filteredPayments.map((payment, index) => (
                    <tr key={payment.id}>
                      <td>{index + 1}</td>
                      <td><div className="fw-semibold">{payment.customer}</div></td>
                      <td>{payment.broker}</td>
                      <td>{payment.project}</td>
                      <td className="text-nowrap">{formatCurrency(payment.totalAmount)}</td>
                      <td className="text-success text-nowrap">{formatCurrency(payment.paidAmount)}</td>
                      <td className="text-danger text-nowrap">{formatCurrency(payment.pendingAmount)}</td>
                      <td>{payment.paymentDate || "—"}</td>
                      <td>{payment.paymentMethod || "—"}</td>
                      <td><span className={getPaymentStatusClass(payment.status)}>{payment.status || "Pending"}</span></td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-2">
                          <button type="button" className="btn btn-sm btn-light" title="View Payment" aria-label={`View payment ${payment.id}`} onClick={() => handleView(payment)}>
                            <i className="bi bi-eye"></i>
                          </button>
                          <button type="button" className="btn btn-sm btn-light" title="Edit Payment" aria-label={`Edit payment ${payment.id}`} onClick={() => handleEdit(payment)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button type="button" className="btn btn-sm btn-light text-danger" title="Delete Payment" aria-label={`Delete payment ${payment.id}`} onClick={() => handleDelete(payment.id)}>
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

      {/* PAYMENT DETAILS POPUP - SAME DESIGN AS CUSTOMER POPUP */}
      {viewPayment && (
        <div
          role="presentation"
          onClick={() => setViewPayment(null)}
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
            aria-labelledby="payment-popup-title"
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
                <h5 id="payment-popup-title" className="mb-1">Payment Details</h5>
                <small className="text-muted">Complete payment information</small>
              </div>
              <button type="button" className="btn btn-light" onClick={() => setViewPayment(null)} aria-label="Close payment details popup">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Payment ID</div>
                  <div className="fw-semibold">#{viewPayment.id ?? "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Status</div>
                  <span className={getPaymentStatusClass(viewPayment.status)}>{viewPayment.status || "Pending"}</span>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Customer</div>
                  <div className="fw-semibold">{viewPayment.customer || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Broker</div>
                  <div className="fw-semibold">{viewPayment.broker || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Project</div>
                  <div className="fw-semibold">{viewPayment.project || "Not Assigned"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Payment Date</div>
                  <div className="fw-semibold">{viewPayment.paymentDate || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Total Amount</div>
                  <div className="fw-semibold text-nowrap">{formatCurrency(viewPayment.totalAmount)}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Paid Amount</div>
                  <div className="fw-semibold text-success text-nowrap">{formatCurrency(viewPayment.paidAmount)}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Pending Amount</div>
                  <div className="fw-semibold text-danger text-nowrap">{formatCurrency(viewPayment.pendingAmount)}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small mb-1">Payment Method</div>
                  <div className="fw-semibold">{viewPayment.paymentMethod || "—"}</div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2" style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewPayment(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => handleEdit(viewPayment)}>
                <i className="bi bi-pencil me-2"></i>Edit Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
