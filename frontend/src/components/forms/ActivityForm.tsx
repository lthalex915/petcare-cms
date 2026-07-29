import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";

interface ActivityFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function ActivityForm({ date, pets, onSaved }: ActivityFormProps) {
  const [petIds, setPetIds] = useState<string[]>([]);
  const [activityType, setActivityType] = useState("PLAY");
  const [durationMin, setDurationMin] = useState("");
  const [notes, setNotes] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (petIds.length === 0) {
      return;
    }

    await Promise.all(petIds.map((petId) => api.post(`/daily-logs/${date}/activities`, {
      petId,
      activityType,
      startTime: new Date().toISOString(),
      durationMin: durationMin ? Number(durationMin) : null,
      notes: notes || null
    })));

    setPetIds([]);
    onSaved();
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <PetMultiSelectDropdown pets={pets} selectedPetIds={petIds} onChange={setPetIds} />
      <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
        {[
          "PLAY",
          "WALK",
          "RUN",
          "SLEEP",
          "GROOMING",
          "EXPLORING",
          "OTHER"
        ].map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <input value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="Duration (min)" />
      <div style={{ gridColumn: "1 / -1", color: "#666", fontSize: 12 }}>Select one or more pets with checkboxes.</div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" style={{ gridColumn: "1 / -1" }} />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Activity Log
      </button>
    </form>
  );
}
