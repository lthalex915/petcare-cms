import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";

interface ActivityFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function ActivityForm({ date, pets, onSaved }: ActivityFormProps) {
  const [petId, setPetId] = useState("");
  const [activityType, setActivityType] = useState("PLAY");
  const [durationMin, setDurationMin] = useState("");
  const [notes, setNotes] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!petId) {
      return;
    }

    await api.post(`/daily-logs/${date}/activities`, {
      petId,
      activityType,
      startTime: new Date().toISOString(),
      durationMin: durationMin ? Number(durationMin) : null,
      notes: notes || null
    });

    onSaved();
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <select value={petId} onChange={(e) => setPetId(e.target.value)} required>
        <option value="">Select patient</option>
        {pets.map((pet) => (
          <option key={pet.id} value={pet.id}>{pet.nameEn}</option>
        ))}
      </select>
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
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" style={{ gridColumn: "1 / -1" }} />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Activity Log
      </button>
    </form>
  );
}
