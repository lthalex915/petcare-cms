import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
export default function QuickActions() {
    const buttonStyle = {
        display: "block",
        width: "100%",
        padding: "10px 16px",
        marginBottom: 8,
        fontSize: 13,
        textAlign: "center"
    };
    return (_jsxs("div", { className: "section-card", children: [_jsx("div", { style: { fontSize: 14, fontWeight: 700, marginBottom: 12 }, children: "Quick Actions" }), _jsx(Link, { to: "/daily-logs/new", style: { ...buttonStyle, background: "#000", color: "#fff", border: "none" }, children: "New Daily Log" }), _jsx(Link, { to: "/reports", style: { ...buttonStyle, background: "#fff", color: "#000", border: "1px solid #000" }, children: "View Reports" }), _jsx(Link, { to: "/analytics", style: { ...buttonStyle, background: "#fff", color: "#000", border: "1px solid #000" }, children: "Open Analytics" }), _jsx(Link, { to: "/settings", style: { ...buttonStyle, background: "#fff", color: "#000", border: "1px solid #000", marginBottom: 0 }, children: "Configure LLM" })] }));
}
