import API_BASE_URL from "../apiConfig";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactApexChart from "react-apexcharts";

/* =========================================================
   PREMIUM STAT CARD
========================================================= */

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  iconBg,
  path,
  navigate,
  valueClass = "",
}) => {
  return (
    <div className="col-sm-6 col-xl-3">
      <div
        onClick={() => navigate(path)}
        className="card border-0 h-100"
        style={{
          cursor: "pointer",
          borderRadius: "18px",
          overflow: "hidden",
          background: "#ffffff",
          boxShadow: "0 5px 20px rgba(31, 41, 55, 0.06)",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow =
            "0 12px 30px rgba(31, 41, 55, 0.10)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 5px 20px rgba(31, 41, 55, 0.06)";
        }}
      >
        <div
          style={{
            height: "4px",
            background: `linear-gradient(90deg, ${iconColor}, transparent)`,
          }}
        ></div>

        <div
          className="card-body"
          style={{
            padding: "16px",
          }}
        >

          {/* =================================================
              TOP SECTION
              TITLE + ICON
          ================================================== */}

          <div
            className="d-flex justify-content-between align-items-start"
            style={{
              width: "100%",
              minHeight: "52px",
            }}
          >

            {/* TITLE */}
            <div
              style={{
                flex: "1",
                minWidth: 0,
                paddingRight: "12px",
              }}
            >
              <div
                className="text-muted"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  lineHeight: "1.4",
                }}
              >
                {title}
              </div>
            </div>

            {/* ICON - ONLY TOP RIGHT */}
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "48px",
                height: "48px",
                minWidth: "48px",
                borderRadius: "14px",
                background: iconBg,
                color: iconColor,
              }}
            >
              <i
                className={`bi ${icon}`}
                style={{
                  fontSize: "21px",
                }}
              ></i>
            </div>

          </div>

          {/* =================================================
              VALUE
          ================================================== */}

          <div
            style={{
              width: "100%",
              marginTop: "12px",
              minWidth: 0,
            }}
          >
            <h3
              className={`mb-1 fw-bold ${valueClass}`}
              style={{
                fontSize: "24px",
                color: "#183B2A",
                lineHeight: "1.2",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "visible",
                textOverflow: "clip",
              }}
            >
              {value}
            </h3>
          </div>

          {/* =================================================
              SUBTITLE
          ================================================== */}

          <div
            className="d-flex align-items-start gap-1"
            style={{
              width: "100%",
              marginTop: "6px",
              fontSize: "11px",
              color: "#7B857F",
              lineHeight: "1.4",
            }}
          >
            <i
              className="bi bi-arrow-up-right flex-shrink-0"
              style={{
                marginTop: "1px",
              }}
            ></i>

            <span
              style={{
                overflowWrap: "break-word",
                wordBreak: "normal",
              }}
            >
              {subtitle}
            </span>
          </div>

          {/* =================================================
              VIEW DETAILS
          ================================================== */}

          <div
            className="mt-3 pt-2"
            style={{
              borderTop: "1px solid #f0f2f1",
              fontSize: "11px",
              color: "#7B857F",
              width: "100%",
            }}
          >
            <span>View Details</span>
            <i className="bi bi-arrow-right ms-1"></i>
          </div>

        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [pendingFollowups, setPendingFollowups] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  /* =========================================================
     FETCH DASHBOARD DATA
  ========================================================= */

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/dashboard/summary`)
      .then((res) => {
        console.log("DASHBOARD DATA:", res.data);
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("DASHBOARD ERROR:", err);
        setLoading(false);
      });
  }, []);

  /* =========================================================
     FETCH PENDING FOLLOW-UPS
  ========================================================= */

  useEffect(() => {
    const fetchPendingFollowups = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/dashboard/pending-followups`
        );

        console.log("PENDING FOLLOWUPS:", response.data);

        setPendingFollowups(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (error) {
        console.log("PENDING FOLLOWUPS ERROR:", error);
        setPendingFollowups([]);
      } finally {
        setPendingLoading(false);
      }
    };

    fetchPendingFollowups();
  }, []);

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatFollowupDate = (value) => {
    if (!value) {
      return "-";
    }

    const dateString = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-");

      return `${day}/${month}/${year}`;
    }

    return dateString;
  };

  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        className="dashboard-crm p-4"
        style={{
          background: "#f7f9f8",
          minHeight: "100vh",
        }}
      >
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "18px" }}
        >
          <div className="card-body text-center py-5">
            <div
              className="spinner-border"
              style={{ color: "#183B2A" }}
              role="status"
            ></div>

            <div className="mt-3 text-muted">
              Loading Dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     NO DATA
  ========================================================= */

  if (!dashboardData) {
    return (
      <div
        className="dashboard-crm p-4"
        style={{
          background: "#f7f9f8",
          minHeight: "100vh",
        }}
      >
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "18px" }}
        >
          <div className="card-body text-center py-5">
            <i
              className="bi bi-bar-chart-line"
              style={{
                fontSize: "40px",
                color: "#183B2A",
              }}
            ></i>

            <h5 className="mt-3 mb-1">
              Dashboard data not found
            </h5>

            <p className="text-muted mb-0">
              Please check your dashboard API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     PROJECT CHART
  ========================================================= */

  const projectChartSeries = [
    Number(dashboardData.projects?.upcoming || 0),
    Number(dashboardData.projects?.ongoing || 0),
    Number(dashboardData.projects?.onHold || 0),
    Number(dashboardData.projects?.completed || 0),
  ];

  const projectChartOptions = {
    chart: {
      type: "donut",
      toolbar: {
        show: false,
      },
    },

    labels: [
      "Upcoming",
      "Ongoing",
      "On Hold",
      "Completed",
    ],

    colors: [
      "#DDE8E1",
      "#183B2A",
      "#B8C6BC",
      "#7D9A87",
    ],

    dataLabels: {
      enabled: false,
    },

    legend: {
      show: false,
    },

    stroke: {
      width: 4,
      colors: ["#FFFFFF"],
    },

    plotOptions: {
      pie: {
        expandOnClick: false,

        donut: {
          size: "72%",

          labels: {
            show: true,

            name: {
              show: true,
              fontSize: "12px",
              fontWeight: 600,
              color: "#7B857F",
            },

            value: {
              show: true,
              fontSize: "27px",
              fontWeight: 800,
              color: "#183B2A",

              formatter: function (value) {
                return value;
              },
            },

            total: {
              show: true,
              showAlways: true,
              label: "Total Projects",
              fontSize: "12px",
              fontWeight: 600,
              color: "#7B857F",

              formatter: function () {
                return dashboardData.projects?.total || 0;
              },
            },
          },
        },
      },
    },

    tooltip: {
      y: {
        formatter: function (value) {
          return `${value} Projects`;
        },
      },
    },
  };

  /* =========================================================
     FOLLOW-UP STATUS
  ========================================================= */

  const getFollowupStatusClass = (status) => {
    if (status === "Overdue") {
      return "badge bg-danger";
    }

    if (status === "In Progress") {
      return "badge bg-warning text-dark";
    }

    return "badge bg-secondary";
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <div
      className="dashboard-crm"
      style={{
        background: "#f7f9f8",
        minHeight: "100vh",
        padding: "24px",
      }}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <div className="d-flex align-items-center gap-2 mb-1">

            <h1
              className="mb-0"
              style={{
                fontSize: "28px",
                fontWeight: "800",
                color: "#183B2A",
              }}
            >
              Dashboard
            </h1>

            <span
              className="badge rounded-pill"
              style={{
                background: "#e7f3eb",
                color: "#183B2A",
                fontSize: "11px",
                padding: "6px 10px",
              }}
            >
              <i className="bi bi-circle-fill me-1"></i>
              Live
            </span>

          </div>

          <p
            className="mb-0"
            style={{
              color: "#7B857F",
              fontSize: "13px",
            }}
          >
            Manage and monitor your complete
            construction business from one place.
          </p>
        </div>

        <button
          type="button"
          className="btn d-flex align-items-center gap-2"
          onClick={() => window.location.reload()}
          style={{
            border: "1px solid #dfe5e1",
            background: "#ffffff",
            color: "#183B2A",
            borderRadius: "10px",
            padding: "9px 14px",
            fontSize: "13px",
            fontWeight: "600",
            boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
          }}
        >
          <i className="bi bi-arrow-clockwise"></i>
          Refresh
        </button>

      </div>

      {/* =====================================================
          PREMIUM SUMMARY CARDS
      ====================================================== */}

      <div className="row g-3 mb-4">

        <StatCard
          title="Total Projects"
          value={dashboardData.projects?.total || 0}
          subtitle={`${dashboardData.projects?.ongoing || 0} active projects`}
          icon="bi-buildings"
          iconColor="#183B2A"
          iconBg="#E8F0EB"
          path="/projects"
          navigate={navigate}
        />

        <StatCard
          title="Active Projects"
          value={dashboardData.projects?.ongoing || 0}
          subtitle="Currently ongoing"
          icon="bi-building-check"
          iconColor="#28744A"
          iconBg="#E9F7EE"
          path="/projects"
          navigate={navigate}
        />

        <StatCard
          title="Completed Projects"
          value={dashboardData.projects?.completed || 0}
          subtitle="Successfully completed"
          icon="bi-patch-check-fill"
          iconColor="#5B6D63"
          iconBg="#EEF2EF"
          path="/projects"
          navigate={navigate}
        />

        <StatCard
          title="Total Customers"
          value={dashboardData.customers?.total || 0}
          subtitle="Customer accounts"
          icon="bi-people-fill"
          iconColor="#6B4E9B"
          iconBg="#F1EBFA"
          path="/customers"
          navigate={navigate}
        />

        <StatCard
          title="Total Brokers"
          value={dashboardData.brokers?.total || 0}
          subtitle="Registered brokers"
          icon="bi-person-badge-fill"
          iconColor="#B06B24"
          iconBg="#FBF1E7"
          path="/brokers"
          navigate={navigate}
        />

        <StatCard
          title="Total Leads"
          value={dashboardData.leads?.total || 0}
          subtitle="All leads"
          icon="bi-bullseye"
          iconColor="#A64040"
          iconBg="#FBECEC"
          path="/leads"
          navigate={navigate}
        />

        <StatCard
          title="Total Payments"
          value={`₹${formatMoney(dashboardData.payments?.total)}`}
          subtitle="Total recorded"
          icon="bi-wallet2"
          iconColor="#2E7D59"
          iconBg="#E8F6EE"
          path="/payments"
          navigate={navigate}
          valueClass="payment-value"
        />

        <StatCard
          title="Pending Payments"
          value={`₹${formatMoney(dashboardData.payments?.pending)}`}
          subtitle="Needs attention"
          icon="bi-wallet-fill"
          iconColor="#B94A48"
          iconBg="#FCEEEE"
          path="/payments"
          navigate={navigate}
          valueClass="payment-value"
        />

      </div>

      {/* =====================================================
          FOLLOW UPS
      ====================================================== */}

      <div
        className="card border-0 mt-4"
        style={{
          borderRadius: "18px",
          boxShadow: "0 5px 20px rgba(31, 41, 55, 0.06)",
          overflow: "hidden",
        }}
      >

        <div className="card-header bg-white border-0 px-4 py-3">

          {/* IMPORTANT:
              LEFT = Pending Follow-ups
              RIGHT = Count + View All
          */}
          <div className="d-flex align-items-center w-100">

            {/* LEFT SIDE */}
            <div className="d-flex align-items-center gap-3">

              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: "#FFF4D9",
                  color: "#A87300",
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-bell-fill fs-5"></i>
              </div>

              <div>

                <h5
                  className="mb-1"
                  style={{
                    color: "#183B2A",
                    fontWeight: "700",
                    fontSize: "17px",
                  }}
                >
                  Pending Follow-ups & Tasks
                </h5>

                <span
                  className="text-muted"
                  style={{
                    fontSize: "12px",
                  }}
                >
                  Pending, in-progress and overdue activities
                </span>

              </div>

            </div>

            {/* RIGHT CORNER */}
            <div
              className="d-flex align-items-center gap-2"
              style={{
                marginLeft: "auto",
                flexShrink: 0,
              }}
            >

              <span
                className="badge"
                style={{
                  background: "#FFF4D9",
                  color: "#8A6400",
                  padding: "7px 10px",
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                }}
              >
                {pendingFollowups.length}
              </span>

              <button
                type="button"
                className="btn btn-sm"
                onClick={() => navigate("/follow-ups")}
                style={{
                  border: "1px solid #e1e7e3",
                  background: "#fff",
                  color: "#183B2A",
                  borderRadius: "9px",
                  padding: "7px 12px",
                  whiteSpace: "nowrap",
                  fontWeight: "500",
                }}
              >
                View All
                <i className="bi bi-arrow-right ms-1"></i>
              </button>

            </div>

          </div>

        </div>

        <div
          className="card-body p-0"
          style={{
            maxHeight: "380px",
            overflowY: "auto",
          }}
        >

          {pendingLoading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border"
                style={{
                  color: "#183B2A",
                }}
                role="status"
              ></div>

              <div className="mt-2 text-muted small">
                Loading pending tasks...
              </div>

            </div>

          ) : pendingFollowups.length === 0 ? (

            <div className="text-center py-5 text-muted">

              <div
                className="d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "#E9F7EE",
                  color: "#28744A",
                }}
              >
                <i className="bi bi-check-lg fs-4"></i>
              </div>

              <div className="fw-semibold">
                No pending follow-ups or tasks
              </div>

            </div>

          ) : (

            <div className="list-group list-group-flush">

              {pendingFollowups.map((item) => (

                <div
                  key={item.id}
                  className="list-group-item px-4 py-3"
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f3f2",
                  }}
                  onClick={() => navigate("/follow-ups")}
                >

                  <div className="d-flex justify-content-between align-items-start gap-3">

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >

                      <div
                        className="fw-semibold"
                        style={{
                          color: "#25322C",
                        }}
                      >
                        {item.task || "Untitled Task"}
                      </div>

                      <div className="small text-muted mt-1">
                        {item.customerLead ? (
                          <>
                            <i className="bi bi-person me-1"></i>
                            {item.customerLead}
                          </>
                        ) : (
                          "No customer / lead"
                        )}
                      </div>

                      <div className="small text-muted mt-1">

                        <i className="bi bi-calendar3 me-1"></i>

                        {formatFollowupDate(
                          item.follow_up_date
                        )}

                        {item.assignedTo && (
                          <>
                            <span className="mx-2">
                              •
                            </span>

                            <i className="bi bi-person-badge me-1"></i>

                            {item.assignedTo}
                          </>
                        )}

                      </div>

                      {item.notes && (
                        <div
                          className="small text-muted mt-1"
                          style={{
                            maxWidth: "85%",
                          }}
                        >
                          <i className="bi bi-chat-left-text me-1"></i>
                          {item.notes}
                        </div>
                      )}

                    </div>

                    <span
                      className={getFollowupStatusClass(
                        item.status
                      )}
                      style={{
                        whiteSpace: "nowrap",
                        borderRadius: "7px",
                        padding: "6px 9px",
                        fontSize: "11px",
                      }}
                    >
                      {item.status || "Pending"}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          PROJECT STATISTICS + SIDE INFO
      ====================================================== */}

      <div className="row g-4 mt-1">

        {/* PROJECT STATISTICS */}

        <div className="col-xl-7">

          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "18px",
              boxShadow: "0 5px 20px rgba(31, 41, 55, 0.06)",
            }}
          >

            <div className="card-header bg-white border-0 px-4 py-3">

              <div className="d-flex justify-content-between align-items-center">

                <div className="d-flex align-items-center gap-3">

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "14px",
                      background: "#E8F0EB",
                      color: "#183B2A",
                    }}
                  >
                    <i className="bi bi-pie-chart-fill fs-5"></i>
                  </div>

                  <div>

                    <h5
                      className="mb-1"
                      style={{
                        color: "#183B2A",
                        fontWeight: "700",
                        fontSize: "17px",
                      }}
                    >
                      Project Statistics
                    </h5>

                    <span
                      className="text-muted"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      Overview according to current project status
                    </span>

                  </div>

                </div>

                <button
                  className="btn btn-sm"
                  type="button"
                  onClick={() => navigate("/projects")}
                  style={{
                    border: "1px solid #e1e7e3",
                    borderRadius: "9px",
                    color: "#183B2A",
                    background: "#fff",
                  }}
                >
                  View
                  <i className="bi bi-arrow-right ms-1"></i>
                </button>

              </div>

            </div>

            <div className="card-body px-4 pb-4">

              <div className="row align-items-center">

                <div className="col-lg-7 text-center">

                  <ReactApexChart
                    type="donut"
                    height={320}
                    series={projectChartSeries}
                    options={projectChartOptions}
                  />

                </div>

                <div className="col-lg-5">

                  {/* UPCOMING */}
                  <div
                    className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3"
                    style={{
                      cursor: "pointer",
                      background: "#F8FAF9",
                    }}
                    onClick={() => navigate("/projects")}
                  >

                    <div className="d-flex align-items-center gap-2">

                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "#DDE8E1",
                        }}
                      ></span>

                      <div>
                        <div className="fw-semibold small">
                          Upcoming
                        </div>
                        <small className="text-muted">
                          Scheduled to start
                        </small>
                      </div>

                    </div>

                    <strong>
                      {dashboardData.projects?.upcoming || 0}
                    </strong>

                  </div>

                  {/* ONGOING */}
                  <div
                    className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3"
                    style={{
                      cursor: "pointer",
                      background: "#F8FAF9",
                    }}
                    onClick={() => navigate("/projects")}
                  >

                    <div className="d-flex align-items-center gap-2">

                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "#183B2A",
                        }}
                      ></span>

                      <div>
                        <div className="fw-semibold small">
                          Ongoing
                        </div>
                        <small className="text-muted">
                          Currently in progress
                        </small>
                      </div>

                    </div>

                    <strong>
                      {dashboardData.projects?.ongoing || 0}
                    </strong>

                  </div>

                  {/* ON HOLD */}
                  <div
                    className="d-flex justify-content-between align-items-center mb-3 p-2 rounded-3"
                    style={{
                      cursor: "pointer",
                      background: "#F8FAF9",
                    }}
                    onClick={() => navigate("/projects")}
                  >

                    <div className="d-flex align-items-center gap-2">

                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "#B8C6BC",
                        }}
                      ></span>

                      <div>
                        <div className="fw-semibold small">
                          On Hold
                        </div>
                        <small className="text-muted">
                          Temporarily paused
                        </small>
                      </div>

                    </div>

                    <strong>
                      {dashboardData.projects?.onHold || 0}
                    </strong>

                  </div>

                  {/* COMPLETED */}
                  <div
                    className="d-flex justify-content-between align-items-center p-2 rounded-3"
                    style={{
                      cursor: "pointer",
                      background: "#F8FAF9",
                    }}
                    onClick={() => navigate("/projects")}
                  >

                    <div className="d-flex align-items-center gap-2">

                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "#7D9A87",
                        }}
                      ></span>

                      <div>
                        <div className="fw-semibold small">
                          Completed
                        </div>
                        <small className="text-muted">
                          Successfully completed
                        </small>
                      </div>

                    </div>

                    <strong>
                      {dashboardData.projects?.completed || 0}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* BUSINESS SNAPSHOT */}

        <div className="col-xl-5">

          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "18px",
              boxShadow: "0 5px 20px rgba(31, 41, 55, 0.06)",
            }}
          >

            <div className="card-header bg-white border-0 px-4 py-3">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "#EEF2FF",
                    color: "#4F46A5",
                  }}
                >
                  <i className="bi bi-grid-1x2-fill fs-5"></i>
                </div>

                <div>

                  <h5
                    className="mb-1"
                    style={{
                      color: "#183B2A",
                      fontWeight: "700",
                      fontSize: "17px",
                    }}
                  >
                    Business Snapshot
                  </h5>

                  <span
                    className="text-muted"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    Current business activity
                  </span>

                </div>

              </div>

            </div>

            <div className="card-body px-4 pb-4">

              {/* LEAD CONVERSION */}

              <div className="mb-4">

                <div className="d-flex justify-content-between align-items-center mb-2">

                  <span className="small fw-semibold">
                    Lead Conversion
                  </span>

                  <span className="small text-muted">
                    {dashboardData.leads?.converted || 0} converted
                  </span>

                </div>

                <div
                  className="progress"
                  style={{
                    height: "7px",
                    borderRadius: "10px",
                    background: "#edf1ef",
                  }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${
                        dashboardData.leads?.total
                          ? Math.min(
                              100,
                              (Number(
                                dashboardData.leads.converted || 0
                              ) /
                                Number(
                                  dashboardData.leads.total || 1
                                )) *
                                100
                            )
                          : 0
                      }%`,
                      background: "#183B2A",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>

              </div>

              {/* PAYMENT COLLECTION */}

              <div className="mb-4">

                <div className="d-flex justify-content-between align-items-center mb-2">

                  <span className="small fw-semibold">
                    Payment Collection
                  </span>

                  <span className="small text-muted">
                    {dashboardData.payments?.paid
                      ? `₹${formatMoney(dashboardData.payments.paid)}`
                      : "₹0"}
                  </span>

                </div>

                <div
                  className="progress"
                  style={{
                    height: "7px",
                    borderRadius: "10px",
                    background: "#edf1ef",
                  }}
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${
                        dashboardData.payments?.total
                          ? Math.min(
                              100,
                              (Number(
                                dashboardData.payments.paid || 0
                              ) /
                                Number(
                                  dashboardData.payments.total || 1
                                )) *
                                100
                            )
                          : 0
                      }%`,
                      background: "#2E7D59",
                      borderRadius: "10px",
                    }}
                  ></div>
                </div>

              </div>

              {/* MINI STATS */}

              <div className="row g-2">

                <div className="col-6">
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: "#F7F9F8",
                    }}
                  >
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "11px",
                      }}
                    >
                      New Leads
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        color: "#183B2A",
                        fontSize: "19px",
                      }}
                    >
                      {dashboardData.leads?.newLeads || 0}
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: "#F7F9F8",
                    }}
                  >
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "11px",
                      }}
                    >
                      Follow-up
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        color: "#183B2A",
                        fontSize: "19px",
                      }}
                    >
                      {dashboardData.leads?.followUp || 0}
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: "#F7F9F8",
                    }}
                  >
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "11px",
                      }}
                    >
                      Contacted
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        color: "#183B2A",
                        fontSize: "19px",
                      }}
                    >
                      {dashboardData.leads?.contacted || 0}
                    </div>
                  </div>
                </div>

                <div className="col-6">
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: "#F7F9F8",
                    }}
                  >
                    <div
                      className="text-muted"
                      style={{
                        fontSize: "11px",
                      }}
                    >
                      Pending Amount
                    </div>

                    <div
                      className="fw-bold mt-1"
                      style={{
                        color: "#B94A48",
                        fontSize: "18px",
                      }}
                    >
                      ₹{formatMoney(
                        dashboardData.payments?.pending
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PAYMENT + LEADS DETAIL
      ====================================================== */}

      <div className="row g-4 mt-1">

        {/* LEADS */}

        <div className="col-xl-6">

          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "18px",
              boxShadow: "0 5px 20px rgba(31, 41, 55, 0.06)",
            }}
          >

            <div className="card-header bg-white border-0 px-4 py-3">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "#FBECEC",
                    color: "#A64040",
                  }}
                >
                  <i className="bi bi-bullseye fs-5"></i>
                </div>

                <div>

                  <h5
                    className="mb-1"
                    style={{
                      color: "#183B2A",
                      fontWeight: "700",
                      fontSize: "17px",
                    }}
                  >
                    Leads Overview
                  </h5>

                  <span
                    className="text-muted"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    Current lead activity
                  </span>

                </div>

              </div>

            </div>

            <div className="card-body px-4">

              {[
                {
                  label: "New Leads",
                  value: dashboardData.leads?.newLeads || 0,
                  icon: "bi-plus-circle",
                },
                {
                  label: "Contacted",
                  value: dashboardData.leads?.contacted || 0,
                  icon: "bi-telephone",
                },
                {
                  label: "Follow-up",
                  value: dashboardData.leads?.followUp || 0,
                  icon: "bi-arrow-repeat",
                },
                {
                  label: "Converted",
                  value: dashboardData.leads?.converted || 0,
                  icon: "bi-check-circle",
                },
              ].map((item, index) => (

                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center py-2"
                  style={{
                    borderBottom:
                      index !== 3
                        ? "1px solid #f0f2f1"
                        : "none",
                  }}
                >

                  <div className="d-flex align-items-center gap-2">

                    <i
                      className={`bi ${item.icon}`}
                      style={{
                        color: "#183B2A",
                      }}
                    ></i>

                    <span className="small">
                      {item.label}
                    </span>

                  </div>

                  <span
                    className="fw-bold"
                    style={{
                      color: "#183B2A",
                    }}
                  >
                    {item.value}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* PAYMENTS */}

        <div className="col-xl-6">

          <div
            className="card border-0 h-100"
            style={{
              borderRadius: "18px",
              boxShadow: "0 5px 20px rgba(31, 41, 55, 0.06)",
            }}
          >

            <div className="card-header bg-white border-0 px-4 py-3">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "#E8F6EE",
                    color: "#2E7D59",
                  }}
                >
                  <i className="bi bi-wallet2 fs-5"></i>
                </div>

                <div>

                  <h5
                    className="mb-1"
                    style={{
                      color: "#183B2A",
                      fontWeight: "700",
                      fontSize: "17px",
                    }}
                  >
                    Payment Overview
                  </h5>

                  <span
                    className="text-muted"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    Current customer and project payments
                  </span>

                </div>

              </div>

            </div>

            <div className="card-body px-4">

              {/* TOTAL */}

              <div className="d-flex justify-content-between align-items-center py-2">

                <div className="d-flex align-items-center gap-2">

                  <i
                    className="bi bi-cash-stack"
                    style={{
                      color: "#183B2A",
                    }}
                  ></i>

                  <span className="small">
                    Total Amount
                  </span>

                </div>

                <strong
                  style={{
                    color: "#183B2A",
                  }}
                >
                  ₹{formatMoney(
                    dashboardData.payments?.total
                  )}
                </strong>

              </div>

              {/* PAID */}

              <div className="d-flex justify-content-between align-items-center py-2">

                <div className="d-flex align-items-center gap-2">

                  <i
                    className="bi bi-check-circle-fill"
                    style={{
                      color: "#2E7D59",
                    }}
                  ></i>

                  <span className="small">
                    Paid Amount
                  </span>

                </div>

                <strong className="text-success">
                  ₹{formatMoney(
                    dashboardData.payments?.paid
                  )}
                </strong>

              </div>

              {/* PENDING */}

              <div className="d-flex justify-content-between align-items-center py-2">

                <div className="d-flex align-items-center gap-2">

                  <i
                    className="bi bi-clock-fill"
                    style={{
                      color: "#B94A48",
                    }}
                  ></i>

                  <span className="small">
                    Pending Amount
                  </span>

                </div>

                <strong
                  style={{
                    color: "#B94A48",
                  }}
                >
                  ₹{formatMoney(
                    dashboardData.payments?.pending
                  )}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;