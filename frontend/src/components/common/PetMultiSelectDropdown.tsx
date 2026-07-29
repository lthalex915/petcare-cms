import { useMemo, useState } from "react";
import type { Pet } from "../../types";

interface PetMultiSelectDropdownProps {
  pets: Pet[];
  selectedPetIds: string[];
  onChange: (nextPetIds: string[]) => void;
  placeholder?: string;
}

export default function PetMultiSelectDropdown({
  pets,
  selectedPetIds,
  onChange,
  placeholder = "Select pets"
}: PetMultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (selectedPetIds.length === 0) {
      return placeholder;
    }
    const selectedNames = pets
      .filter((pet) => selectedPetIds.includes(pet.id))
      .map((pet) => pet.nameEn);
    return selectedNames.join(", ");
  }, [pets, placeholder, selectedPetIds]);

  function togglePet(petId: string) {
    if (selectedPetIds.includes(petId)) {
      onChange(selectedPetIds.filter((id) => id !== petId));
      return;
    }
    onChange([...selectedPetIds, petId]);
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          textAlign: "left",
          border: "1px solid #ccc",
          background: "#fff",
          padding: "8px 10px"
        }}
      >
        {label || placeholder}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            border: "1px solid #ccc",
            background: "#fff",
            zIndex: 30,
            maxHeight: 220,
            overflowY: "auto",
            padding: 8
          }}
        >
          {pets.length === 0 ? (
            <div style={{ color: "#666", fontSize: 12 }}>No pets available</div>
          ) : (
            pets.map((pet) => {
              const checked = selectedPetIds.includes(pet.id);
              return (
                <label
                  key={pet.id}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 2px", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePet(pet.id)}
                  />
                  <span>{pet.nameEn}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
