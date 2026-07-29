import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";

interface HealthFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function HealthForm({ date, pets, onSaved }: HealthFormProps) {
  const [petId, setPetId] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [temperature, setTemperature] = useState("");
  const [appetite, setAppetite] = useState("NORMAL");
  const [mood, setMood] = useState("CALM");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!petId) {
      return;
    }

    await api.post(`/daily-logs/${date}/health`, {
      petId,
      weightKg: weightKg ? Number(weightKg) : null,
      temperature: temperature ? Number(temperature) : null,
      appetite,
      mood,
      stool: "NORMAL",
      vomit: false
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
      <input value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="Weight (kg)" />
      <input value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="Temperature (C)" />
      <select value={appetite} onChange={(e) => setAppetite(e.target.value)}>
        <option value="NORMAL">Normal</option>
        <option value="DECREASED">Decreased</option>
        <option value="INCREASED">Increased</option>
        <option value="NONE">None</option>
      </select>
      <select value={mood} onChange={(e) => setMood(e.target.value)}>
        <option value="PLAYFUL">Playful</option>
        <option value="CALM">Calm</option>
        <option value="AGITATED">Agitated</option>
        <option value="LETHARGIC">Lethargic</option>
        <option value="HIDING">Hiding</option>
      </select>
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Health Observation
      </button>
    </form>
  );
}
