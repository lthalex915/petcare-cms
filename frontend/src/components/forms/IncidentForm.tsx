import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";

interface IncidentFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function IncidentForm({ date, pets, onSaved }: IncidentFormProps) {
  const [petIds, setPetIds] = useState<string[]>([]);
  const [severity, setSeverity] = useState("INFO");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [resolved, setResolved] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (petIds.length === 0 || !title || !description) {
      return;
    }

    await Promise.all(petIds.map((petId) => api.post(`/daily-logs/${date}/incidents`, {
      petId,
      severity,
      title,
      description,
      actionTaken: actionTaken.trim() || null,
      resolved
    })));

    setPetIds([]);
    setTitle("");
    setDescription("");
    setActionTaken("");
    setResolved(false);
    onSaved();
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <PetMultiSelectDropdown pets={pets} selectedPetIds={petIds} onChange={setPetIds} />
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option value="INFO">Info</option>
        <option value="MINOR">Minor</option>
        <option value="MODERATE">Moderate</option>
        <option value="CRITICAL">Critical</option>
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Incident title" required />
      <div style={{ gridColumn: "1 / -1", color: "#666", fontSize: 12 }}>Select one or more pets with checkboxes.</div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Incident description" required style={{ gridColumn: "1 / -1" }} />
      <input value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} placeholder="Action taken (optional)" style={{ gridColumn: "1 / -1" }} />
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={resolved} onChange={(e) => setResolved(e.target.checked)} />
        Resolved
      </label>
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Incident Report
      </button>
    </form>
  );
}
