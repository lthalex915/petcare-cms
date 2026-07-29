import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
export default function PetListPage() {
    const [pets, setPets] = useState([]);
    useEffect(() => {
        api.get("/pets").then((res) => setPets(res.data)).catch(() => setPets([]));
    }, []);
    return (_jsxs("div", { className: "page-card", children: [_jsx("h1", { style: { marginTop: 0, fontSize: 20 }, children: "Pets" }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Breed" }), _jsx("th", { children: "Gender" }), _jsx("th", { children: "DOB" }), _jsx("th", { children: "Weight" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: pets.map((pet) => (_jsxs("tr", { children: [_jsxs("td", { children: [pet.nameEn, " (", pet.nameZh, ")"] }), _jsx("td", { children: pet.breed }), _jsx("td", { children: pet.gender }), _jsx("td", { children: new Date(pet.dob).toLocaleDateString() }), _jsxs("td", { children: [pet.weight ?? "Not documented", " kg"] }), _jsx("td", { children: _jsx(Link, { to: `/pets/${pet.id}`, children: "View" }) })] }, pet.id))) })] })] }));
}
