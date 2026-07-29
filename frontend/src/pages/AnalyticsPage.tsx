import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../services/api";
import type { Pet } from "../types";

const palette = ["#000000", "#333333", "#666666", "#999999"];

export default function AnalyticsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [petId, setPetId] = useState<string>("");
  const [weightData, setWeightData] = useState<any[]>([]);
  const [feedingData, setFeedingData] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    api.get<Pet[]>("/pets").then((res) => {
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
    const byDate = new Map<string, Record<string, string>>();
    healthData.forEach((row) => {
      const date = new Date(row.date).toISOString().slice(0, 10);
      if (!byDate.has(date)) {
        byDate.set(date, {});
      }
      byDate.get(date)![row.petName] = row.appetite ?? "NONE";
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, values]) => ({ date, values }));
  }, [healthData]);

  const pieByActivity = useMemo(() => {
    const map = new Map<string, number>();
    activityData.forEach((row) => {
      const key = row.activityType ?? "OTHER";
      map.set(key, (map.get(key) ?? 0) + Number(row.durationMin ?? 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [activityData]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="page-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Analytics</h1>
        <select value={petId} onChange={(e) => setPetId(e.target.value)}>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>{pet.nameEn}</option>
          ))}
        </select>
      </div>

      <div className="page-card">
        <h2 style={{ marginTop: 0, fontSize: 14 }}>Weight Trends</h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={weightData.map((row) => ({ ...row, date: new Date(row.date).toISOString().slice(0, 10) }))}>
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weightKg" stroke="#000" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="page-card">
        <h2 style={{ marginTop: 0, fontSize: 14 }}>Feeding by Brand</h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={feedingData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
              <XAxis dataKey="brand" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#333" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="page-card">
        <h2 style={{ marginTop: 0, fontSize: 14 }}>Appetite Heatmap Table</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              {pets.map((pet) => (
                <th key={pet.id}>{pet.nameEn}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appetiteRows.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                {pets.map((pet) => {
                  const value = row.values[pet.nameEn] ?? "-";
                  const shade = value === "INCREASED" ? "#333" : value === "DECREASED" ? "#666" : value === "NORMAL" ? "#f5f5f5" : "#fff";
                  const textColor = shade === "#333" ? "#fff" : "#000";
                  return (
                    <td key={`${row.date}-${pet.id}`} style={{ background: shade, color: textColor }}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="page-card">
        <h2 style={{ marginTop: 0, fontSize: 14 }}>Activity Distribution</h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieByActivity} dataKey="value" nameKey="name" outerRadius={100}>
                {pieByActivity.map((_row, index) => (
                  <Cell key={index} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
