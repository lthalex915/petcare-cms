import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import type { DailyLog } from "../types";

export default function DailyLogListPage() {
  const { adminMode } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);

  async function loadLogs() {
    const response = await api.get<DailyLog[]>("/daily-logs");
    setLogs(response.data);
  }

  useEffect(() => {
    loadLogs().catch(() => setLogs([]));
  }, []);

  async function removeLog(date: string) {
    await api.delete(`/daily-logs/${date}`);
    await loadLogs();
  }

  return (
    <div className="page-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Daily Logs</h1>
        <Link to="/daily-logs/new" style={{ padding: "8px 12px", background: "#000", color: "#fff" }}>New Log</Link>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Summary</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const date = new Date(log.date).toISOString().slice(0, 10);
            return (
              <tr key={log.id}>
                <td>{date}</td>
                <td>{log.summary || "No summary"}</td>
                <td>{new Date(log.updatedAt).toLocaleString()}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <Link to={`/daily-logs/${date}`}>View</Link>
                  {adminMode && (
                    <button
                      onClick={() => removeLog(date)}
                      style={{ border: "1px solid #a31616", background: "#fff", color: "#a31616", padding: "2px 8px" }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
