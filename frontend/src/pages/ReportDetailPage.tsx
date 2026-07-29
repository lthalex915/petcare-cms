import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReportPreview from "../components/reports/ReportPreview";
import { IconPdf } from "../components/icons";
import api from "../services/api";
import type { Report } from "../types";
import { exportReportToPDF } from "../utils/pdfExport";

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    api.get<Report>(`/reports/${id}`).then((res) => setReport(res.data)).catch(() => setReport(null));
  }, [id]);

  if (!report) {
    return <div className="page-card">Report not found.</div>;
  }

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{report.title}</div>
          <div style={{ color: "#666", marginTop: 4 }}>
            {report.type} | {new Date(report.periodStart).toISOString().slice(0, 10)} - {new Date(report.periodEnd).toISOString().slice(0, 10)}
          </div>
        </div>
        <button
          onClick={() => exportReportToPDF("report-wrapper", `${report.title}.pdf`)}
          style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 12px" }}
        >
          <IconPdf size={16} color="#fff" />
          Export PDF
        </button>
      </div>

      <div id="report-wrapper">
        <ReportPreview html={report.htmlContent} />
      </div>
    </div>
  );
}
