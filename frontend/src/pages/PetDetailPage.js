import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
export default function PetDetailPage() {
    const { adminMode } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [formData, setFormData] = useState({
        nameEn: "",
        nameZh: "",
        species: "",
        breed: "",
        gender: "MALE",
        dob: "",
        weight: ""
    });
    useEffect(() => {
        if (!id) {
            return;
        }
        api.get(`/pets/${id}`).then((res) => {
            setPet(res.data);
            setFormData({
                nameEn: res.data.nameEn,
                nameZh: res.data.nameZh,
                species: res.data.species,
                breed: res.data.breed,
                gender: res.data.gender,
                dob: new Date(res.data.dob).toISOString().slice(0, 10),
                weight: res.data.weight == null ? "" : String(res.data.weight)
            });
        }).catch(() => setPet(null));
    }, [id]);
    async function savePet() {
        if (!id) {
            return;
        }
        setSaving(true);
        setErrorText("");
        try {
            const response = await api.put(`/pets/${id}`, {
                ...formData,
                weight: formData.weight === "" ? null : Number(formData.weight)
            });
            setPet(response.data);
            setEditing(false);
        }
        catch (error) {
            const message = typeof error === "object" && error !== null && "response" in error
                ? String(error.response?.data?.error ?? "Failed to update pet")
                : "Failed to update pet";
            setErrorText(message);
        }
        finally {
            setSaving(false);
        }
    }
    async function removePet() {
        if (!id) {
            return;
        }
        await api.delete(`/pets/${id}`);
        navigate("/pets");
    }
    if (!pet) {
        return _jsx("div", { className: "page-card", children: "Patient not found." });
    }
    return (_jsxs("div", { className: "page-card", children: [_jsxs("h1", { style: { marginTop: 0, fontSize: 20 }, children: [pet.nameEn, " (", pet.nameZh, ")"] }), adminMode && (_jsx("div", { style: { marginBottom: 12, display: "flex", gap: 8 }, children: !editing ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setEditing(true), style: { border: "1px solid #000", background: "#fff", padding: "8px 12px" }, children: "Edit Pet" }), _jsx("button", { onClick: removePet, style: { border: "1px solid #a31616", background: "#fff", color: "#a31616", padding: "8px 12px" }, children: "Remove Pet" })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => {
                                setEditing(false);
                                setFormData({
                                    nameEn: pet.nameEn,
                                    nameZh: pet.nameZh,
                                    species: pet.species,
                                    breed: pet.breed,
                                    gender: pet.gender,
                                    dob: new Date(pet.dob).toISOString().slice(0, 10),
                                    weight: pet.weight == null ? "" : String(pet.weight)
                                });
                            }, style: { border: "1px solid #666", background: "#fff", padding: "8px 12px" }, children: "Cancel" }), _jsx("button", { onClick: savePet, disabled: saving, style: { border: "none", background: "#000", color: "#fff", padding: "8px 12px", opacity: saving ? 0.5 : 1 }, children: saving ? "Saving..." : "Save" })] })) })), errorText && _jsx("div", { style: { marginBottom: 12, color: "#a31616", fontWeight: 700 }, children: errorText }), !editing ? (_jsxs("div", { style: { lineHeight: 1.8, color: "#333" }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Species:" }), " ", pet.species] }), _jsxs("div", { children: [_jsx("strong", { children: "Breed:" }), " ", pet.breed] }), _jsxs("div", { children: [_jsx("strong", { children: "Gender:" }), " ", pet.gender] }), _jsxs("div", { children: [_jsx("strong", { children: "Date of Birth:" }), " ", new Date(pet.dob).toLocaleDateString()] }), _jsxs("div", { children: [_jsx("strong", { children: "Weight:" }), " ", pet.weight ?? "Not documented", " kg"] })] })) : (_jsxs("div", { className: "form-grid", children: [_jsx("input", { value: formData.nameEn, onChange: (e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value })), placeholder: "English name" }), _jsx("input", { value: formData.nameZh, onChange: (e) => setFormData((prev) => ({ ...prev, nameZh: e.target.value })), placeholder: "Chinese name" }), _jsx("input", { value: formData.species, onChange: (e) => setFormData((prev) => ({ ...prev, species: e.target.value })), placeholder: "Species" }), _jsx("input", { value: formData.breed, onChange: (e) => setFormData((prev) => ({ ...prev, breed: e.target.value })), placeholder: "Breed" }), _jsxs("select", { value: formData.gender, onChange: (e) => setFormData((prev) => ({ ...prev, gender: e.target.value })), children: [_jsx("option", { value: "MALE", children: "MALE" }), _jsx("option", { value: "FEMALE", children: "FEMALE" })] }), _jsx("input", { type: "date", value: formData.dob, onChange: (e) => setFormData((prev) => ({ ...prev, dob: e.target.value })) }), _jsx("input", { type: "number", value: formData.weight, onChange: (e) => setFormData((prev) => ({ ...prev, weight: e.target.value })), placeholder: "Weight (kg)" })] }))] }));
}
