import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../apiConfig";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, lead, payment, followup, project

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notifications/all`);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const handleNotificationClick = (item) => {
    if (Number(item.is_read) === 0) {
      handleMarkAsRead(item.id);
    }
    // Navigate based on type
    switch (item.type) {
      case "lead":
        navigate("/leads");
        break;
      case "payment":
        navigate("/payments");
        break;
      case "followup":
        navigate("/follow-ups");
        break;
      case "customer":
        navigate("/customers");
        break;
      case "project":
        navigate("/projects");
        break;
      default:
        break;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "lead":
        return { icon: "bi-person-plus-fill", color: "#3b82f6", bg: "#eff6ff" };
      case "payment":
        return { icon: "bi-cash-stack", color: "#10b981", bg: "#ecfdf5" };
      case "followup":
        return { icon: "bi-calendar-check-fill", color: "#f59e0b", bg: "#fffbeb" };
      case "project":
        return { icon: "bi-building-fill", color: "#8b5cf6", bg: "#f5f3ff" };
      case "customer":
        return { icon: "bi-people-fill", color: "#06b6d4", bg: "#ecfeff" };
      default:
        return { icon: "bi-bell-fill", color: "#6b7280", bg: "#f3f4f6" };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return Number(n.is_read) === 0;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => Number(n.is_read) === 0).length;

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            <i className="bi bi-bell-fill text-primary me-2"></i>
            Notifications Center
          </h3>
          <p className="text-muted mb-0 small">
            Stay updated with real-time leads, payments, and task activities
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm"
              onClick={handleMarkAllRead}
            >
              <i className="bi bi-check2-all me-1"></i>
              Mark all as read ({unreadCount})
            </button>
          )}
          <button
            type="button"
            className="btn btn-light btn-sm rounded-pill px-3 border shadow-sm"
            onClick={fetchNotifications}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-2 d-flex flex-wrap gap-2">
          {[
            { key: "all", label: `All (${notifications.length})` },
            { key: "unread", label: `Unread (${unreadCount})` },
            { key: "lead", label: "Leads" },
            { key: "payment", label: "Payments" },
            { key: "followup", label: "Follow-ups" },
            { key: "project", label: "Projects" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-sm rounded-pill px-3 transition-all ${
                filter === tab.key
                  ? "btn-primary shadow-sm"
                  : "btn-outline-secondary border-0"
              }`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2 text-muted small">Loading notifications...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <div
              className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "64px", height: "64px" }}
            >
              <i className="bi bi-bell-slash text-muted fs-3"></i>
            </div>
            <h6 className="fw-bold text-dark">No notifications found</h6>
            <p className="text-muted small mb-0">
              {filter === "unread"
                ? "You have caught up with all notifications!"
                : "No activity records found in this category."}
            </p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {filtered.map((item) => {
              const meta = getIcon(item.type);
              const isUnread = Number(item.is_read) === 0;

              return (
                <div
                  key={item.id}
                  className={`list-group-item list-group-item-action p-3 d-flex align-items-center justify-content-between gap-3 border-bottom ${
                    isUnread ? "bg-light bg-opacity-75" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                    borderLeft: isUnread ? "4px solid #3b82f6" : "4px solid transparent",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor: meta.bg,
                        color: meta.color,
                        fontSize: "18px",
                      }}
                    >
                      <i className={`bi ${meta.icon}`}></i>
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-semibold text-dark">{item.title}</span>
                        {isUnread && (
                          <span
                            className="badge bg-primary rounded-pill px-2"
                            style={{ fontSize: "10px" }}
                          >
                            New
                          </span>
                        )}
                        <span
                          className="badge rounded-pill text-uppercase"
                          style={{
                            fontSize: "9px",
                            backgroundColor: meta.bg,
                            color: meta.color,
                          }}
                        >
                          {item.type || "general"}
                        </span>
                      </div>
                      <div className="text-muted small mb-1">{item.message}</div>
                      <div className="text-muted" style={{ fontSize: "11px" }}>
                        <i className="bi bi-clock me-1"></i>
                        {formatDate(item.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    {isUnread ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-light border rounded-pill px-2 py-1 text-primary"
                        title="Mark as read"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(item.id);
                        }}
                      >
                        <i className="bi bi-check-lg"></i>
                      </button>
                    ) : (
                      <span className="text-muted small me-2" title="Read">
                        <i className="bi bi-check2-all text-success"></i>
                      </span>
                    )}

                    <button
                      type="button"
                      className="btn btn-sm btn-light border rounded-pill px-2 py-1 text-danger"
                      title="Delete notification"
                      onClick={(e) => handleDelete(e, item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
