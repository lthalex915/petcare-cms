import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import type { Report } from "../types";

export default function ReportListPage() {
  const { adminMode } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [generatingType, setGeneratingType] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    api.get<Report[]>("/reports").then((res) => setReports(res.data)).catch(() => setReports([]));
  }, []);

  function statusByProgress(value: number): string {
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

  async function generate(type: "DAILY" | "WEEKLY" | "MONTHLY") {
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
      const refreshed = await api.get<Report[]>("/reports");
      setReports(refreshed.data);
      window.setTimeout(() => {
        setGeneratingType(null);
      }, 1000);
    } catch (error) {
      hadError = true;
      window.clearInterval(timer);
      setProgress(0);
      setStatusText("");
      setErrorText(
        typeof error === "object" && error !== null && "response" in error
          ? `Failed to generate report (HTTP ${String((error as { response?: { status?: number } }).response?.status ?? "unknown")})`
          : "Failed to generate report"
      );
    } finally {
      if (hadError) {
        setGeneratingType(null);
      }
    }
  }

  async function removeReport(id: string) {
    await api.delete(`/reports/${id}`);
    const refreshed = await api.get<Report[]>("/reports");
    setReports(refreshed.data);
  }

  return (
    <div className="page-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Reports</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={Boolean(generatingType)} onClick={() => generate("DAILY")} style={{ border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 10px", opacity: generatingType ? 0.5 : 1 }}>Generate Daily</button>
          <button disabled={Boolean(generatingType)} onClick={() => generate("WEEKLY")} style={{ border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 10px", opacity: generatingType ? 0.5 : 1 }}>Generate Weekly</button>
          <button disabled={Boolean(generatingType)} onClick={() => generate("MONTHLY")} style={{ border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 10px", opacity: generatingType ? 0.5 : 1 }}>Generate Monthly</button>
        </div>
      </div>

      {generatingType && (
        <div style={{ marginBottom: 12, border: "1px solid #ddd", background: "#fafafa", padding: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 700 }}>
            Generating {generatingType.toLowerCase()} report ({progress}%)
          </div>
          <div style={{ width: "100%", height: 10, background: "#e5e5e5", borderRadius: 999 }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#000", borderRadius: 999, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ marginTop: 8, color: "#444" }}>{statusText}</div>
        </div>
      )}

      {errorText && <div style={{ marginBottom: 12, color: "#a31616", fontWeight: 700 }}>{errorText}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Period</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              <td>{report.title}</td>
              <td>{report.type}</td>
              <td>{new Date(report.periodStart).toISOString().slice(0, 10)} - {new Date(report.periodEnd).toISOString().slice(0, 10)}</td>
              <td>{new Date(report.createdAt).toLocaleString()}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <Link to={`/reports/${report.id}`}>Preview</Link>
                {adminMode && (
                  <button
                    onClick={() => removeReport(report.id)}
                    style={{ border: "1px solid #a31616", background: "#fff", color: "#a31616", padding: "2px 8px" }}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
