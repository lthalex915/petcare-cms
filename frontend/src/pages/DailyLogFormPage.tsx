import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityForm from "../components/forms/ActivityForm";
import DiaryForm from "../components/forms/DiaryForm";
import FeedingForm from "../components/forms/FeedingForm";
import HealthForm from "../components/forms/HealthForm";
import IncidentForm from "../components/forms/IncidentForm";
import LitterBoxForm from "../components/forms/LitterBoxForm";
import SupplyForm from "../components/forms/SupplyForm";
import api from "../services/api";
import type { Pet } from "../types";

type TabKey =
  | "feeding"
  | "health"
  | "activity"
  | "incident"
  | "litter"
  | "supply"
  | "diary";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "feeding", label: "Feeding Record" },
  { key: "health", label: "Health Observations" },
  { key: "activity", label: "Activity Log" },
  { key: "incident", label: "Incident Report" },
  { key: "litter", label: "Litter Box Log" },
  { key: "supply", label: "Supply Management" },
  { key: "diary", label: "Clinical Diary" }
];

function todayIso() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DailyLogFormPage() {
  const [date, setDate] = useState(todayIso());
  const [pets, setPets] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("feeding");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Pet[]>("/pets").then((res) => setPets(res.data)).catch(() => setPets([]));
  }, []);

  async function ensureLogAndGenerate() {
    setSaving(true);
    try {
      await api.post("/daily-logs", { date, summary: "Daily log recorded" });
      const report = await api.post("/reports/generate", { type: "DAILY", date });
      navigate(`/reports/${report.data.id}`);
    } finally {
      setSaving(false);
    }
  }

  const formView = useMemo(() => {
    const common = { date, pets, onSaved: () => undefined };
    switch (activeTab) {
      case "feeding":
        return <FeedingForm {...common} />;
      case "health":
        return <HealthForm {...common} />;
      case "activity":
        return <ActivityForm {...common} />;
      case "incident":
        return <IncidentForm {...common} />;
      case "litter":
        return <LitterBoxForm date={date} onSaved={() => undefined} />;
      case "supply":
        return <SupplyForm date={date} onSaved={() => undefined} />;
      case "diary":
        return <DiaryForm {...common} />;
      default:
        return null;
    }
  }, [activeTab, date, pets]);

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>Daily Clinical Log</h1>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              border: "1px solid #333",
              background: activeTab === tab.key ? "#000" : "#fff",
              color: activeTab === tab.key ? "#fff" : "#000",
              fontSize: 12,
              padding: "8px 10px"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ border: "1px solid #ccc", background: "#fff", padding: 16 }}>{formView}</div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={ensureLogAndGenerate}
          disabled={saving}
          style={{ width: "100%", padding: "12px 16px", border: "none", background: "#000", color: "#fff", fontWeight: 700 }}
        >
          {saving ? "Saving..." : "Save & Generate Report"}
        </button>
      </div>
    </div>
  );
}
