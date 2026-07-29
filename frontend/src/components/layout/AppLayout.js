import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IconDashboard, IconPaw, IconClipboard, IconReport, IconChart, IconDatabase, IconSettings, IconHospital } from "../icons";
const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: _jsx(IconDashboard, { size: 18 }) },
    { to: "/pets", label: "Pets", icon: _jsx(IconPaw, { size: 18 }) },
    { to: "/daily-logs", label: "Daily Logs", icon: _jsx(IconClipboard, { size: 18 }) },
    { to: "/reports", label: "Reports", icon: _jsx(IconReport, { size: 18 }) },
    { to: "/analytics", label: "Analytics", icon: _jsx(IconChart, { size: 18 }) },
    { to: "/dbms", label: "DBMS", icon: _jsx(IconDatabase, { size: 18 }) },
    { to: "/settings", label: "Settings", icon: _jsx(IconSettings, { size: 18 }) }
];
export default function AppLayout() {
    const { user } = useAuth();
    return (_jsxs("div", { style: { display: "flex", minHeight: "100vh" }, children: [_jsxs("aside", { style: {
                    width: 240,
                    background: "#000",
                    color: "#fff",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column"
                }, children: [_jsx("div", { style: { padding: "20px 16px", borderBottom: "1px solid #333" }, children: _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [_jsx(IconHospital, { size: 28, color: "#fff" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: 14, fontWeight: 700 }, children: "PetCare CMS" }), _jsx("div", { style: { fontSize: 10, color: "#999" }, children: "Clinical Management System" })] })] }) }), _jsx("nav", { style: { flex: 1, padding: "12px 0" }, children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, style: ({ isActive }) => ({
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                width: "100%",
                                padding: "10px 20px",
                                color: isActive ? "#fff" : "#999",
                                borderLeft: `3px solid ${isActive ? "#fff" : "transparent"}`,
                                background: isActive ? "#1a1a1a" : "transparent",
                                fontSize: 13
                            }), children: [item.icon, item.label] }, item.to))) }), _jsxs("div", { style: { padding: "16px 20px", borderTop: "1px solid #333" }, children: [_jsx("div", { style: { fontSize: 12, color: "#999" }, children: user?.displayName ?? "Unknown User" }), _jsx("div", { style: { fontSize: 11, color: "#666" }, children: user?.role ?? "STAFF" })] })] }), _jsx("main", { style: { marginLeft: 240, flex: 1, padding: 32 }, children: _jsx("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: _jsx(Outlet, {}) }) })] }));
}
