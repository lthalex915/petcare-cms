import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ActivityForm from "../components/forms/ActivityForm";
import DiaryForm from "../components/forms/DiaryForm";
import FeedingForm from "../components/forms/FeedingForm";
import HealthForm from "../components/forms/HealthForm";
import IncidentForm from "../components/forms/IncidentForm";
import LitterBoxForm from "../components/forms/LitterBoxForm";
import SupplyForm from "../components/forms/SupplyForm";
import api from "../services/api";
const tabs = [
    { key: "feeding", label: "Feeding Record" },
    { key: "health", label: "Health Observations" },
    { key: "activity", label: "Activity Log" },
    { key: "incident", label: "Incident Report" },
    { key: "litter", label: "Litter Box Log" },
    { key: "supply", label: "Supply Management" },
    { key: "diary", label: "Clinical Diary" }
];
function todayIso() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function asArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (Array.isArray(value?.data)) {
        return value.data;
    }
    if (Array.isArray(value?.items)) {
        return value.items;
    }
    return [];
}
export default function DailyLogFormPage() {
    const [date, setDate] = useState(todayIso());
    const [pets, setPets] = useState([]);
    const [activeTab, setActiveTab] = useState("feeding");
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        api.get("/pets").then((res) => setPets(asArray(res.data))).catch(() => setPets([]));
    }, []);
    async function ensureLogAndGenerate() {
        setSaving(true);
        try {
            await api.post("/daily-logs", { date, summary: "Daily log recorded" });
            const report = await api.post("/reports/generate", { type: "DAILY", date });
            navigate(`/reports/${report.data.id}`);
        }
        finally {
            setSaving(false);
        }
    }
    const formView = useMemo(() => {
        const common = { date, pets, onSaved: () => undefined };
        switch (activeTab) {
            case "feeding":
                return _jsx(FeedingForm, { ...common });
            case "health":
                return _jsx(HealthForm, { ...common });
            case "activity":
                return _jsx(ActivityForm, { ...common });
            case "incident":
                return _jsx(IncidentForm, { ...common });
            case "litter":
                return _jsx(LitterBoxForm, { date: date, onSaved: () => undefined });
            case "supply":
                return _jsx(SupplyForm, { date: date, onSaved: () => undefined });
            case "diary":
                return _jsx(DiaryForm, { ...common });
            default:
                return null;
        }
    }, [activeTab, date, pets]);
    return (_jsxs("div", { className: "page-card", children: [_jsx("h1", { style: { marginTop: 0, fontSize: 20 }, children: "Daily Clinical Log" }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { display: "block", marginBottom: 4 }, children: "Date" }), _jsx("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value) })] }), _jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }, children: tabs.map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab.key), style: {
                        border: "1px solid #333",
                        background: activeTab === tab.key ? "#000" : "#fff",
                        color: activeTab === tab.key ? "#fff" : "#000",
                        fontSize: 12,
                        padding: "8px 10px"
                    }, children: tab.label }, tab.key))) }), _jsx("div", { style: { border: "1px solid #ccc", background: "#fff", padding: 16 }, children: formView }), _jsx("div", { style: { marginTop: 16 }, children: _jsx("button", { onClick: ensureLogAndGenerate, disabled: saving, style: { width: "100%", padding: "12px 16px", border: "none", background: "#000", color: "#fff", fontWeight: 700 }, children: saving ? "Saving..." : "Save & Generate Report" }) })] }));
}
