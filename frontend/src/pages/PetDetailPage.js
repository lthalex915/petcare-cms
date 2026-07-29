import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
export default function PetDetailPage() {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    useEffect(() => {
        if (!id) {
            return;
        }
        api.get(`/pets/${id}`).then((res) => setPet(res.data)).catch(() => setPet(null));
    }, [id]);
    if (!pet) {
        return _jsx("div", { className: "page-card", children: "Patient not found." });
    }
    return (_jsxs("div", { className: "page-card", children: [_jsxs("h1", { style: { marginTop: 0, fontSize: 20 }, children: [pet.nameEn, " (", pet.nameZh, ")"] }), _jsxs("div", { style: { lineHeight: 1.8, color: "#333" }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Species:" }), " ", pet.species] }), _jsxs("div", { children: [_jsx("strong", { children: "Breed:" }), " ", pet.breed] }), _jsxs("div", { children: [_jsx("strong", { children: "Gender:" }), " ", pet.gender] }), _jsxs("div", { children: [_jsx("strong", { children: "Date of Birth:" }), " ", new Date(pet.dob).toLocaleDateString()] }), _jsxs("div", { children: [_jsx("strong", { children: "Weight:" }), " ", pet.weight ?? "Not documented", " kg"] })] })] }));
}
