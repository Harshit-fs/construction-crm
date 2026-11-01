import API_BASE_URL from "../apiConfig";

import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";


function Navbar() {
  const navigate = useNavigate();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ================================
  // LOGGED IN USER
  // ================================

 
const [user, setUser] = useState(() => {
  try {
    const savedUser = localStorage.getItem("user"); 
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) { 
    localStorage.removeItem("user");
    return null;
  }
});


  // ================================
  // NOTIFICATIONS
  // ================================

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter(
    (n) => Number(n.is_read) === 0
  ).length;

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showNotifications]);

  // ================================
  // SEARCH
  // ================================

  const [search, setSearch] = useState("");

  const searchItems = [
    { name: "Dashboard", path: "/" },
    { name: "Brokers", path: "/brokers" },
    { name: "Customers", path: "/customers" },
    { name: "Leads", path: "/leads" },
    { name: "Projects", path: "/projects" },
    { name: "Properties", path: "/properties" },
    { name: "Employees", path: "/employees" },
    { name: "Payments", path: "/payments" },
    { name: "Follow-ups & Tasks", path: "/followups" },
    { name: "Documents", path: "/documents" },
    { name: "Reports & Analytics", path: "/reports" },
    { name: "Users & Roles", path: "/users-roles" },
  ];

  const filteredSearch = search
    ? searchItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSearchClick = (path) => {
    setSearch("");
    navigate(path);
  };

  // ================================
  // FETCH NOTIFICATIONS
  // ================================

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/all`
      );

      console.log("NOTIFICATIONS FROM API:", response.data);

      setNotifications(response.data);
    } catch (error) {
      console.error("Notification fetch error:", error);
    }
  };

  // ================================
  // LOGOUT
  // ================================

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setShowProfileMenu(false);
    navigate("/login");
  };

  // ================================
  // MARK ALL NOTIFICATIONS READ
  // ================================

  const handleMarkAllRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notification) => Number(notification.is_read) === 0
      );

      await Promise.all(
        unreadNotifications.map((notification) =>
          axios.put(
            `${API_BASE_URL}/notifications/read/${notification.id}`
          )
        )
      );

      fetchNotifications();
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  // ================================
  // MARK SINGLE NOTIFICATION READ
  // ================================

  const handleNotificationClick = async (notification) => {
    if (Number(notification.is_read) === 0) {
      try {
        await axios.put(
          `${API_BASE_URL}/notifications/read/${notification.id}`
        );

        fetchNotifications();
      } catch (error) {
        console.error("Notification read error:", error);
      }
    }
  };

  // ================================
  // DESKTOP SIDEBAR TOGGLE
  // ================================

  const handleDesktopSidebarToggle = (e) => {
    document.body.classList.toggle("sidebar-minimized");

    const icon = e.currentTarget.querySelector("i");

    if (icon) {
      if (
        document.body.classList.contains("sidebar-minimized")
      ) {
        icon.className = "bi bi-chevron-bar-right";
      } else {
        icon.className = "bi bi-chevron-bar-left";
      }
    }

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };

  // ================================
  // MOBILE SIDEBAR TOGGLE
  // ================================

  const handleMobileSidebarToggle = () => {
    document.body.classList.toggle("sidebar-open");
  };

  // ================================
  // FULLSCREEN
  // ================================

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log("Fullscreen Error:", error);
    }
  };

  // ================================
  // RETURN
  // ================================

  return (
    <header className="navbar-custom">

      {/* ================================================= */}
      {/* LEFT SIDE */}
      {/* ================================================= */}

      <div className="navbar-left">

        {/* Desktop Sidebar Toggle */}

        <button
          className="btn-desktop-toggle d-none d-xl-flex align-items-center justify-content-center me-3"
          id="desktop-sidebar-toggle"
          aria-label="Minimize Sidebar"
          type="button"
          onClick={handleDesktopSidebarToggle}
        >
          <i className="bi bi-chevron-bar-left"></i>
        </button>

        {/* Mobile Sidebar Toggle */}

        <button
          className="sidebar-toggle-btn me-2"
          id="sidebar-toggle"
          aria-label="Toggle Navigation"
          type="button"
          onClick={handleMobileSidebarToggle}
        >
          <i className="bi bi-list"></i>
        </button>

        {/* Quick Actions */}

        <div className="dropdown ms-2">

          <button
            className={`btn-quick-action dropdown-toggle${showQuickActions ? " show" : ""}`}
            type="button"
            aria-haspopup="true"
            aria-expanded={showQuickActions}
            id="quick-actions-dropdown"
            onClick={() => setShowQuickActions((visible) => !visible)}
          >
            <i className="bi bi-plus-lg"></i>

            <span>Create</span>
          </button>

          <ul
            className={`dropdown-menu dropdown-menu-quick-action${showQuickActions ? " show" : ""}`}
            aria-labelledby="quick-actions-dropdown"
            onClick={() => setShowQuickActions(false)}
          >

            <li className="dropdown-header">
              Quick Actions
            </li>

            <li>
              <NavLink
                className="dropdown-item"
                to="/leads"
              >
                <i className="bi bi-person-plus"></i>
                New Lead
              </NavLink>
            </li>

            <li>
              <NavLink
                className="dropdown-item"
                to="/customers"
              >
                <i className="bi bi-person-plus"></i>
                New Client
              </NavLink>
            </li>

            <li>
              <NavLink
                className="dropdown-item"
                to="/projects"
              >
                <i className="bi bi-building-add"></i>
                New Project
              </NavLink>
            </li>

          </ul>
        </div>
      </div>

      {/* ================================================= */}
      {/* SEARCH */}
      {/* ================================================= */}

      <div
        className="navbar-search-wrapper"
        style={{ position: "relative" }}
      >

        <input
          type="text"
          className="navbar-search-input"
          placeholder="Search anything "
          id="main-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="navbar-search-btn"
          aria-label="Search"
          type="button"
        >
          <i className="bi bi-search"></i>
        </button>

        {/* Search Results */}

        {search && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              width: "100%",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.10)",
              zIndex: 9999,
              overflow: "hidden",
            }}
          >

            {filteredSearch.length > 0 ? (

              filteredSearch.map((item) => (

                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleSearchClick(item.path)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "11px 14px",
                    border: "none",
                    background: "#ffffff",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#343a40",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f4f7f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ffffff";
                  }}
                >
                  <i className="bi bi-search"></i>

                  <span>{item.name}</span>
                </button>

              ))

            ) : (

              <div
                style={{
                  padding: "14px",
                  textAlign: "center",
                  color: "#8a8f98",
                  fontSize: "13px",
                }}
              >
                No matching page found
              </div>

            )}

          </div>
        )}

      </div>

      {/* ================================================= */}
      {/* RIGHT ACTIONS */}
      {/* ================================================= */}

      <div className="navbar-actions">

        {/* ================================================= */}
        {/* FULLSCREEN */}
        {/* ================================================= */}

        <button
          className="navbar-action-btn me-1"
          aria-label="Toggle Fullscreen"
          id="btn-fullscreen"
          type="button"
          onClick={handleFullscreen}
        >
          <i
            className={
              isFullscreen
                ? "bi bi-fullscreen-exit"
                : "bi bi-arrows-fullscreen"
            }
          ></i>
        </button>

        {/* ================================================= */}
        {/* NOTIFICATIONS */}
        {/* ================================================= */}

        <div
          ref={notificationRef}
          className="dropdown"
          style={{
            position: "relative",
          }}
        >

          <button
            className="navbar-action-btn position-relative"
            type="button"
            id="btn-notifications"
            aria-label="Notifications"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          >
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && (
              <span
                className="badge bg-danger position-absolute rounded-pill"
                style={{
                  top: "-4px",
                  right: "-4px",
                  fontSize: "10px",
                  padding: "3px 6px",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}

          {showNotifications && (

            <div
              className="dropdown-menu dropdown-menu-end dropdown-menu-notification show"
              style={{
                display: "block",
                position: "absolute",
                right: 0,
                top: "calc(100% + 10px)",
                width: "360px",
                maxWidth: "90vw",
                zIndex: 9999,
                padding: 0,
              }}
            >

              {/* Header */}

              <div className="notification-header">

                <h6 className="notification-title">
                  Notifications
                </h6>  

                <button
                  className="btn-clear-all"
                  type="button"
                  onClick={handleMarkAllRead}
                >
                  Mark all read
                </button>

              </div>

              {/* Notification List */}

              <div className="notification-list">

                {notifications.length === 0 ? (

                  <div className="text-center p-4 text-muted">

                    <i
                      className="bi bi-bell-slash"
                      style={{ fontSize: "25px" }}
                    ></i>

                    <div className="mt-2">
                      No notifications
                    </div>

                  </div>

                ) : (

                  notifications.map((notification) => (

                    <div
                      key={notification.id}
                      className={`notification-item ${
                        Number(notification.is_read) === 0
                          ? "notification-unread"
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                      style={{
                        cursor: "pointer",
                      }}
                    >

                      {/* Icon */}

                      <div
                        className={`notification-icon text-white ${
                          notification.type === "payment"
                            ? "bg-success"
                            : notification.type === "lead"
                            ? "bg-primary"
                            : notification.type === "customer"
                            ? "bg-info"
                            : notification.type === "project"
                            ? "bg-warning text-dark"
                            : notification.type === "followup"
                            ? "bg-danger"
                            : notification.type === "task"
                            ? "bg-secondary"
                            : "bg-secondary"
                        }`}
                      >

                        <i
                          className={
                            notification.type === "payment"
                              ? "bi bi-wallet2"
                              : notification.type === "lead"
                              ? "bi bi-person-plus-fill"
                              : notification.type === "customer"
                              ? "bi bi-person-fill-add"
                              : notification.type === "project"
                              ? "bi bi-building"
                              : notification.type === "followup"
                              ? "bi bi-clock-history"
                              : notification.type === "task"
                              ? "bi bi-check2-square"
                              : "bi bi-bell"
                          }
                        ></i>

                      </div>

                      {/* Content */}

                      <div className="notification-content">

                        <p className="notification-text">
                          {notification.title}
                        </p>

                        <span className="notification-time">
                          {notification.message}
                        </span>

                        <small className="text-muted">
                          {new Date(
                            notification.created_at
                          ).toLocaleString()}
                        </small>

                      </div>

                      {/* Unread Dot */}

                      {Number(
                        notification.is_read
                      ) === 0 && (
                        <span className="notification-unread-dot"></span>
                      )}

                    </div>

                  ))

                )}

              </div>

              {/* Footer */}

              <div
                className="notification-footer text-center py-2 text-primary fw-semibold"
                style={{
                  cursor: "pointer",
                  borderTop: "1px solid #f1f5f9",
                  background: "#f8fafc",
                  transition: "background 0.2s"
                }}
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/notifications");
                }}
              >
                View All Notifications <i className="bi bi-arrow-right ms-1"></i>
              </div>

            </div>

          )}

        </div>

      
{/* PROFILE / LOGIN */}

<div className="dropdown ms-2">

  {user ? (
    <>
      <button
        className={`navbar-profile-btn dropdown-toggle${showProfileMenu ? " show" : ""}`}
        type="button"
        aria-haspopup="true"
        aria-expanded={showProfileMenu}
        id="profile-dropdown"
        onClick={() => setShowProfileMenu((visible) => !visible)}
      >
        <div className="navbar-profile-icon">
          <i className="bi bi-person-circle"></i>
        </div>

        <span className="navbar-profile-name d-none d-md-inline">
          {user.name || "User"}
        </span>

        <i className="bi bi-chevron-down navbar-profile-caret"></i>
      </button>

      <ul
        className={`dropdown-menu dropdown-menu-end dropdown-menu-profile${showProfileMenu ? " show" : ""}`}
        aria-labelledby="profile-dropdown"
        style={{ minWidth: "250px" }}
      >
        <li className="px-3 py-3">
          <div className="d-flex align-items-center gap-2 mb-2">
            <div className="navbar-profile-icon">
              <i className="bi bi-person-circle"></i>
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                className="fw-semibold text-dark text-truncate"
                style={{ maxWidth: "190px" }}
              >
                {user.name || "User"}
              </div>

              <small className="text-muted">
                {user.email || "Email not available"}
              </small>
            </div>
          </div>

          <div className="mt-2">
            <span className="text-muted small">Your Role</span>
            <div className="mt-1">
              <span className="badge bg-success">
                {user.role
                  ? user.role
                      .replace(/[_-]/g, " ")
                      .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )
                  : "Role not assigned"}
              </span>
            </div>
          </div>
        </li>

        <li>
          <hr className="dropdown-divider my-1" />
        </li>


        <li>
          <button
            className="dropdown-item text-danger"
            type="button"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </button>
        </li>
      </ul>
    </>
  ) : (
    <NavLink
    className="navbar-login-btn"
      to="/login"
    >
      <i className="bi bi-box-arrow-in-right"></i>
      Login
    </NavLink>
  )}

</div>


      </div>

    </header>
  );
}

export default Navbar;
