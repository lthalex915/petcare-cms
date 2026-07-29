import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";

interface HealthFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function HealthForm({ date, pets, onSaved }: HealthFormProps) {
  const [petIds, setPetIds] = useState<string[]>([]);
  const [weightKg, setWeightKg] = useState("");
  const [temperature, setTemperature] = useState("");
  const [appetite, setAppetite] = useState("NORMAL");
  const [mood, setMood] = useState("CALM");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (petIds.length === 0) {
      return;
    }

    await Promise.all(petIds.map((petId) => api.post(`/daily-logs/${date}/health`, {
      petId,
      weightKg: weightKg ? Number(weightKg) : null,
      temperature: temperature ? Number(temperature) : null,
      appetite,
      mood,
      stool: "NORMAL",
      vomit: false
    })));

    setPetIds([]);
    onSaved();
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <PetMultiSelectDropdown pets={pets} selectedPetIds={petIds} onChange={setPetIds} />
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
      <div style={{ gridColumn: "1 / -1", color: "#666", fontSize: 12 }}>Select one or more pets with checkboxes.</div>
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Health Observation
      </button>
    </form>
  );
}
