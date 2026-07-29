import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";

interface IncidentFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function IncidentForm({ date, pets, onSaved }: IncidentFormProps) {
  const [petId, setPetId] = useState("");
  const [severity, setSeverity] = useState("INFO");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!petId || !title || !description) {
      return;
    }

    await api.post(`/daily-logs/${date}/incidents`, {
      petId,
      severity,
      title,
      description,
      resolved: false
    });

    setTitle("");
    setDescription("");
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
      <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
        <option value="INFO">Info</option>
        <option value="MINOR">Minor</option>
        <option value="MODERATE">Moderate</option>
        <option value="CRITICAL">Critical</option>
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Incident title" required />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Incident description" required style={{ gridColumn: "1 / -1" }} />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Incident Report
      </button>
    </form>
  );
}
