import { Link } from "react-router-dom";

export default function QuickActions() {
  const buttonStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "10px 16px",
    marginBottom: 8,
    fontSize: 13,
    textAlign: "center"
  };

  return (
    <div className="section-card">
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick Actions</div>
      <Link to="/daily-logs/new" style={{ ...buttonStyle, background: "#000", color: "#fff", border: "none" }}>
        New Daily Log
      </Link>
      <Link to="/reports" style={{ ...buttonStyle, background: "#fff", color: "#000", border: "1px solid #000" }}>
        View Reports
      </Link>
      <Link to="/analytics" style={{ ...buttonStyle, background: "#fff", color: "#000", border: "1px solid #000" }}>
        Open Analytics
      </Link>
      <Link to="/settings" style={{ ...buttonStyle, background: "#fff", color: "#000", border: "1px solid #000", marginBottom: 0 }}>
        Configure LLM
      </Link>
    </div>
  );
}
