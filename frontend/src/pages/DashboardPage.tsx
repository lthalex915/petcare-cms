import { useEffect, useMemo, useState } from "react";
import { IconPaw } from "../components/icons";
import PatientCard from "../components/dashboard/PatientCard";
import TodaySummary from "../components/dashboard/TodaySummary";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivityFeed from "../components/dashboard/RecentActivityFeed";
import api from "../services/api";
import type { Pet } from "../types";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [todayData, setTodayData] = useState({ feedings: 0, health: 0, incidents: 0, supplies: 0 });
  const [activity, setActivity] = useState<Array<{ id: string; time: string; text: string; petName?: string }>>([]);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const [petsRes, todayRes] = await Promise.all([
        api.get<Pet[]>("/pets"),
        api.get("/daily-logs/today")
      ]);

      setPets(petsRes.data);
      const today = todayRes.data;
      if (today) {
        setTodayData({
          feedings: today.feedings?.length ?? 0,
          health: today.health?.length ?? 0,
          incidents: today.incidents?.length ?? 0,
          supplies: today.supplies?.length ?? 0
        });

        const feedItems = (today.feedings ?? []).slice(0, 8).map((row: any) => ({
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

  const dateText = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short", year: "numeric" }),
    []
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Clinical Dashboard</h1>
        <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>
          Welcome back, {user?.displayName ?? "Staff"} | {dateText}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <IconPaw size={18} color="#000" />
          Active Patients ({pets.length})
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {pets.map((pet, index) => (
            <PatientCard
              key={pet.id}
              pet={pet}
              accent={["#333", "#666", "#999"][index % 3]}
              appetite={index === 1 ? "Increased" : "Normal"}
              mood={index === 1 ? "Lethargic" : index === 0 ? "Playful" : "Calm"}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <TodaySummary
          dateLabel={new Date().toLocaleDateString()}
          feedingCount={todayData.feedings}
          healthCount={todayData.health}
          incidentCount={todayData.incidents}
          supplyCount={todayData.supplies}
        />
        <QuickActions />
      </div>

      <RecentActivityFeed items={activity} />

      <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #ddd", fontSize: 10, color: "#999" }}>
        PetCare CMS v1.0.0
      </div>
    </div>
  );
}
