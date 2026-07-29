interface TodaySummaryProps {
  dateLabel: string;
  feedingCount: number;
  healthCount: number;
  incidentCount: number;
  supplyCount: number;
}

const rowStyle = { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, borderBottom: "1px solid #f5f5f5" } as const;

export default function TodaySummary({ dateLabel, feedingCount, healthCount, incidentCount, supplyCount }: TodaySummaryProps) {
  return (
    <div className="section-card">
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Today's Summary — {dateLabel}</div>
      <div style={rowStyle}><span style={{ color: "#666" }}>Feeding Entries</span><span style={{ fontWeight: 600 }}>{feedingCount}</span></div>
      <div style={rowStyle}><span style={{ color: "#666" }}>Health Entries</span><span style={{ fontWeight: 600 }}>{healthCount}</span></div>
      <div style={rowStyle}><span style={{ color: "#666" }}>Incident Reports</span><span style={{ fontWeight: 600 }}>{incidentCount}</span></div>
      <div style={{ ...rowStyle, borderBottom: "none" }}><span style={{ color: "#666" }}>Supply Entries</span><span style={{ fontWeight: 600 }}>{supplyCount}</span></div>
    </div>
  );
}
