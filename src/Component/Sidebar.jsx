import { NavLink } from "react-router-dom";

function Sidebar() {
  const user = (() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })();

  const permissions = Array.isArray(user?.permissions)
    ? user.permissions
    : [];

  const isSuperAdmin = user?.role === "Super Admin";

  const hasPermission = (permission) =>
    isSuperAdmin || permissions.includes(permission);

  const menuSections = [
    {
      title: "Menu",
      items: [
        {
          label: "Dashboard",
          path: "/",
          permission: "Dashboard",
          icon: "bi-grid-fill",
          end: true,
        },
      ],
    },
    {
      title: "CRM",
      items: [
        {
          label: "Leads",
          path: "/leads",
          permission: "Leads",
          icon: "bi-person-lines-fill",
        },
        {
          label: "Customers",
          path: "/customers",
          permission: "Customers",
          icon: "bi-people-fill",
        },
        {
          label: "Brokers",
          path: "/brokers",
          permission: "Brokers",
          icon: "bi-person-vcard-fill",
        },
        {
          label: "Employees",
          path: "/employees",
          permission: "Employees",
          icon: "bi-person-badge-fill",
        },
        {
          label: "Projects",
          path: "/projects",
          permission: "Projects",
          icon: "bi-building",
        },
        {
          label: "Properties / Units",
          path: "/properties",
          permission: "Properties",
          icon: "bi-house-door-fill",
        },
        {
          label: "Inventory",
          path: "/inventory",
          permission: "Inventory",
          icon: "bi-box-seam",
        },
        {
          label: "Payments",
          path: "/payments",
          permission: "Payments",
          icon: "bi-cash-stack",
        },
        {
          label: "Documents",
          path: "/documents",
          permission: "Documents",
          icon: "bi-file-earmark-text",
        },
        {
          label: "Follow-Ups",
          path: "/follow-ups",
          permission: "Follow-ups & Tasks",
          icon: "bi-clock-history",
        },
        {
          label: "Reports",
          path: "/reports",
          permission: "Reports & Analytics",
          icon: "bi-bar-chart-fill",
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          label: "Users & Roles",
          path: "/users-roles",
          permission: "Users & Roles",
          icon: "bi-shield-lock-fill",
        },
      ],
    },
  ];

  return (
    <div className="sidebar-wrapper" id="sidebar">
      <NavLink to="/" className="sidebar-brand">
        <i className="bi bi-asterisk"></i>
        <span>Construction CRM</span>
      </NavLink>

      <div className="flex-grow-1 overflow-y-auto">
        {menuSections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            hasPermission(item.permission)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div className="sidebar-menu-section" key={section.title}>
              <div className="sidebar-menu-title">{section.title}</div>

              <ul className="sidebar-menu-list">
                {visibleItems.map((item) => (
                  <li className="sidebar-menu-item" key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.end || false}
                      onClick={() => document.body.classList.remove("sidebar-open")}
                      className={({ isActive }) =>
                        `sidebar-menu-link ${isActive ? "active" : ""}`
                      }
                    >
                      <i className={`bi ${item.icon}`}></i>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-profile-icon">
          <i className="bi bi-person-fill"></i>
        </div>

        <div className="sidebar-profile-info">
          <div className="sidebar-profile-name">
            {user?.name || "User"}
          </div>

          <div className="sidebar-profile-email">
            {user?.email || "No email"}
          </div>

          <small>{user?.role || "No role"}</small>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
