import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";
export default function HealthForm({ date, pets, onSaved }) {
    const [petIds, setPetIds] = useState([]);
    const [weightKg, setWeightKg] = useState("");
    const [temperature, setTemperature] = useState("");
    const [appetite, setAppetite] = useState("NORMAL");
    const [mood, setMood] = useState("CALM");
    async function submit(event) {
        event.preventDefault();
        if (petIds.length === 0) {
            return;
        }
        await Promise.all(petIds.map((petId) => api.post(`/daily-logs/${date}/health`, {
            petId,
            weightKg: weightKg ? Number(weightKg) : null,
            temperature: temperature ? Number(temperature) : null,
            appetite,
            mood,
            stool: "NORMAL",
            vomit: false
        })));
        setPetIds([]);
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsx(PetMultiSelectDropdown, { pets: pets, selectedPetIds: petIds, onChange: setPetIds }), _jsx("input", { value: weightKg, onChange: (e) => setWeightKg(e.target.value), placeholder: "Weight (kg)" }), _jsx("input", { value: temperature, onChange: (e) => setTemperature(e.target.value), placeholder: "Temperature (C)" }), _jsxs("select", { value: appetite, onChange: (e) => setAppetite(e.target.value), children: [_jsx("option", { value: "NORMAL", children: "Normal" }), _jsx("option", { value: "DECREASED", children: "Decreased" }), _jsx("option", { value: "INCREASED", children: "Increased" }), _jsx("option", { value: "NONE", children: "None" })] }), _jsxs("select", { value: mood, onChange: (e) => setMood(e.target.value), children: [_jsx("option", { value: "PLAYFUL", children: "Playful" }), _jsx("option", { value: "CALM", children: "Calm" }), _jsx("option", { value: "AGITATED", children: "Agitated" }), _jsx("option", { value: "LETHARGIC", children: "Lethargic" }), _jsx("option", { value: "HIDING", children: "Hiding" })] }), _jsx("div", { style: { gridColumn: "1 / -1", color: "#666", fontSize: 12 }, children: "Select one or more pets with checkboxes." }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Health Observation" })] }));
}
