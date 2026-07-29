import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function DailyLogDetailPage() {
  const { adminMode } = useAuth();
  const { date } = useParams();
  const [log, setLog] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!date) {
      return;
    }
    api.get(`/daily-logs/${date}`).then((res) => {
      setLog(res.data);
      setSummary(res.data.summary || "");
    }).catch(() => setLog(null));
  }, [date]);

  async function saveSummary() {
    if (!date) {
      return;
    }
    setSaving(true);
    try {
      const response = await api.post("/daily-logs", { date, summary });
      setLog(response.data);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!log) {
    return <div className="page-card">Daily log not found.</div>;
  }

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>Daily Log Detail — {new Date(log.date).toISOString().slice(0, 10)}</h1>

      {adminMode && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{ border: "1px solid #000", background: "#fff", padding: "8px 12px" }}>Edit Summary</button>
          ) : (
            <>
              <button
                onClick={() => {
                  setSummary(log.summary || "");
                  setEditing(false);
                }}
                style={{ border: "1px solid #666", background: "#fff", padding: "8px 12px" }}
              >
                Cancel
              </button>
              <button
                onClick={saveSummary}
                disabled={saving}
                style={{ border: "none", background: "#000", color: "#fff", padding: "8px 12px", opacity: saving ? 0.5 : 1 }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      )}

      {!editing ? (
        <p style={{ color: "#333" }}>{log.summary || "No summary"}</p>
      ) : (
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} style={{ width: "100%", marginBottom: 12 }} />
      )}

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
