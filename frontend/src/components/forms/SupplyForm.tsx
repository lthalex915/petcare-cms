import { useState } from "react";
import api from "../../services/api";

interface SupplyFormProps {
  date: string;
  onSaved: () => void;
}

export default function SupplyForm({ date, onSaved }: SupplyFormProps) {
  const [supplyType, setSupplyType] = useState("WET_FOOD");
  const [refilled, setRefilled] = useState(false);
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await api.post(`/daily-logs/${date}/supplies`, {
      supplyType,
      refilled,
      brand: brand || null,
      quantity: quantity || null,
      notes: notes || null
    });
    onSaved();
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <select value={supplyType} onChange={(e) => setSupplyType(e.target.value)}>
        {[
          "DRY_FOOD",
          "WET_FOOD",
          "LITTER",
          "TREATS",
          "SUPPLEMENTS",
          "MEDICATION",
          "OTHER"
        ].map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={refilled} onChange={(e) => setRefilled(e.target.checked)} />
        Refilled
      </label>
      <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" />
      <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" style={{ gridColumn: "1 / -1" }} />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Supply Record
      </button>
    </form>
  );
}
