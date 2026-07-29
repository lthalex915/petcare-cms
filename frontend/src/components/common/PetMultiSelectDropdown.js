import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
export default function PetMultiSelectDropdown({ pets, selectedPetIds, onChange, placeholder = "Select pets" }) {
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
    function togglePet(petId) {
        if (selectedPetIds.includes(petId)) {
            onChange(selectedPetIds.filter((id) => id !== petId));
            return;
        }
        onChange([...selectedPetIds, petId]);
    }
    return (_jsxs("div", { style: { position: "relative" }, children: [_jsx("button", { type: "button", onClick: () => setOpen((prev) => !prev), style: {
                    width: "100%",
                    textAlign: "left",
                    border: "1px solid #ccc",
                    background: "#fff",
                    padding: "8px 10px"
                }, children: label || placeholder }), open && (_jsx("div", { style: {
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
                }, children: pets.length === 0 ? (_jsx("div", { style: { color: "#666", fontSize: 12 }, children: "No pets available" })) : (pets.map((pet) => {
                    const checked = selectedPetIds.includes(pet.id);
                    return (_jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 2px", cursor: "pointer" }, children: [_jsx("input", { type: "checkbox", checked: checked, onChange: () => togglePet(pet.id) }), _jsx("span", { children: pet.nameEn })] }, pet.id));
                })) }))] }));
}
