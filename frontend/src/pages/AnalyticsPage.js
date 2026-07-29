import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api";
const palette = ["#000000", "#333333", "#666666", "#999999"];
export default function AnalyticsPage() {
    const [pets, setPets] = useState([]);
    const [petId, setPetId] = useState("");
    const [weightData, setWeightData] = useState([]);
    const [feedingData, setFeedingData] = useState([]);
    const [healthData, setHealthData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    useEffect(() => {
        api.get("/pets").then((res) => {
            setPets(res.data);
            if (res.data.length > 0) {
                setPetId(res.data[0].id);
            }
        });
    }, []);
    useEffect(() => {
        async function load() {
            const [weight, feeding, health, activity] = await Promise.all([
                api.get("/analytics/weight", { params: petId ? { petId } : {} }),
                api.get("/analytics/feeding"),
                api.get("/analytics/health", { params: petId ? { petId } : {} }),
                api.get("/analytics/activity", { params: petId ? { petId } : {} })
            ]);
            setWeightData(weight.data);
            setFeedingData(feeding.data);
            setHealthData(health.data);
            setActivityData(activity.data);
        }
        load().catch(() => {
            setWeightData([]);
            setFeedingData([]);
            setHealthData([]);
            setActivityData([]);
        });
    }, [petId]);
    const appetiteRows = useMemo(() => {
        const byDate = new Map();
        healthData.forEach((row) => {
            const date = new Date(row.date).toISOString().slice(0, 10);
            if (!byDate.has(date)) {
                byDate.set(date, {});
            }
            byDate.get(date)[row.petName] = row.appetite ?? "NONE";
        });
        return Array.from(byDate.entries())
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([date, values]) => ({ date, values }));
    }, [healthData]);
    const pieByActivity = useMemo(() => {
        const map = new Map();
        activityData.forEach((row) => {
            const key = row.activityType ?? "OTHER";
            map.set(key, (map.get(key) ?? 0) + Number(row.durationMin ?? 0));
        });
        return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }, [activityData]);
    return (_jsxs("div", { style: { display: "grid", gap: 16 }, children: [_jsxs("div", { className: "page-card", style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx("h1", { style: { margin: 0, fontSize: 20 }, children: "Analytics" }), _jsx("select", { value: petId, onChange: (e) => setPetId(e.target.value), children: pets.map((pet) => (_jsx("option", { value: pet.id, children: pet.nameEn }, pet.id))) })] }), _jsxs("div", { className: "page-card", children: [_jsx("h2", { style: { marginTop: 0, fontSize: 14 }, children: "Weight Trends" }), _jsx("div", { style: { width: "100%", height: 260 }, children: _jsx(ResponsiveContainer, { children: _jsxs(LineChart, { data: weightData.map((row) => ({ ...row, date: new Date(row.date).toISOString().slice(0, 10) })), children: [_jsx(CartesianGrid, { stroke: "#ccc", strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", stroke: "#333" }), _jsx(YAxis, { stroke: "#333" }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "weightKg", stroke: "#000", strokeWidth: 2, dot: { r: 2 } })] }) }) })] }), _jsxs("div", { className: "page-card", children: [_jsx("h2", { style: { marginTop: 0, fontSize: 14 }, children: "Feeding by Brand" }), _jsx("div", { style: { width: "100%", height: 260 }, children: _jsx(ResponsiveContainer, { children: _jsxs(BarChart, { data: feedingData, children: [_jsx(CartesianGrid, { stroke: "#ccc", strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "brand", stroke: "#333" }), _jsx(YAxis, { stroke: "#333" }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Bar, { dataKey: "count", fill: "#333" })] }) }) })] }), _jsxs("div", { className: "page-card", children: [_jsx("h2", { style: { marginTop: 0, fontSize: 14 }, children: "Appetite Heatmap Table" }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), pets.map((pet) => (_jsx("th", { children: pet.nameEn }, pet.id)))] }) }), _jsx("tbody", { children: appetiteRows.map((row) => (_jsxs("tr", { children: [_jsx("td", { children: row.date }), pets.map((pet) => {
                                            const value = row.values[pet.nameEn] ?? "-";
                                            const shade = value === "INCREASED" ? "#333" : value === "DECREASED" ? "#666" : value === "NORMAL" ? "#f5f5f5" : "#fff";
                                            const textColor = shade === "#333" ? "#fff" : "#000";
                                            return (_jsx("td", { style: { background: shade, color: textColor }, children: value }, `${row.date}-${pet.id}`));
                                        })] }, row.date))) })] })] }), _jsxs("div", { className: "page-card", children: [_jsx("h2", { style: { marginTop: 0, fontSize: 14 }, children: "Activity Distribution" }), _jsx("div", { style: { width: "100%", height: 260 }, children: _jsx(ResponsiveContainer, { children: _jsxs(PieChart, { children: [_jsx(Pie, { data: pieByActivity, dataKey: "value", nameKey: "name", outerRadius: 100, children: pieByActivity.map((_row, index) => (_jsx(Cell, { fill: palette[index % palette.length] }, index))) }), _jsx(Tooltip, {}), _jsx(Legend, {})] }) }) })] })] }));
}
