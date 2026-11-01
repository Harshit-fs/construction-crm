import API_BASE_URL from "../apiConfig";
import  { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = API_BASE_URL;

function Reports() {
  const [selectedReport, setSelectedReport] = useState("Customer Report");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [brokerFilter, setBrokerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportData, setReportData] = useState([]);
  const [viewRecord, setViewRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [brokers, setBrokers] = useState([]);
  const [summaryData, setSummaryData] = useState({
    customers: 0,
    brokers: 0,
    leads: 0,
    pendingPayments: 0,
  });

  const reportTypes = [
    "Customer Report",
    "Broker Report",
    "Broker Payment Report",
    "Lead Report",
    "Project Report",
    "Property Report",
    "Inventory Report",
    "Payment Report",
    "Sales Report",
    "Pending Payment Report",
    "Follow-up Report",
  ];

  const reportApi = {
    "Customer Report": "/reports/customers",
    "Broker Report": "/reports/brokers",
    "Broker Payment Report": "/reports/broker-payments",
    "Lead Report": "/reports/leads",
    "Project Report": "/reports/projects",
    "Property Report": "/reports/properties",
    "Inventory Report": "/reports/inventory",
    "Payment Report": "/reports/payments",
    "Sales Report": "/reports/sales",
    "Pending Payment Report": "/reports/pending-payments",
    "Follow-up Report": "/reports/followups",
  };

  const moneyFields = [
    "total", "paid", "pending", "amount", "commission", "price", "budget",
    "total_amount", "paid_amount", "pending_amount", "total_paid",
    "unit_price", "stock_value", "total_value", "purchase_price",
    "selling_price", "cost_price", "estimated_cost", "material_cost",
  ];

  const reportColumns = {
    "Customer Report": [
      { label: "#", key: "__index" },
      { label: "Name", key: "name" },
      { label: "Phone", key: "phone" },
      { label: "Email", key: "email" },
      { label: "Broker", key: "broker" },
      { label: "Status", key: "status", type: "status" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Actions", key: "__actions" },
    ],
    "Broker Report": [
      { label: "#", key: "__index" },
      { label: "Name", key: "name" },
      { label: "Phone", key: "phone" },
      { label: "Email", key: "email" },
      { label: "Commission", key: "commission", type: "money", className: "text-success fw-semibold" },
      { label: "Status", key: "status", type: "status" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Actions", key: "__actions" },
    ],
    "Broker Payment Report": [
      { label: "#", key: "__index" },
      { label: "Broker", key: "broker_name" },
      { label: "Total Paid", key: "total_paid", type: "money", className: "text-success fw-semibold" },
      { label: "Actions", key: "__actions" },
    ],
    "Lead Report": [
      { label: "#", key: "__index" },
      { label: "Name", key: "name" },
      { label: "Source", key: "source" },
      { label: "Broker", key: "broker" },
      { label: "Employee", key: "employee" },
      { label: "Status", key: "status", type: "status" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Actions", key: "__actions" },
    ],
    "Project Report": [
      { label: "#", key: "__index" },
      { label: "Name", key: "name" },
      { label: "Location", key: "location" },
      { label: "Type", key: "type" },
      { label: "Budget", key: "budget", type: "money" },
      { label: "Progress", key: "progress", type: "progress" },
      { label: "Status", key: "status", type: "status" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Actions", key: "__actions" },
    ],
    "Property Report": [
      { label: "#", key: "__index" },
      { label: "Property", key: "property" },
      { label: "Project", key: "project" },
      { label: "Type", key: "type" },
      { label: "Area", key: "area" },
      { label: "Price", key: "price", type: "money" },
      { label: "Status", key: "status", type: "status" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Actions", key: "__actions" },
    ],
    "Payment Report": [
      { label: "#", key: "__index" },
      { label: "Customer", key: "customer" },
      { label: "Project", key: "project" },
      { label: "Total", key: "total", type: "money" },
      { label: "Paid", key: "paid", type: "money" },
      { label: "Pending", key: "pending", type: "money" },
      { label: "Method", key: "method" },
      { label: "Status", key: "status", type: "status" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Actions", key: "__actions" },
    ],
    "Sales Report": [
      { label: "#", key: "__index" },
      { label: "Customer", key: "customer" },
      { label: "Property", key: "property" },
      { label: "Project", key: "project" },
      { label: "Amount", key: "amount", type: "money" },
      { label: "Broker", key: "broker" },
      { label: "Status", key: "status", type: "status" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Actions", key: "__actions" },
    ],
    "Pending Payment Report": [
      { label: "#", key: "__index" },
      { label: "Customer", key: "customer" },
      { label: "Project", key: "project" },
      { label: "Total", key: "total", type: "money" },
      { label: "Paid", key: "paid", type: "money" },
      { label: "Pending", key: "pending", type: "money" },
      { label: "Status", key: "status", type: "status" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Actions", key: "__actions" },
    ],
    "Follow-up Report": [
      { label: "#", key: "__index" },
      { label: "Task", key: "task" },
      { label: "Customer / Lead", key: "customerLead" },
      { label: "Assigned To", key: "assignedTo" },
      { label: "Date & Time", key: "date_time", type: "datetime" },
      { label: "Status", key: "status", type: "status" },
      { label: "Notes", key: "notes" },
      { label: "Actions", key: "__actions" },
    ],
  };

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const response = await axios.get(`${API_BASE}/broker/all`);
        setBrokers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("BROKERS FETCH ERROR:", error.response?.data || error.message);
        setBrokers([]);
      }
    };
    fetchBrokers();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (statusFilter) params.status = statusFilter;
        if (selectedReport === "Broker Payment Report" && brokerFilter) {
          params.broker_id = brokerFilter;
        }
        if (dateFrom) params.from_date = dateFrom;
        if (dateTo) params.to_date = dateTo;

        const response = await axios.get(`${API_BASE}${reportApi[selectedReport]}`, { params });
        if (isMounted) {
          setReportData(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("REPORT FETCH ERROR:", error.response?.data || error.message);
        if (isMounted) setReportData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();
    return () => { isMounted = false; };
  }, [selectedReport, search, statusFilter, brokerFilter, dateFrom, dateTo]);

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      try {
        const [customerResponse, brokerResponse, leadResponse, pendingPaymentResponse] = await Promise.all([
          axios.get(`${API_BASE}/reports/customers`),
          axios.get(`${API_BASE}/reports/brokers`),
          axios.get(`${API_BASE}/reports/leads`),
          axios.get(`${API_BASE}/reports/pending-payments`),
        ]);

        const pendingPayments = Array.isArray(pendingPaymentResponse.data)
          ? pendingPaymentResponse.data.reduce(
              (total, item) => total + Number(item.pending ?? item.pending_amount ?? 0),
              0
            )
          : 0;

        if (isMounted) {
          setSummaryData({
            customers: Array.isArray(customerResponse.data) ? customerResponse.data.length : 0,
            brokers: Array.isArray(brokerResponse.data) ? brokerResponse.data.length : 0,
            leads: Array.isArray(leadResponse.data) ? leadResponse.data.length : 0,
            pendingPayments,
          });
        }
      } catch (error) {
        console.error("SUMMARY FETCH ERROR:", error.response?.data || error.message);
      }
    };

    fetchSummary();
    return () => { isMounted = false; };
  }, []);

  // Close the details popup with Escape and prevent background scrolling while it is open.
  useEffect(() => {
    if (!viewRecord) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") setViewRecord(null);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [viewRecord]);

  const formatReportDate = (value) => {
    if (!value) return "-";
    const dateString = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    }
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
      const [datePart] = dateString.split(" ");
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}/${year}`;
    }
    if (dateString.includes("T")) {
      const [year, month, day] = dateString.split("T")[0].split("-");
      if (year && month && day) return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const formatReportDateTime = (value) => {
    if (!value) return "-";
    const dateString = String(value);

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
      const [datePart, timePart] = dateString.split(" ");
      const [year, month, day] = datePart.split("-");
      return `${day}/${month}/${year} ${timePart}`;
    }
    if (dateString.includes("T")) {
      const [datePart, rawTime] = dateString.split("T");
      const [year, month, day] = datePart.split("-");
      const timePart = rawTime?.replace("Z", "").split(".")[0];
      if (year && month && day) {
        return timePart ? `${day}/${month}/${year} ${timePart}` : `${day}/${month}/${year}`;
      }
    }
    return formatReportDate(value);
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const number = Number(value);
    if (Number.isNaN(number)) return value;
    return `₹${number.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatColumnName = (key) => {
    const specialNames = {
      customerLead: "Customer / Lead",
      assignedTo: "Assigned To",
      date_time: "Date & Time",
      total_amount: "Total",
      paid_amount: "Paid",
      pending_amount: "Pending",
      broker_id: "Broker ID",
      broker_name: "Broker",
      total_paid: "Total Paid",
      item_name: "Item Name",
      item_code: "Item Code",
      stock_quantity: "Stock Quantity",
      min_stock: "Minimum Stock",
      unit_price: "Unit Price",
      stock_value: "Stock Value",
      created_at: "Created At",
      updated_at: "Updated At",
    };
    if (specialNames[key]) return specialNames[key];
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/[_-]+/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getStatusClass = (status) => {
    if (["Completed", "Active", "Paid", "Converted", "Sold", "In Stock"].includes(status)) {
      return "badge bg-success";
    }
    if (["Pending", "Follow-up", "Partial", "Reserved", "Ongoing", "Low Stock"].includes(status)) {
      return "badge bg-warning text-dark";
    }
    if (["Out of Stock", "Inactive", "Cancelled", "Rejected"].includes(status)) {
      return "badge bg-danger";
    }
    return "badge bg-secondary";
  };

  const handleReportChange = (event) => {
    setSelectedReport(event.target.value);
    setSearch("");
    setStatusFilter("");
    setBrokerFilter("");
    setDateFrom("");
    setDateTo("");
    setViewRecord(null);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setBrokerFilter("");
    setDateFrom("");
    setDateTo("");
    setViewRecord(null);
  };

  const handleView = (record) => setViewRecord(record);

  const handleExport = (record = null) => {
    const isClickEvent = record && (record.nativeEvent || record.type === "click");
    const selectedRecord = isClickEvent ? null : record;
    const dataToExport = selectedRecord ? [selectedRecord] : reportData;

    if (dataToExport.length === 0) {
      alert("No report data available to export.");
      return;
    }

    const headers = Object.keys(dataToExport[0]);
    const formatExportValue = (value, header) => {
      if (value === null || value === undefined) return "";
      if (header === "date_time" || header.endsWith("_at")) {
        return `="${formatReportDateTime(value)}"`;
      }
      if (header === "payment_date" || header === "date") return formatReportDate(value);
      if (moneyFields.includes(header.toLowerCase())) return formatMoney(value);
      return String(value);
    };

    const rows = dataToExport.map((item) =>
      headers.map((header) => {
        const value = formatExportValue(item[header], header);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",")
    );

    const csv = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    if (selectedRecord && selectedReport === "Broker Payment Report") {
      const brokerName = selectedRecord.broker_name || "broker";
      link.download = `${brokerName}-payment-report`.toLowerCase().replace(/\s+/g, "-") + ".csv";
    } else {
      link.download = selectedReport.toLowerCase().replace(/\s+/g, "-") + ".csv";
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusOptions = [...new Set(reportData.map((item) => item.status).filter(Boolean))];
  const brokerPaymentStatusOptions = ["Pending", "Partial", "Paid"];

  // Inventory columns are built from the fields returned by the real inventory API.
  // Other report types keep their existing, explicitly defined columns.
  const inventoryColumns = selectedReport === "Inventory Report" && reportData.length > 0
    ? [
        { label: "#", key: "__index" },
        ...Object.keys(reportData[0])
          .filter((key) => key !== "id")
          .map((key) => {
            const lowerKey = key.toLowerCase();
            let type;

            if (moneyFields.includes(lowerKey) || lowerKey.endsWith("_price") || lowerKey.endsWith("_cost")) {
              type = "money";
            } else if (lowerKey === "status" || lowerKey.endsWith("_status")) {
              type = "status";
            } else if (
              lowerKey.includes("date_time") ||
              lowerKey.endsWith("_at") ||
              lowerKey === "date" ||
              lowerKey.endsWith("_date")
            ) {
              type = "datetime";
            }

            return { label: formatColumnName(key), key, type };
          }),
        { label: "Actions", key: "__actions" },
      ]
    : [];

  const columns = selectedReport === "Inventory Report"
    ? inventoryColumns
    : (reportColumns[selectedReport] || []);

  const renderCell = (record, column, index) => {
    if (column.key === "__index") return index + 1;

    if (column.key === "__actions") {
      return (
        <div className="d-flex gap-1">
          <button
            type="button"
            className="btn btn-sm btn-light"
            title="View Report"
            onClick={() => handleView(record)}
            style={{ fontSize: "11px", padding: "4px 7px" }}
          >
            <i className="bi bi-eye"></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-light"
            title="Export This Record"
            onClick={() => handleExport(record)}
            style={{ fontSize: "11px", padding: "4px 7px" }}
          >
            <i className="bi bi-download"></i>
          </button>
        </div>
      );
    }

    const value = record[column.key];
    if (column.type === "status") return <span className={getStatusClass(value)}>{value || "-"}</span>;
    if (column.type === "money") return <span className={column.className || ""}>{formatMoney(value)}</span>;
    if (column.type === "datetime") return formatReportDateTime(value);
    if (column.type === "progress") return value || "0%";
    return value === null || value === undefined || value === "" ? "-" : String(value);
  };

  return (
    <div className="container-fluid">
      {/* PAGE HEADER */}
      <div className="page-header mb-4">
        <div>
          <h1 className="page-title">Reports &amp; Analytics</h1>
          <p className="page-subtitle">
            View customer, broker, lead, project, property, inventory, payment and follow-up reports.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleExport()}
          disabled={loading || reportData.length === 0}
        >
          <i className="bi bi-download me-2"></i>Export Report
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Total Customers</div>
            <h3 className="mb-0">{summaryData.customers}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Total Brokers</div>
            <h3 className="mb-0">{summaryData.brokers}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Total Leads</div>
            <h3 className="mb-0">{summaryData.leads}</h3>
          </div></div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card h-100"><div className="card-body">
            <div className="text-muted mb-2">Pending Payments</div>
            <h3 className="mb-0 text-nowrap payment-value">{formatMoney(summaryData.pendingPayments)}</h3>
          </div></div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-1">Search &amp; Filters</h5>
          <small className="text-muted">Search and filter reports by type, status, broker and date.</small>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className={selectedReport === "Broker Payment Report" ? "col-xl-3 col-md-6" : "col-xl-4 col-md-6"}>
              <label className="form-label">Report Type</label>
              <select className="form-select" value={selectedReport} onChange={handleReportChange}>
                {reportTypes.map((report) => <option key={report} value={report}>{report}</option>)}
              </select>
            </div>

            {selectedReport === "Broker Payment Report" && (
              <div className="col-xl-3 col-md-6">
                <label className="form-label">Broker</label>
                <select className="form-select" value={brokerFilter} onChange={(event) => setBrokerFilter(event.target.value)}>
                  <option value="">All Brokers</option>
                  {brokers.map((broker) => <option key={broker.id} value={broker.id}>{broker.name}</option>)}
                </select>
              </div>
            )}

            <div className={selectedReport === "Broker Payment Report" ? "col-xl-3 col-md-6" : "col-xl-4 col-md-6"}>
              <label className="form-label">Search</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search ${selectedReport}`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className={selectedReport === "Broker Payment Report" ? "col-xl-3 col-md-6" : "col-xl-4 col-md-6"}>
              <label className="form-label">Status</label>
              <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">All Status</option>
                {(selectedReport === "Broker Payment Report" ? brokerPaymentStatusOptions : statusOptions)
                  .map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Date From</label>
              <input type="date" className="form-control" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date To</label>
              <input type="date" className="form-control" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button type="button" className="btn btn-light w-100" onClick={handleResetFilters}>
                <i className="bi bi-arrow-counterclockwise me-2"></i>Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REPORT TABLE */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1">{selectedReport}</h5>
            <small className="text-muted">{loading ? "Loading..." : `${reportData.length} record(s) found.`}</small>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleExport()}
            disabled={loading || reportData.length === 0}
          >
            <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export
          </button>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="mt-2 text-muted">Loading report...</div>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-file-earmark-x fs-3 d-block mb-2"></i>
              No report data found.
              {selectedReport === "Inventory Report" && (
                <div className="small mt-2">Make sure the backend GET /reports/inventory endpoint is configured.</div>
              )}
            </div>
          ) : (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table className="table table-bordered table-hover align-middle reports-table" style={{ width: "100%", minWidth: "1100px", tableLayout: "fixed", marginBottom: 0 }}>
                <thead className="table-light">
                  <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
                </thead>
                <tbody>
                  {reportData.map((record, index) => (
                    <tr key={record.id || record.broker_id || index}>
                      {columns.map((column) => <td key={column.key}>{renderCell(record, column, index)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* REPORT DETAILS POPUP */}
      {viewRecord && (
        <div
          role="presentation"
          onClick={() => setViewRecord(null)}
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
            aria-labelledby="report-popup-title"
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
                <h5 id="report-popup-title" className="mb-1">{selectedReport} Details</h5>
                <small className="text-muted">Complete report information</small>
              </div>
              <button type="button" className="btn btn-light" onClick={() => setViewRecord(null)} aria-label="Close report details popup">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div className="row g-4">
                {Object.entries(viewRecord).map(([key, value]) => {
                  if (key === "id") return null;
                  const lowerKey = key.toLowerCase();
                  const isDateTime = lowerKey.includes("date_time") || lowerKey.includes("created_at") || lowerKey.includes("updated_at");
                  const isDate = lowerKey === "date" || lowerKey.endsWith("_date");
                  const isMoney = moneyFields.includes(lowerKey) || lowerKey.endsWith("_price") || lowerKey.endsWith("_cost");

                  let displayValue = "-";
                  if (isDateTime) displayValue = formatReportDateTime(value);
                  else if (isDate) displayValue = formatReportDate(value);
                  else if (isMoney) displayValue = formatMoney(value);
                  else if (value !== null && value !== undefined && value !== "") displayValue = String(value);

                  return (
                    <div className="col-md-6" key={key}>
                      <div className="text-muted small mb-1">{formatColumnName(key)}</div>
                      <div className="fw-semibold text-break" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                        {lowerKey.includes("status") && value ? (
                          <span className={getStatusClass(value)}>{displayValue}</span>
                        ) : displayValue}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2" style={{ padding: "16px 24px", borderTop: "1px solid #e9ecef" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewRecord(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => handleExport(viewRecord)}>
                <i className="bi bi-download me-2"></i>Export Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
