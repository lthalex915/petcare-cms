import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { IconHospital } from "../components/icons";

export default function LoginPage() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <form onSubmit={submit} style={{ width: 360, border: "1px solid #ccc", background: "#fff", padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <IconHospital size={36} color="#000" />
        </div>
        <h1 style={{ margin: 0, fontSize: 20, textAlign: "center" }}>PetCare CMS</h1>
        <p style={{ margin: "4px 0 16px", textAlign: "center", color: "#666", fontSize: 12 }}>Clinical Management System</p>
        {error && <div style={{ fontWeight: 700, marginBottom: 10 }}>{error}</div>}
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" style={{ width: "100%", marginBottom: 10 }} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={{ width: "100%", marginBottom: 12 }} />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px 16px", border: "none", background: "#000", color: "#fff" }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
