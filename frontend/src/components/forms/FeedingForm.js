import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
import { readFrequentFoods } from "../../utils/frequentFoods";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";
export default function FeedingForm({ date, pets, onSaved }) {
    const [petIds, setPetIds] = useState([]);
    const [foodType, setFoodType] = useState("WET");
    const [wetFoodBrand, setWetFoodBrand] = useState("");
    const [flavor, setFlavor] = useState("");
    const [dryFoodGrams, setDryFoodGrams] = useState("");
    const [notes, setNotes] = useState("");
    const frequentFoods = readFrequentFoods();
    function applyPreset(value) {
        setWetFoodBrand((prev) => {
            if (!prev.trim()) {
                return value;
            }
            return prev;
        });
    }
    async function submit(event) {
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
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsx(PetMultiSelectDropdown, { pets: pets, selectedPetIds: petIds, onChange: setPetIds }), _jsxs("select", { value: foodType, onChange: (e) => setFoodType(e.target.value), children: [_jsx("option", { value: "WET", children: "Wet" }), _jsx("option", { value: "DRY", children: "Dry" }), _jsx("option", { value: "BOTH", children: "Both" })] }), _jsx("input", { value: wetFoodBrand, onChange: (e) => setWetFoodBrand(e.target.value), placeholder: "Wet food brand" }), _jsx("input", { value: flavor, onChange: (e) => setFlavor(e.target.value), placeholder: "Flavor (recommended, optional)" }), _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [_jsx("span", { style: { fontSize: 12, color: "#666" }, children: "Quick foods:" }), frequentFoods.length === 0 ? (_jsx("span", { style: { fontSize: 12, color: "#999" }, children: "Add in Settings" })) : (frequentFoods.map((food) => (_jsx("button", { type: "button", onClick: () => applyPreset(food), style: { border: "1px solid #ccc", background: "#fff", padding: "4px 8px", fontSize: 12 }, children: food }, food))))] }), _jsx("input", { value: dryFoodGrams, onChange: (e) => setDryFoodGrams(e.target.value), placeholder: "Dry food grams" }), _jsx("div", { style: { gridColumn: "1 / -1", color: "#666", fontSize: 12 }, children: "Select one or more pets with checkboxes." }), _jsx("textarea", { style: { gridColumn: "1 / -1" }, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Notes" }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Feeding Record" })] }));
}
