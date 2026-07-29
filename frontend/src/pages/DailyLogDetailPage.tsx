import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function DailyLogDetailPage() {
  const { date } = useParams();
  const [log, setLog] = useState<any>(null);

  useEffect(() => {
    if (!date) {
      return;
    }
    api.get(`/daily-logs/${date}`).then((res) => setLog(res.data)).catch(() => setLog(null));
  }, [date]);

  if (!log) {
    return <div className="page-card">Daily log not found.</div>;
  }

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>Daily Log Detail — {new Date(log.date).toISOString().slice(0, 10)}</h1>
      <p style={{ color: "#333" }}>{log.summary || "No summary"}</p>
      <div className="form-grid">
        <div><strong>Feedings:</strong> {log.feedings?.length ?? 0}</div>
        <div><strong>Health:</strong> {log.health?.length ?? 0}</div>
        <div><strong>Activities:</strong> {log.activities?.length ?? 0}</div>
        <div><strong>Incidents:</strong> {log.incidents?.length ?? 0}</div>
        <div><strong>Litter Box:</strong> {log.litterBoxes?.length ?? 0}</div>
        <div><strong>Supplies:</strong> {log.supplies?.length ?? 0}</div>
        <div><strong>Diary Entries:</strong> {log.diaryEntries?.length ?? 0}</div>
      </div>
    </div>
  );
}
