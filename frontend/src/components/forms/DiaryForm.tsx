import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";

interface DiaryFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function DiaryForm({ date, pets, onSaved }: DiaryFormProps) {
  const [petIds, setPetIds] = useState<string[]>([]);
  const [content, setContent] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (petIds.length === 0 || !content) {
      return;
    }

    await Promise.all(petIds.map((petId) => api.post(`/daily-logs/${date}/diary`, {
      petId,
      content
    })));

    setPetIds([]);
    setContent("");
    onSaved();
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <PetMultiSelectDropdown pets={pets} selectedPetIds={petIds} onChange={setPetIds} />
      <div style={{ color: "#666", fontSize: 12 }}>Select one or more pets with checkboxes.</div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Clinical diary entry" required style={{ gridColumn: "1 / -1", minHeight: 120 }} />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Diary Entry
      </button>
    </form>
  );
}
