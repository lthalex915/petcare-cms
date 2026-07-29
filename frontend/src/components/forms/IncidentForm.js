import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
export default function IncidentForm({ date, pets, onSaved }) {
    const [petId, setPetId] = useState("");
    const [severity, setSeverity] = useState("INFO");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    async function submit(event) {
        event.preventDefault();
        if (!petId || !title || !description) {
            return;
        }
        await api.post(`/daily-logs/${date}/incidents`, {
            petId,
            severity,
            title,
            description,
            resolved: false
        });
        setTitle("");
        setDescription("");
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsxs("select", { value: petId, onChange: (e) => setPetId(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select patient" }), pets.map((pet) => (_jsx("option", { value: pet.id, children: pet.nameEn }, pet.id)))] }), _jsxs("select", { value: severity, onChange: (e) => setSeverity(e.target.value), children: [_jsx("option", { value: "INFO", children: "Info" }), _jsx("option", { value: "MINOR", children: "Minor" }), _jsx("option", { value: "MODERATE", children: "Moderate" }), _jsx("option", { value: "CRITICAL", children: "Critical" })] }), _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Incident title", required: true }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Incident description", required: true, style: { gridColumn: "1 / -1" } }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Incident Report" })] }));
}
