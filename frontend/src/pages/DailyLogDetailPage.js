import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
export default function DailyLogDetailPage() {
    const { date } = useParams();
    const [log, setLog] = useState(null);
    useEffect(() => {
        if (!date) {
            return;
        }
        api.get(`/daily-logs/${date}`).then((res) => setLog(res.data)).catch(() => setLog(null));
    }, [date]);
    if (!log) {
        return _jsx("div", { className: "page-card", children: "Daily log not found." });
    }
    return (_jsxs("div", { className: "page-card", children: [_jsxs("h1", { style: { marginTop: 0, fontSize: 20 }, children: ["Daily Log Detail \u2014 ", new Date(log.date).toISOString().slice(0, 10)] }), _jsx("p", { style: { color: "#333" }, children: log.summary || "No summary" }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { children: [_jsx("strong", { children: "Feedings:" }), " ", log.feedings?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Health:" }), " ", log.health?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Activities:" }), " ", log.activities?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Incidents:" }), " ", log.incidents?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Litter Box:" }), " ", log.litterBoxes?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Supplies:" }), " ", log.supplies?.length ?? 0] }), _jsxs("div", { children: [_jsx("strong", { children: "Diary Entries:" }), " ", log.diaryEntries?.length ?? 0] })] })] }));
}
