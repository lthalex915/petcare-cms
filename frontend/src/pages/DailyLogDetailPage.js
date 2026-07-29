import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
export default function DailyLogDetailPage() {
    const { adminMode } = useAuth();
    const { date } = useParams();
    const [log, setLog] = useState(null);
    const [editing, setEditing] = useState(false);
    const [summary, setSummary] = useState("");
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (!date) {
            return;
        }
        api.get(`/daily-logs/${date}`).then((res) => {
            setLog(res.data);
            setSummary(res.data.summary || "");
        }).catch(() => setLog(null));
    }, [date]);
    async function saveSummary() {
        if (!date) {
            return;
        }
        setSaving(true);
        try {
            const response = await api.post("/daily-logs", { date, summary });
            setLog(response.data);
            setEditing(false);
        }
        finally {
            setSaving(false);
        }
    }
    if (!log) {
        return _jsx("div", { className: "page-card", children: "Daily log not found." });
    }
    return (_jsxs("div", { className: "page-card", children: [_jsxs("h1", { style: { marginTop: 0, fontSize: 20 }, children: ["Daily Log Detail \u2014 ", new Date(log.date).toISOString().slice(0, 10)] }), adminMode && (_jsx("div", { style: { marginBottom: 12, display: "flex", gap: 8 }, children: !editing ? (_jsx("button", { onClick: () => setEditing(true), style: { border: "1px solid #000", background: "#fff", padding: "8px 12px" }, children: "Edit Summary" })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => {
                                setSummary(log.summary || "");
                                setEditing(false);
                            }, style: { border: "1px solid #666", background: "#fff", padding: "8px 12px" }, children: "Cancel" }), _jsx("button", { onClick: saveSummary, disabled: saving, style: { border: "none", background: "#000", color: "#fff", padding: "8px 12px", opacity: saving ? 0.5 : 1 }, children: saving ? "Saving..." : "Save" })] })) })), !editing ? (_jsx("p", { style: { color: "#333" }, children: log.summary || "No summary" })) : (_jsx("textarea", { value: summary, onChange: (e) => setSummary(e.target.value), rows: 4, style: { width: "100%", marginBottom: 12 } })), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { children: [_jsx("strong", { children: "Feedings:" }), " ", log.feedings?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Health:" }), " ", log.health?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Activities:" }), " ", log.activities?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Incidents:" }), " ", log.incidents?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Litter Box:" }), " ", log.litterBoxes?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Supplies:" }), " ", log.supplies?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Diary Entries:" }), " ", log.diaryEntries?.length ?? 0] })] })] }));
}
