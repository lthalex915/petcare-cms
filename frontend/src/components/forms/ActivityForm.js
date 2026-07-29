import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
export default function ActivityForm({ date, pets, onSaved }) {
    const [petId, setPetId] = useState("");
    const [activityType, setActivityType] = useState("PLAY");
    const [durationMin, setDurationMin] = useState("");
    const [notes, setNotes] = useState("");
    async function submit(event) {
        event.preventDefault();
        if (!petId) {
            return;
        }
        await api.post(`/daily-logs/${date}/activities`, {
            petId,
            activityType,
            startTime: new Date().toISOString(),
            durationMin: durationMin ? Number(durationMin) : null,
            notes: notes || null
        });
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsxs("select", { value: petId, onChange: (e) => setPetId(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select patient" }), pets.map((pet) => (_jsx("option", { value: pet.id, children: pet.nameEn }, pet.id)))] }), _jsx("select", { value: activityType, onChange: (e) => setActivityType(e.target.value), children: [
                    "PLAY",
                    "WALK",
                    "RUN",
                    "SLEEP",
                    "GROOMING",
                    "EXPLORING",
                    "OTHER"
                ].map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsx("input", { value: durationMin, onChange: (e) => setDurationMin(e.target.value), placeholder: "Duration (min)" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Notes", style: { gridColumn: "1 / -1" } }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Activity Log" })] }));
}
