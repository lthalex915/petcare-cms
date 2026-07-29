interface ActivityItem {
  id: string;
  time: string;
  text: string;
  petName?: string;
}

export default function RecentActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="section-card" style={{ marginTop: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent Activity Feed</div>
      {items.length === 0 && <div style={{ color: "#999" }}>No recent entries</div>}
      {items.map((item) => (
        <div key={item.id} style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5", display: "flex", gap: 12 }}>
          <div style={{ fontSize: 11, color: "#999", minWidth: 60 }}>{item.time}</div>
          <div>
            <div style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>{item.text}</div>
            {item.petName && <div style={{ fontSize: 11, color: "#999" }}>{item.petName}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
