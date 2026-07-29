import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import type { Pet } from "../types";

export default function PetDetailPage() {
  const { adminMode } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [formData, setFormData] = useState({
    nameEn: "",
    nameZh: "",
    species: "",
    breed: "",
    gender: "MALE" as "MALE" | "FEMALE",
    dob: "",
    weight: ""
  });

  useEffect(() => {
    if (!id) {
      return;
    }
    api.get<Pet>(`/pets/${id}`).then((res) => {
      setPet(res.data);
      setFormData({
        nameEn: res.data.nameEn,
        nameZh: res.data.nameZh,
        species: res.data.species,
        breed: res.data.breed,
        gender: res.data.gender,
        dob: new Date(res.data.dob).toISOString().slice(0, 10),
        weight: res.data.weight == null ? "" : String(res.data.weight)
      });
    }).catch(() => setPet(null));
  }, [id]);

  async function savePet() {
    if (!id) {
      return;
    }
    setSaving(true);
    setErrorText("");
    try {
      const response = await api.put<Pet>(`/pets/${id}`, {
        ...formData,
        weight: formData.weight === "" ? null : Number(formData.weight)
      });
      setPet(response.data);
      setEditing(false);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "response" in error
          ? String((error as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Failed to update pet")
          : "Failed to update pet";
      setErrorText(message);
    } finally {
      setSaving(false);
    }
  }

  async function removePet() {
    if (!id) {
      return;
    }
    await api.delete(`/pets/${id}`);
    navigate("/pets");
  }

  if (!pet) {
    return <div className="page-card">Patient not found.</div>;
  }

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>{pet.nameEn} ({pet.nameZh})</h1>
      {adminMode && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} style={{ border: "1px solid #000", background: "#fff", padding: "8px 12px" }}>Edit Pet</button>
              <button onClick={removePet} style={{ border: "1px solid #a31616", background: "#fff", color: "#a31616", padding: "8px 12px" }}>Remove Pet</button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    nameEn: pet.nameEn,
                    nameZh: pet.nameZh,
                    species: pet.species,
                    breed: pet.breed,
                    gender: pet.gender,
                    dob: new Date(pet.dob).toISOString().slice(0, 10),
                    weight: pet.weight == null ? "" : String(pet.weight)
                  });
                }}
                style={{ border: "1px solid #666", background: "#fff", padding: "8px 12px" }}
              >
                Cancel
              </button>
              <button
                onClick={savePet}
                disabled={saving}
                style={{ border: "none", background: "#000", color: "#fff", padding: "8px 12px", opacity: saving ? 0.5 : 1 }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      )}

      {errorText && <div style={{ marginBottom: 12, color: "#a31616", fontWeight: 700 }}>{errorText}</div>}

      {!editing ? (
        <div style={{ lineHeight: 1.8, color: "#333" }}>
          <div><strong>Species:</strong> {pet.species}</div>
          <div><strong>Breed:</strong> {pet.breed}</div>
          <div><strong>Gender:</strong> {pet.gender}</div>
          <div><strong>Date of Birth:</strong> {new Date(pet.dob).toLocaleDateString()}</div>
          <div><strong>Weight:</strong> {pet.weight ?? "Not documented"} kg</div>
        </div>
      ) : (
        <div className="form-grid">
          <input value={formData.nameEn} onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))} placeholder="English name" />
          <input value={formData.nameZh} onChange={(e) => setFormData((prev) => ({ ...prev, nameZh: e.target.value }))} placeholder="Chinese name" />
          <input value={formData.species} onChange={(e) => setFormData((prev) => ({ ...prev, species: e.target.value }))} placeholder="Species" />
          <input value={formData.breed} onChange={(e) => setFormData((prev) => ({ ...prev, breed: e.target.value }))} placeholder="Breed" />
          <select value={formData.gender} onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value as "MALE" | "FEMALE" }))}>
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
          </select>
          <input type="date" value={formData.dob} onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))} />
          <input type="number" value={formData.weight} onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))} placeholder="Weight (kg)" />
        </div>
      )}
    </div>
  );
}
