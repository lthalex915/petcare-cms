import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import api from "../../services/api";
export default function SupplyForm({ date, onSaved }) {
    const [supplyType, setSupplyType] = useState("WET_FOOD");
    const [refilled, setRefilled] = useState(false);
    const [brand, setBrand] = useState("");
    const [quantity, setQuantity] = useState("");
    const [notes, setNotes] = useState("");
    async function submit(event) {
        event.preventDefault();
        await api.post(`/daily-logs/${date}/supplies`, {
            supplyType,
            refilled,
            brand: brand || null,
            quantity: quantity || null,
            notes: notes || null
        });
        onSaved();
    }
    return (_jsxs("form", { onSubmit: submit, className: "form-grid", children: [_jsx("select", { value: supplyType, onChange: (e) => setSupplyType(e.target.value), children: [
                    "DRY_FOOD",
                    "WET_FOOD",
                    "LITTER",
                    "TREATS",
                    "SUPPLEMENTS",
                    "MEDICATION",
                    "OTHER"
                ].map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsxs("label", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("input", { type: "checkbox", checked: refilled, onChange: (e) => setRefilled(e.target.checked) }), "Refilled"] }), _jsx("input", { value: brand, onChange: (e) => setBrand(e.target.value), placeholder: "Brand" }), _jsx("input", { value: quantity, onChange: (e) => setQuantity(e.target.value), placeholder: "Quantity" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Notes", style: { gridColumn: "1 / -1" } }), _jsx("button", { type: "submit", style: { gridColumn: "1 / -1", background: "#000", color: "#fff", border: "none", padding: "10px 16px" }, children: "Add Supply Record" })] }));
}
