import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import type { Pet } from "../types";

export default function PetDetailPage() {
  const { id } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    api.get<Pet>(`/pets/${id}`).then((res) => setPet(res.data)).catch(() => setPet(null));
  }, [id]);

  if (!pet) {
    return <div className="page-card">Patient not found.</div>;
  }

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>{pet.nameEn} ({pet.nameZh})</h1>
      <div style={{ lineHeight: 1.8, color: "#333" }}>
        <div><strong>Species:</strong> {pet.species}</div>
        <div><strong>Breed:</strong> {pet.breed}</div>
        <div><strong>Gender:</strong> {pet.gender}</div>
        <div><strong>Date of Birth:</strong> {new Date(pet.dob).toLocaleDateString()}</div>
        <div><strong>Weight:</strong> {pet.weight ?? "Not documented"} kg</div>
      </div>
    </div>
  );
}
