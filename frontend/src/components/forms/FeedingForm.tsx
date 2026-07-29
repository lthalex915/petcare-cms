import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";

interface FeedingFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function FeedingForm({ date, pets, onSaved }: FeedingFormProps) {
  const [petId, setPetId] = useState("");
  const [foodType, setFoodType] = useState("WET");
  const [wetFoodBrand, setWetFoodBrand] = useState("");
  const [dryFoodGrams, setDryFoodGrams] = useState("");
  const [notes, setNotes] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!petId) {
      return;
    }

    await api.post(`/daily-logs/${date}/feedings`, {
      petId,
      mealTime: new Date().toISOString(),
      foodType,
      wetFoodBrand: wetFoodBrand || null,
      dryFoodGrams: dryFoodGrams ? Number(dryFoodGrams) : null,
      consumedBy: [petId],
      isAutoFeeder: foodType === "DRY",
      notes: notes || null
    });

    setNotes("");
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
      <select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
        <option value="WET">Wet</option>
        <option value="DRY">Dry</option>
        <option value="BOTH">Both</option>
      </select>
      <input value={wetFoodBrand} onChange={(e) => setWetFoodBrand(e.target.value)} placeholder="Wet food brand" />
      <input value={dryFoodGrams} onChange={(e) => setDryFoodGrams(e.target.value)} placeholder="Dry food grams" />
      <textarea style={{ gridColumn: "1 / -1" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Feeding Record
      </button>
    </form>
  );
}
