import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReportPreview from "../components/reports/ReportPreview";
import { IconPdf } from "../components/icons";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import type { Report } from "../types";
import { exportReportToPDF } from "../utils/pdfExport";

export default function ReportDetailPage() {
  const { adminMode } = useAuth();
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftHtml, setDraftHtml] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    api.get<Report>(`/reports/${id}`).then((res) => {
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
      const response = await api.put<Report>(`/reports/${id}`, {
        title: draftTitle,
        htmlContent: draftHtml
      });
      setReport(response.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!report) {
    return <div className="page-card">Report not found.</div>;
  }

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{editing ? draftTitle : report.title}</div>
          <div style={{ color: "#666", marginTop: 4 }}>
            {report.type} | {new Date(report.periodStart).toISOString().slice(0, 10)} - {new Date(report.periodEnd).toISOString().slice(0, 10)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {adminMode && !editing && (
            <button
              onClick={() => setEditing(true)}
              style={{ border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 12px" }}
            >
              Edit
            </button>
          )}
          {adminMode && editing && (
            <>
              <button
                onClick={() => {
                  setDraftTitle(report.title);
                  setDraftHtml(report.htmlContent);
                  setEditing(false);
                }}
                style={{ border: "1px solid #666", background: "#fff", color: "#333", padding: "8px 12px" }}
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={saveReportChanges}
                style={{ border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 12px", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
          <button
            onClick={() => exportReportToPDF("report-paper", `${report.title}.pdf`)}
            style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 12px" }}
          >
            <IconPdf size={16} color="#fff" />
            Export PDF
          </button>
        </div>
      </div>

      {editing && (
        <div className="page-card" style={{ marginBottom: 12 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Report title" />
            <textarea
              value={draftHtml}
              onChange={(e) => setDraftHtml(e.target.value)}
              rows={12}
              style={{ width: "100%", fontFamily: "monospace" }}
            />
          </div>
        </div>
      )}

      <div id="report-wrapper" style={{ background: "#ececec", padding: "16px 10px", borderRadius: 6 }}>
        <ReportPreview html={editing ? draftHtml : report.htmlContent} />
      </div>
    </div>
  );
}
