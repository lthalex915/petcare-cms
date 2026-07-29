import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
export default function HealthForm({ date, pets, onSaved }) {
    const [petId, setPetId] = useState("");
    const [weightKg, setWeightKg] = useState("");
    const [temperature, setTemperature] = useState("");
    const [appetite, setAppetite] = useState("NORMAL");
    const [mood, setMood] = useState("CALM");
    async function submit(event) {
        event.preventDefault();
        if (!petId) {
            return;
        }
        await api.post(`/daily-logs/${date}/health`, {
            petId,
            weightKg: weightKg ? Number(weightKg) : null,
            temperature: temperature ? Number(temperature) : null,
            appetite,
            mood,
            stool: "NORMAL",
            vomit: false
        });
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsxs("select", { value: petId, onChange: (e) => setPetId(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select patient" }), pets.map((pet) => (_jsx("option", { value: pet.id, children: pet.nameEn }, pet.id)))] }), _jsx("input", { value: weightKg, onChange: (e) => setWeightKg(e.target.value), placeholder: "Weight (kg)" }), _jsx("input", { value: temperature, onChange: (e) => setTemperature(e.target.value), placeholder: "Temperature (C)" }), _jsxs("select", { value: appetite, onChange: (e) => setAppetite(e.target.value), children: [_jsx("option", { value: "NORMAL", children: "Normal" }), _jsx("option", { value: "DECREASED", children: "Decreased" }), _jsx("option", { value: "INCREASED", children: "Increased" }), _jsx("option", { value: "NONE", children: "None" })] }), _jsxs("select", { value: mood, onChange: (e) => setMood(e.target.value), children: [_jsx("option", { value: "PLAYFUL", children: "Playful" }), _jsx("option", { value: "CALM", children: "Calm" }), _jsx("option", { value: "AGITATED", children: "Agitated" }), _jsx("option", { value: "LETHARGIC", children: "Lethargic" }), _jsx("option", { value: "HIDING", children: "Hiding" })] }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Health Observation" })] }));
}
