import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";
export default function ActivityForm({ date, pets, onSaved }) {
    const [petIds, setPetIds] = useState([]);
    const [activityType, setActivityType] = useState("PLAY");
    const [durationMin, setDurationMin] = useState("");
    const [notes, setNotes] = useState("");
    async function submit(event) {
        event.preventDefault();
        if (petIds.length === 0) {
            return;
        }
        await Promise.all(petIds.map((petId) => api.post(`/daily-logs/${date}/activities`, {
            petId,
            activityType,
            startTime: new Date().toISOString(),
            durationMin: durationMin ? Number(durationMin) : null,
            notes: notes || null
        })));
        setPetIds([]);
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsx(PetMultiSelectDropdown, { pets: pets, selectedPetIds: petIds, onChange: setPetIds }), _jsx("select", { value: activityType, onChange: (e) => setActivityType(e.target.value), children: [
                    "PLAY",
                    "WALK",
                    "RUN",
                    "SLEEP",
                    "GROOMING",
                    "EXPLORING",
                    "OTHER"
                ].map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsx("input", { value: durationMin, onChange: (e) => setDurationMin(e.target.value), placeholder: "Duration (min)" }), _jsx("div", { style: { gridColumn: "1 / -1", color: "#666", fontSize: 12 }, children: "Select one or more pets with checkboxes." }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Notes", style: { gridColumn: "1 / -1" } }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Activity Log" })] }));
}
