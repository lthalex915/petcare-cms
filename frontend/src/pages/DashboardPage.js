import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { IconPaw } from "../components/icons";
import PatientCard from "../components/dashboard/PatientCard";
import TodaySummary from "../components/dashboard/TodaySummary";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivityFeed from "../components/dashboard/RecentActivityFeed";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
function asArray(value) {
    return Array.isArray(value) ? value : [];
}
export default function DashboardPage() {
    const [pets, setPets] = useState([]);
    const [todayData, setTodayData] = useState({ feedings: 0, health: 0, incidents: 0, supplies: 0 });
    const [activity, setActivity] = useState([]);
    const { user } = useAuth();
    useEffect(() => {
        async function load() {
            const [petsRes, todayRes] = await Promise.all([
                api.get("/pets"),
                api.get("/daily-logs/today")
            ]);
            setPets(asArray(petsRes.data));
            const today = todayRes.data;
            if (today) {
                const feedings = asArray(today.feedings);
                const health = asArray(today.health);
                const incidents = asArray(today.incidents);
                const supplies = asArray(today.supplies);
                setTodayData({
                    feedings: feedings.length,
                    health: health.length,
                    incidents: incidents.length,
                    supplies: supplies.length
                });
                const feedItems = feedings.slice(0, 8).map((row) => ({
                    id: `f-${row.id}`,
                    time: new Date(row.mealTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    text: `Feeding recorded (${row.foodType})`,
                    petName: row.petId
                }));
                setActivity(feedItems);
            }
        }
        load().catch(() => {
            setPets([]);
        });
    }, []);
    const dateText = useMemo(() => new Date().toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short", year: "numeric" }), []);
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { style: { margin: 0, fontSize: 22, fontWeight: 700 }, children: "Clinical Dashboard" }), _jsxs("p", { style: { margin: "4px 0 0", color: "#666", fontSize: 13 }, children: ["Welcome back, ", user?.displayName ?? "Staff", " | ", dateText] })] }), _jsxs("div", { style: { marginBottom: 24 }, children: [_jsxs("div", { style: { fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }, children: [_jsx(IconPaw, { size: 18, color: "#000" }), "Active Pets (", pets.length, ")"] }), _jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }, children: pets.map((pet, index) => (_jsx(PatientCard, { pet: pet, accent: ["#333", "#666", "#999"][index % 3], appetite: index === 1 ? "Increased" : "Normal", mood: index === 1 ? "Lethargic" : index === 0 ? "Playful" : "Calm" }, pet.id))) })] }), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }, children: [_jsx(TodaySummary, { dateLabel: new Date().toLocaleDateString(), feedingCount: todayData.feedings, healthCount: todayData.health, incidentCount: todayData.incidents, supplyCount: todayData.supplies }), _jsx(QuickActions, {})] }), _jsx(RecentActivityFeed, { items: activity }), _jsx("div", { style: { marginTop: 20, paddingTop: 10, borderTop: "1px solid #ddd", fontSize: 10, color: "#999" }, children: "PetCare CMS v1.0.0" })] }));
}
