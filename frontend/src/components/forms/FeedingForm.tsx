import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";
import { readFrequentFoods } from "../../utils/frequentFoods";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";

interface FeedingFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function FeedingForm({ date, pets, onSaved }: FeedingFormProps) {
  const [petIds, setPetIds] = useState<string[]>([]);
  const [foodType, setFoodType] = useState("WET");
  const [wetFoodBrand, setWetFoodBrand] = useState("");
  const [flavor, setFlavor] = useState("");
  const [dryFoodGrams, setDryFoodGrams] = useState("");
  const [notes, setNotes] = useState("");
  const frequentFoods = readFrequentFoods();

  function applyPreset(value: string) {
    setWetFoodBrand((prev) => {
      if (!prev.trim()) {
        return value;
      }
      return prev;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (petIds.length === 0) {
      return;
    }

    const [primaryPetId, ...otherPetIds] = petIds;
    const consumedBy = [primaryPetId, ...otherPetIds];

    await api.post(`/daily-logs/${date}/feedings`, {
      petId: primaryPetId,
      mealTime: new Date().toISOString(),
      foodType,
      wetFoodBrand: wetFoodBrand || null,
      flavor: flavor.trim() || null,
      dryFoodGrams: dryFoodGrams ? Number(dryFoodGrams) : null,
      consumedBy,
      isAutoFeeder: foodType === "DRY",
      notes: notes || null
    });

    setNotes("");
    setPetIds([]);
    onSaved();
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <PetMultiSelectDropdown pets={pets} selectedPetIds={petIds} onChange={setPetIds} />
      <select value={foodType} onChange={(e) => setFoodType(e.target.value)}>
        <option value="WET">Wet</option>
        <option value="DRY">Dry</option>
        <option value="BOTH">Both</option>
      </select>
      <input value={wetFoodBrand} onChange={(e) => setWetFoodBrand(e.target.value)} placeholder="Wet food brand" />
      <input value={flavor} onChange={(e) => setFlavor(e.target.value)} placeholder="Flavor (recommended, optional)" />
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#666" }}>Quick foods:</span>
        {frequentFoods.length === 0 ? (
          <span style={{ fontSize: 12, color: "#999" }}>Add in Settings</span>
        ) : (
          frequentFoods.map((food) => (
            <button
              key={food}
              type="button"
              onClick={() => applyPreset(food)}
              style={{ border: "1px solid #ccc", background: "#fff", padding: "4px 8px", fontSize: 12 }}
            >
              {food}
            </button>
          ))
        )}
      </div>
      <input value={dryFoodGrams} onChange={(e) => setDryFoodGrams(e.target.value)} placeholder="Dry food grams" />
      <div style={{ gridColumn: "1 / -1", color: "#666", fontSize: 12 }}>Select one or more pets with checkboxes.</div>
      <textarea style={{ gridColumn: "1 / -1" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Feeding Record
      </button>
    </form>
  );
}
