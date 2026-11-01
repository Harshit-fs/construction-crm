
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Sidebar from "./Component/Sidebar";
import Navbar from "./Component/Navbar";
import ProtectedRoute from "./Component/ProtectedRoute";

import Dashboard from "./Pages/Dashboard";
import Customers from "./Pages/Customers";
import Projects from "./Pages/Projects";
import Employees from "./Pages/Employees";
import Payments from "./Pages/Payments";
import Reports from "./Pages/Reports";
import Leads from "./Pages/Leads";
import Brokers from "./Pages/Brokers";
import Properties from "./Pages/Properties";
import UsersRoles from "./Pages/UsersRoles";
import Login from "./Pages/Login";
import ProjectStatisticsChart from "./Component/ProjectStatisticsChart";
import Documents from "./Pages/Documents";
import FollowUps from "./Pages/FollowUps";
import Inventory from "./Pages/Inventory";
import Notifications from "./Pages/Notifications";

function MainLayout() {
  return (
    <div className="app-wrapper">
      <Sidebar />
      <button
        className="mobile-sidebar-backdrop"
        type="button"
        aria-label="Close navigation menu"
        onClick={() => document.body.classList.remove("sidebar-open")}
      />

      <div className="main-wrapper">
        <Navbar />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected CRM routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/brokers" element={<Brokers />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/users-roles" element={<UsersRoles />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route
            path="/project-statistics-chart"
            element={<ProjectStatisticsChart />}
          />
        </Route>
      </Route>

      {/* Unknown URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
