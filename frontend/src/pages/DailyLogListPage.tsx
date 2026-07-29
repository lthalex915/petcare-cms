import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import type { DailyLog } from "../types";

export default function DailyLogListPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    api.get<DailyLog[]>("/daily-logs").then((res) => setLogs(res.data)).catch(() => setLogs([]));
  }, []);

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
                <td><Link to={`/daily-logs/${date}`}>View</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
