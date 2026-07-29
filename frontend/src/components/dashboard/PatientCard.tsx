import type { Pet } from "../../types";
import StatusBadge from "../common/StatusBadge";

interface PatientCardProps {
  pet: Pet;
  appetite?: string;
  mood?: string;
  accent?: string;
}

function calcAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
  return `${months} months`;
}

export default function PatientCard({ pet, appetite = "Normal", mood = "Calm", accent = "#333" }: PatientCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        background: "#fff",
        padding: 16,
        borderLeft: `4px solid ${accent}`
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{pet.nameEn}</span>
          <span style={{ fontSize: 12, color: "#999", marginLeft: 4 }}>({pet.nameZh})</span>
        </div>
        <span style={{ padding: "2px 8px", border: "1px solid #000", fontSize: 10, fontWeight: 700 }}>
          {pet.gender === "MALE" ? "M" : "F"}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#666", lineHeight: 1.8 }}>
        <div>
          <span style={{ color: "#999" }}>Breed:</span> {pet.breed}
        </div>
        <div>
          <span style={{ color: "#999" }}>DOB:</span> {new Date(pet.dob).toLocaleDateString()} ({calcAge(pet.dob)})
        </div>
        <div>
          <span style={{ color: "#999" }}>Weight:</span> {pet.weight ?? "Not documented"} kg
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <StatusBadge text={`Appetite: ${appetite}`} tone="ok" />
        <StatusBadge text={`Mood: ${mood}`} tone={mood.toLowerCase() === "lethargic" ? "warn" : "ok"} />
      </div>
    </div>
  );
}
