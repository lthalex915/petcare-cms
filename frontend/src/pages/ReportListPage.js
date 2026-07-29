import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
export default function ReportListPage() {
    const { adminMode } = useAuth();
    const [reports, setReports] = useState([]);
    const [generatingType, setGeneratingType] = useState(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("");
    const [errorText, setErrorText] = useState("");
    useEffect(() => {
        api.get("/reports").then((res) => setReports(res.data)).catch(() => setReports([]));
    }, []);
    function statusByProgress(value) {
        if (value < 20) {
            return "Collecting records from daily logs...";
        }
        if (value < 45) {
            return "Aggregating pet health and activity data...";
        }
        if (value < 70) {
            return "Generating structured report content...";
        }
        if (value < 95) {
            return "Finalizing report layout...";
        }
        return "Report is ready.";
    }
    async function generate(type) {
        setGeneratingType(type);
        setProgress(5);
        setStatusText("Starting report generation...");
        setErrorText("");
        let value = 5;
        let hadError = false;
        const timer = window.setInterval(() => {
            value = Math.min(92, value + Math.floor(Math.random() * 9) + 2);
            setProgress(value);
            setStatusText(statusByProgress(value));
        }, 700);
        try {
            await api.post("/reports/generate", { type });
            window.clearInterval(timer);
            setProgress(100);
            setStatusText("Report is ready.");
            const refreshed = await api.get("/reports");
            setReports(refreshed.data);
            window.setTimeout(() => {
                setGeneratingType(null);
            }, 1000);
        }
        catch (error) {
            hadError = true;
            window.clearInterval(timer);
            setProgress(0);
            setStatusText("");
            setErrorText(typeof error === "object" && error !== null && "response" in error
                ? `Failed to generate report (HTTP ${String(error.response?.status ?? "unknown")})`
                : "Failed to generate report");
        }
        finally {
            if (hadError) {
                setGeneratingType(null);
            }
        }
    }
    async function removeReport(id) {
        await api.delete(`/reports/${id}`);
        const refreshed = await api.get("/reports");
        setReports(refreshed.data);
    }
    return (_jsxs("div", { className: "page-card", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [_jsx("h1", { style: { margin: 0, fontSize: 20 }, children: "Reports" }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { disabled: Boolean(generatingType), onClick: () => generate("DAILY"), style: { border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 10px", opacity: generatingType ? 0.5 : 1 }, children: "Generate Daily" }), _jsx("button", { disabled: Boolean(generatingType), onClick: () => generate("WEEKLY"), style: { border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 10px", opacity: generatingType ? 0.5 : 1 }, children: "Generate Weekly" }), _jsx("button", { disabled: Boolean(generatingType), onClick: () => generate("MONTHLY"), style: { border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 10px", opacity: generatingType ? 0.5 : 1 }, children: "Generate Monthly" })] })] }), generatingType && (_jsxs("div", { style: { marginBottom: 12, border: "1px solid #ddd", background: "#fafafa", padding: 12 }, children: [_jsxs("div", { style: { fontSize: 12, marginBottom: 6, fontWeight: 700 }, children: ["Generating ", generatingType.toLowerCase(), " report (", progress, "%)"] }), _jsx("div", { style: { width: "100%", height: 10, background: "#e5e5e5", borderRadius: 999 }, children: _jsx("div", { style: { width: `${progress}%`, height: "100%", background: "#000", borderRadius: 999, transition: "width 0.5s ease" } }) }), _jsx("div", { style: { marginTop: 8, color: "#444" }, children: statusText })] })), errorText && _jsx("div", { style: { marginBottom: 12, color: "#a31616", fontWeight: 700 }, children: errorText }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Title" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Period" }), _jsx("th", { children: "Created" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: reports.map((report) => (_jsxs("tr", { children: [_jsx("td", { children: report.title }), _jsx("td", { children: report.type }), _jsxs("td", { children: [new Date(report.periodStart).toISOString().slice(0, 10), " - ", new Date(report.periodEnd).toISOString().slice(0, 10)] }), _jsx("td", { children: new Date(report.createdAt).toLocaleString() }), _jsxs("td", { style: { display: "flex", gap: 8 }, children: [_jsx(Link, { to: `/reports/${report.id}`, children: "Preview" }), adminMode && (_jsx("button", { onClick: () => removeReport(report.id), style: { border: "1px solid #a31616", background: "#fff", color: "#a31616", padding: "2px 8px" }, children: "Delete" }))] })] }, report.id))) })] })] }));
}
