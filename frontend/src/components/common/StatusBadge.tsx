interface StatusBadgeProps {
  text: string;
  tone?: "ok" | "warn" | "muted";
}

export default function StatusBadge({ text, tone = "ok" }: StatusBadgeProps) {
  const styles = {
    ok: { background: "#f5f5f5", color: "#000", borderColor: "#333" },
    warn: { background: "#000", color: "#fff", borderColor: "#000" },
    muted: { background: "#fff", color: "#666", borderColor: "#999" }
  } as const;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 6px",
        fontSize: 10,
        fontWeight: 700,
        border: "1px solid",
        ...styles[tone]
      }}
    >
      {text}
    </span>
  );
}
