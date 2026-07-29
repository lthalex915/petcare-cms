import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
export default function DailyLogListPage() {
    const { adminMode } = useAuth();
    const [logs, setLogs] = useState([]);
    async function loadLogs() {
        const response = await api.get("/daily-logs");
        setLogs(response.data);
    }
    useEffect(() => {
        loadLogs().catch(() => setLogs([]));
    }, []);
    async function removeLog(date) {
        await api.delete(`/daily-logs/${date}`);
        await loadLogs();
    }
    return (_jsxs("div", { className: "page-card", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [_jsx("h1", { style: { margin: 0, fontSize: 20 }, children: "Daily Logs" }), _jsx(Link, { to: "/daily-logs/new", style: { padding: "8px 12px", background: "#000", color: "#fff" }, children: "New Log" })] }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Summary" }), _jsx("th", { children: "Updated" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: logs.map((log) => {
                            const date = new Date(log.date).toISOString().slice(0, 10);
                            return (_jsxs("tr", { children: [_jsx("td", { children: date }), _jsx("td", { children: log.summary || "No summary" }), _jsx("td", { children: new Date(log.updatedAt).toLocaleString() }), _jsxs("td", { style: { display: "flex", gap: 8 }, children: [_jsx(Link, { to: `/daily-logs/${date}`, children: "View" }), adminMode && (_jsx("button", { onClick: () => removeLog(date), style: { border: "1px solid #a31616", background: "#fff", color: "#a31616", padding: "2px 8px" }, children: "Delete" }))] })] }, log.id));
                        }) })] })] }));
}
