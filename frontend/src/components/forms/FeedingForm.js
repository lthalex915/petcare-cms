import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
export default function FeedingForm({ date, pets, onSaved }) {
    const [petId, setPetId] = useState("");
    const [foodType, setFoodType] = useState("WET");
    const [wetFoodBrand, setWetFoodBrand] = useState("");
    const [dryFoodGrams, setDryFoodGrams] = useState("");
    const [notes, setNotes] = useState("");
    async function submit(event) {
        event.preventDefault();
        if (!petId) {
            return;
        }
        await api.post(`/daily-logs/${date}/feedings`, {
            petId,
            mealTime: new Date().toISOString(),
            foodType,
            wetFoodBrand: wetFoodBrand || null,
            dryFoodGrams: dryFoodGrams ? Number(dryFoodGrams) : null,
            consumedBy: [petId],
            isAutoFeeder: foodType === "DRY",
            notes: notes || null
        });
        setNotes("");
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsxs("select", { value: petId, onChange: (e) => setPetId(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select patient" }), pets.map((pet) => (_jsx("option", { value: pet.id, children: pet.nameEn }, pet.id)))] }), _jsxs("select", { value: foodType, onChange: (e) => setFoodType(e.target.value), children: [_jsx("option", { value: "WET", children: "Wet" }), _jsx("option", { value: "DRY", children: "Dry" }), _jsx("option", { value: "BOTH", children: "Both" })] }), _jsx("input", { value: wetFoodBrand, onChange: (e) => setWetFoodBrand(e.target.value), placeholder: "Wet food brand" }), _jsx("input", { value: dryFoodGrams, onChange: (e) => setDryFoodGrams(e.target.value), placeholder: "Dry food grams" }), _jsx("textarea", { style: { gridColumn: "1 / -1" }, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Notes" }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Feeding Record" })] }));
}
