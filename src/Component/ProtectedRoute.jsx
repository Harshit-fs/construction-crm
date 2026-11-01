import API_BASE_URL from "../apiConfig";
    
import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute() {
  const location = useLocation();

  let user = null;
  let token = null;

  try {
    const savedUser = localStorage.getItem("user");
    token = localStorage.getItem("token");
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  const userRole = user?.role;
  const hasStoredPermissions = Array.isArray(user?.permissions) && user.permissions.length > 0;

  const [permissionRefresh, setPermissionRefresh] = useState(() => {
    if (!userRole || userRole === "Super Admin") return "idle";
    return hasStoredPermissions ? "idle" : "loading";
  });
  const [refreshedPermissions, setRefreshedPermissions] = useState(null);

  useEffect(() => {
    if (
      !userRole ||
      userRole === "Super Admin" ||
      permissionRefresh !== "loading"
    ) {
      return undefined;
    }

    let active = true;

    axios
      .get(
        `${API_BASE_URL}/rolepermission/${encodeURIComponent(userRole)}`,
        { timeout: 8000 }
      )
      .then((response) => {
        const permissions = (response.data.permissions || [])
          .filter((item) => Number(item.allowed) === 1)
          .map((item) => item.permission);

        if (!active) return;

        const currentUser = JSON.parse(localStorage.getItem("user") || "null") || {
          role: userRole,
        };
        const updatedUser = { ...currentUser, permissions };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setRefreshedPermissions(permissions);
      })
      .catch(() => {
        if (active) setRefreshedPermissions([]);
      })
      .finally(() => {
        if (active) setPermissionRefresh("complete");
      });

    return () => {
      active = false;
    };
  }, [userRole, permissionRefresh]);

  // Check login
  if (!user || !userRole || !token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Page permission mapping
  const pathPermissions = {
    "/": "Dashboard",
    "/leads": "Leads",
    "/customers": "Customers",
    "/brokers": "Brokers",
    "/employees": "Employees",
    "/projects": "Projects",
    "/properties": "Properties",
    "/inventory": "Inventory",
    "/payments": "Payments",
    "/documents": "Documents",
    "/follow-ups": "Follow-ups & Tasks",
    "/reports": "Reports & Analytics",
    "/users-roles": "Users & Roles",
    "/project-statistics-chart": "Reports & Analytics",
  };

  // Normalize current URL
  const currentPath =
    location.pathname.replace(/\/+$/, "") || "/";

  const requiredPermission = pathPermissions[currentPath];

  const isSuperAdmin = user.role === "Super Admin";

  const permissions = refreshedPermissions ?? (
    Array.isArray(user.permissions) ? user.permissions : []
  );

  // Super Admin can access all pages
  if (isSuperAdmin) {
    return <Outlet />;
  }

  if (permissionRefresh === "loading") {
    return <div className="container py-5 text-center">Loading your access…</div>;
  }

  // Check whether the requested page exists in the permission map
  const hasPermission =
    requiredPermission &&
    permissions.includes(requiredPermission);

  // Allow only pages assigned to the logged-in role
  if (!hasPermission) {
    // Find the first page the user is allowed to access
    const allowedPage = Object.entries(pathPermissions).find(
      ([path, permission]) =>
        permission && permissions.includes(permission)
    );

    // If no permission is assigned, show an access denied message
    if (!allowedPage) {
      return (
        <div className="container py-5 text-center">
          <h3>Access Denied</h3>
          <p>
            Your account does not have permission to access any page.
            Please contact the administrator.
          </p>
        </div>
      );
    }

    // Redirect to the first permitted page
    return <Navigate to={allowedPage[0]} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
