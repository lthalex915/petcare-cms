import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
export default function DailyLogListPage() {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        api.get("/daily-logs").then((res) => setLogs(res.data)).catch(() => setLogs([]));
    }, []);
    return (_jsxs("div", { className: "page-card", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [_jsx("h1", { style: { margin: 0, fontSize: 20 }, children: "Daily Logs" }), _jsx(Link, { to: "/daily-logs/new", style: { padding: "8px 12px", background: "#000", color: "#fff" }, children: "New Log" })] }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Summary" }), _jsx("th", { children: "Updated" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: logs.map((log) => {
                            const date = new Date(log.date).toISOString().slice(0, 10);
                            return (_jsxs("tr", { children: [_jsx("td", { children: date }), _jsx("td", { children: log.summary || "No summary" }), _jsx("td", { children: new Date(log.updatedAt).toLocaleString() }), _jsx("td", { children: _jsx(Link, { to: `/daily-logs/${date}`, children: "View" }) })] }, log.id));
                        }) })] })] }));
}
