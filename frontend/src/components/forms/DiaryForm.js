import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
import PetMultiSelectDropdown from "../common/PetMultiSelectDropdown";
export default function DiaryForm({ date, pets, onSaved }) {
    const [petIds, setPetIds] = useState([]);
    const [content, setContent] = useState("");
    async function submit(event) {
        event.preventDefault();
        if (petIds.length === 0 || !content) {
            return;
        }
        await Promise.all(petIds.map((petId) => api.post(`/daily-logs/${date}/diary`, {
            petId,
            content
        })));
        setPetIds([]);
        setContent("");
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsx(PetMultiSelectDropdown, { pets: pets, selectedPetIds: petIds, onChange: setPetIds }), _jsx("div", { style: { color: "#666", fontSize: 12 }, children: "Select one or more pets with checkboxes." }), _jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value), placeholder: "Clinical diary entry", required: true, style: { gridColumn: "1 / -1", minHeight: 120 } }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Diary Entry" })] }));
}
