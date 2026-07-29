import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
export default function LitterBoxForm({ date, onSaved }) {
    const [boxNumber, setBoxNumber] = useState("1");
    const [fullyChanged, setFullyChanged] = useState(false);
    const [scooped, setScooped] = useState(true);
    const [notes, setNotes] = useState("");
    async function submit(event) {
        event.preventDefault();
        await api.post(`/daily-logs/${date}/litter-box`, {
            boxNumber: Number(boxNumber),
            fullyChanged,
            scooped,
            notes: notes || null
        });
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsx("input", { value: boxNumber, onChange: (e) => setBoxNumber(e.target.value), placeholder: "Box number" }), _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: fullyChanged, onChange: (e) => setFullyChanged(e.target.checked) }), "Fully changed"] }), _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: scooped, onChange: (e) => setScooped(e.target.checked) }), "Scooped"] }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Notes", style: { gridColumn: "1 / -1" } }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Litter Box Log" })] }));
}
