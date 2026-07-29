import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
function asArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (Array.isArray(value?.data)) {
        return value.data;
    }
    if (Array.isArray(value?.items)) {
        return value.items;
    }
    return [];
}
export default function ReportListPage() {
    const [reports, setReports] = useState([]);
    useEffect(() => {
        api.get("/reports").then((res) => setReports(asArray(res.data))).catch(() => setReports([]));
    }, []);
    async function generate(type) {
        await api.post("/reports/generate", { type });
        const refreshed = await api.get("/reports");
        setReports(asArray(refreshed.data));
    }
    return (_jsxs("div", { className: "page-card", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [_jsx("h1", { style: { margin: 0, fontSize: 20 }, children: "Reports" }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { onClick: () => generate("DAILY"), style: { border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 10px" }, children: "Generate Daily" }), _jsx("button", { onClick: () => generate("WEEKLY"), style: { border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 10px" }, children: "Generate Weekly" }), _jsx("button", { onClick: () => generate("MONTHLY"), style: { border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 10px" }, children: "Generate Monthly" })] })] }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Title" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Period" }), _jsx("th", { children: "Created" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: reports.map((report) => (_jsxs("tr", { children: [_jsx("td", { children: report.title }), _jsx("td", { children: report.type }), _jsxs("td", { children: [new Date(report.periodStart).toISOString().slice(0, 10), " - ", new Date(report.periodEnd).toISOString().slice(0, 10)] }), _jsx("td", { children: new Date(report.createdAt).toLocaleString() }), _jsx("td", { children: _jsx(Link, { to: `/reports/${report.id}`, children: "Preview" }) })] }, report.id))) })] })] }));
}
