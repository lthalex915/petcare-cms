import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import type { Report } from "../types";

export default function ReportListPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    api.get<Report[]>("/reports").then((res) => setReports(res.data)).catch(() => setReports([]));
  }, []);

  async function generate(type: "DAILY" | "WEEKLY" | "MONTHLY") {
    await api.post("/reports/generate", { type });
    const refreshed = await api.get<Report[]>("/reports");
    setReports(refreshed.data);
  }

  return (
    <div className="page-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Reports</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => generate("DAILY")} style={{ border: "1px solid #000", background: "#000", color: "#fff", padding: "8px 10px" }}>Generate Daily</button>
          <button onClick={() => generate("WEEKLY")} style={{ border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 10px" }}>Generate Weekly</button>
          <button onClick={() => generate("MONTHLY")} style={{ border: "1px solid #000", background: "#fff", color: "#000", padding: "8px 10px" }}>Generate Monthly</button>
        </div>
      </div>
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
              <td><Link to={`/reports/${report.id}`}>Preview</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
