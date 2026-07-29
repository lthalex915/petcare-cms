import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
export default function DiaryForm({ date, pets, onSaved }) {
    const [petId, setPetId] = useState("");
    const [content, setContent] = useState("");
    async function submit(event) {
        event.preventDefault();
        if (!petId || !content) {
            return;
        }
        await api.post(`/daily-logs/${date}/diary`, {
            petId,
            content
        });
        setContent("");
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsxs("select", { value: petId, onChange: (e) => setPetId(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select patient" }), pets.map((pet) => (_jsx("option", { value: pet.id, children: pet.nameEn }, pet.id)))] }), _jsx("div", {}), _jsx("textarea", { value: content, onChange: (e) => setContent(e.target.value), placeholder: "Clinical diary entry", required: true, style: { gridColumn: "1 / -1", minHeight: 120 } }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Diary Entry" })] }));
}
