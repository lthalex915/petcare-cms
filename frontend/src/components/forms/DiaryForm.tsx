import { useState } from "react";
import api from "../../services/api";
import type { Pet } from "../../types";

interface DiaryFormProps {
  date: string;
  pets: Pet[];
  onSaved: () => void;
}

export default function DiaryForm({ date, pets, onSaved }: DiaryFormProps) {
  const [petId, setPetId] = useState("");
  const [content, setContent] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!petId || !content) {
      return;
    }

    await api.post(`/daily-logs/${date}/diary`, {
      petId,
      content
    });

    setContent("");
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
      <div />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Clinical diary entry" required style={{ gridColumn: "1 / -1", minHeight: 120 }} />
      <button type="submit" style={{ gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }}>
        Add Diary Entry
      </button>
    </form>
  );
}
