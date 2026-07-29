import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReportPreview from "../components/reports/ReportPreview";
import { IconPdf } from "../components/icons";
import api from "../services/api";
import { exportReportToPDF } from "../utils/pdfExport";
export default function ReportDetailPage() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    useEffect(() => {
        if (!id) {
            return;
        }
        api.get(`/reports/${id}`).then((res) => setReport(res.data)).catch(() => setReport(null));
    }, [id]);
    if (!report) {
        return _jsx("div", { className: "page-card", children: "Report not found." });
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: "page-card", style: { marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: report.title }), _jsxs("div", { style: { color: "#666", marginTop: 4 }, children: [report.type, " | ", new Date(report.periodStart).toISOString().slice(0, 10), " - ", new Date(report.periodEnd).toISOString().slice(0, 10)] })] }), _jsxs("button", { onClick: () => exportReportToPDF("report-wrapper", `${report.title}.pdf`), style: { display: "flex", alignItems: "center", gap: 8, border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 12px" }, children: [_jsx(IconPdf, { size: 16, color: "#fff" }), "Export PDF"] })] }), _jsx("div", { id: "report-wrapper", children: _jsx(ReportPreview, { html: report.htmlContent }) })] }));
}
