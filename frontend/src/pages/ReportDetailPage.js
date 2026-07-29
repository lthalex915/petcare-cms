import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReportPreview from "../components/reports/ReportPreview";
import { IconPdf } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { exportReportToPDF } from "../utils/pdfExport";
export default function ReportDetailPage() {
    const { adminMode } = useAuth();
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [editing, setEditing] = useState(false);
    const [draftTitle, setDraftTitle] = useState("");
    const [draftHtml, setDraftHtml] = useState("");
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (!id) {
            return;
        }
        api.get(`/reports/${id}`).then((res) => {
            setReport(res.data);
            setDraftTitle(res.data.title);
            setDraftHtml(res.data.htmlContent);
        }).catch(() => setReport(null));
    }, [id]);
    async function saveReportChanges() {
        if (!id) {
            return;
        }
        setSaving(true);
        try {
            const response = await api.put(`/reports/${id}`, {
                title: draftTitle,
                htmlContent: draftHtml
            });
            setReport(response.data);
            setEditing(false);
        }
        finally {
            setSaving(false);
        }
    }
    if (!report) {
        return _jsx("div", { className: "page-card", children: "Report not found." });
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-card", style: { marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: editing ? draftTitle : report.title }), _jsxs("div", { style: { color: "#666", marginTop: 4 }, children: [report.type, " | ", new Date(report.periodStart).toISOString().slice(0, 10), " - ", new Date(report.periodEnd).toISOString().slice(0, 10)] })] }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [adminMode && !editing && (_jsx("button", { onClick: () => setEditing(true), style: { border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 12px" }, children: "Edit" })), adminMode && editing && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => {
                                            setDraftTitle(report.title);
                                            setDraftHtml(report.htmlContent);
                                            setEditing(false);
                                        }, style: { border: "1px solid #666", background: "#fff", color: "#333", padding: "8px 12px" }, children: "Cancel" }), _jsx("button", { disabled: saving, onClick: saveReportChanges, style: { border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 12px", opacity: saving ? 0.6 : 1 }, children: saving ? "Saving..." : "Save" })] })), _jsxs("button", { onClick: () => exportReportToPDF("report-paper", `${report.title}.pdf`), style: { display: "flex", alignItems: "center", gap: 8, border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 12px" }, children: [_jsx(IconPdf, { size: 16, color: "#fff" }), "Export PDF"] })] })] }), editing && (_jsx("div", { className: "page-card", style: { marginBottom: 12 }, children: _jsxs("div", { style: { display: "grid", gap: 8 }, children: [_jsx("input", { value: draftTitle, onChange: (e) => setDraftTitle(e.target.value), placeholder: "Report title" }), _jsx("textarea", { value: draftHtml, onChange: (e) => setDraftHtml(e.target.value), rows: 12, style: { width: "100%", fontFamily: "monospace" } })] }) })), _jsx("div", { id: "report-wrapper", style: { background: "#ececec", padding: "16px 10px", borderRadius: 6 }, children: _jsx(ReportPreview, { html: editing ? draftHtml : report.htmlContent }) })] }));
}
