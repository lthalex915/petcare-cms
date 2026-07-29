import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";
export default function IncidentForm({ date, pets, onSaved }) {
    const [petIds, setPetIds] = useState([]);
    const [severity, setSeverity] = useState("INFO");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    async function submit(event) {
        event.preventDefault();
        if (petIds.length === 0 || !title || !description) {
            return;
        }
        await Promise.all(petIds.map((petId) => api.post(`/daily-logs/${date}/incidents`, {
            petId,
            severity,
            title,
            description,
            resolved: false
        })));
        setPetIds([]);
        setTitle("");
        setDescription("");
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsx(PetMultiSelectDropdown, { pets: pets, selectedPetIds: petIds, onChange: setPetIds }), _jsxs("select", { value: severity, onChange: (e) => setSeverity(e.target.value), children: [_jsx("option", { value: "INFO", children: "Info" }), _jsx("option", { value: "MINOR", children: "Minor" }), _jsx("option", { value: "MODERATE", children: "Moderate" }), _jsx("option", { value: "CRITICAL", children: "Critical" })] }), _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Incident title", required: true }), _jsx("div", { style: { gridColumn: "1 / -1", color: "#666", fontSize: 12 }, children: "Select one or more pets with checkboxes." }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Incident description", required: true, style: { gridColumn: "1 / -1" } }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Incident Report" })] }));
}
