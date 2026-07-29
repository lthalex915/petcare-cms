import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  IconDashboard,
  IconPaw,
  IconClipboard,
  IconReport,
  IconChart,
  IconSettings,
  IconHospital
} from "../icons";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <IconDashboard size={18} /> },
  { to: "/pets", label: "Patients", icon: <IconPaw size={18} /> },
  { to: "/daily-logs", label: "Daily Logs", icon: <IconClipboard size={18} /> },
  { to: "/reports", label: "Reports", icon: <IconReport size={18} /> },
  { to: "/analytics", label: "Analytics", icon: <IconChart size={18} /> },
  { to: "/settings", label: "Settings", icon: <IconSettings size={18} /> }
];

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 240,
          background: "#000",
          color: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #333" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconHospital size={28} color="#fff" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>PetCare CMS</div>
              <div style={{ fontSize: 10, color: "#999" }}>Clinical Management System</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "10px 20px",
                color: isActive ? "#fff" : "#999",
                borderLeft: `3px solid ${isActive ? "#fff" : "transparent"}`,
                background: isActive ? "#1a1a1a" : "transparent",
                fontSize: 13
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #333" }}>
          <div style={{ fontSize: 12, color: "#999" }}>{user?.displayName ?? "Unknown User"}</div>
          <div style={{ fontSize: 11, color: "#666" }}>{user?.role ?? "STAFF"}</div>
        </div>
      </aside>

      <main style={{ marginLeft: 240, flex: 1, padding: 32 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
