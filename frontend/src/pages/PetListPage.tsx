import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import type { Pet } from "../types";

export default function PetListPage() {
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    api.get<Pet[]>("/pets").then((res) => setPets(res.data)).catch(() => setPets([]));
  }, []);

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>Pets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Breed</th>
            <th>Gender</th>
            <th>DOB</th>
            <th>Weight</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pets.map((pet) => (
            <tr key={pet.id}>
              <td>{pet.nameEn} ({pet.nameZh})</td>
              <td>{pet.breed}</td>
              <td>{pet.gender}</td>
              <td>{new Date(pet.dob).toLocaleDateString()}</td>
              <td>{pet.weight ?? "Not documented"} kg</td>
              <td><Link to={`/pets/${pet.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
