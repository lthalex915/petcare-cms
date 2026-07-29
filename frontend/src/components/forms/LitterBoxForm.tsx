import { useState } from "react";
import api from "../../services/api";

interface LitterBoxFormProps {
  date: string;
  onSaved: () => void;
}

export default function LitterBoxForm({ date, onSaved }: LitterBoxFormProps) {
  const [boxNumber, setBoxNumber] = useState("1");
  const [fullyChanged, setFullyChanged] = useState(false);
  const [scooped, setScooped] = useState(true);
  const [notes, setNotes] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await api.post(`/daily-logs/${date}/litter-box`, {
      boxNumber: Number(boxNumber),
      fullyChanged,
      scooped,
      notes: notes || null
    });
    onSaved();
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <input value={boxNumber} onChange={(e) => setBoxNumber(e.target.value)} placeholder="Box number" />
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={fullyChanged} onChange={(e) => setFullyChanged(e.target.checked)} />
        Fully changed
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={scooped} onChange={(e) => setScooped(e.target.checked)} />
        Scooped
      </label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" style={{ gridColumn: "1 / -1" }} />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Litter Box Log
      </button>
    </form>
  );
}
