import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import StatusBadge from "../common/StatusBadge";
function calcAge(dob) {
    const birth = new Date(dob);
    const now = new Date();
    const months = Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
    return `${months} months`;
}
export default function PatientCard({ pet, appetite = "Normal", mood = "Calm", accent = "#333" }) {
    return (_jsxs("div", { style: {
            border: "1px solid #ccc",
            background: "#fff",
            padding: 16,
            borderLeft: `4px solid ${accent}`
        }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 12 }, children: [_jsxs("div", { children: [_jsx("span", { style: { fontSize: 16, fontWeight: 700 }, children: pet.nameEn }), _jsxs("span", { style: { fontSize: 12, color: "#999", marginLeft: 4 }, children: ["(", pet.nameZh, ")"] })] }), _jsx("span", { style: { padding: "2px 8px", border: "1px solid #000", fontSize: 10, fontWeight: 700 }, children: pet.gender === "MALE" ? "M" : "F" })] }), _jsxs("div", { style: { fontSize: 12, color: "#666", lineHeight: 1.8 }, children: [_jsxs("div", { children: [_jsx("span", { style: { color: "#999" }, children: "Breed:" }), " ", pet.breed] }), _jsxs("div", { children: [_jsx("span", { style: { color: "#999" }, children: "DOB:" }), " ", new Date(pet.dob).toLocaleDateString(), " (", calcAge(pet.dob), ")"] }), _jsxs("div", { children: [_jsx("span", { style: { color: "#999" }, children: "Weight:" }), " ", pet.weight ?? "Not documented", " kg"] })] }), _jsxs("div", { style: { display: "flex", gap: 8, marginTop: 10 }, children: [_jsx(StatusBadge, { text: `Appetite: ${appetite}`, tone: "ok" }), _jsx(StatusBadge, { text: `Mood: ${mood}`, tone: mood.toLowerCase() === "lethargic" ? "warn" : "ok" })] })] }));
}
