import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthCallback({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const token = searchParams.get("token");
    const userRaw = searchParams.get("user");
    const error = searchParams.get("error");

    if (error || !token || !userRaw) {
      setStatus("OAuth login failed. Redirecting...");
      setTimeout(() => navigate("/login?error=oauth_failed"), 1500);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
      navigate("/dashboard");
    } catch {
      setStatus("Something went wrong. Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      fontFamily: "var(--font)",
      color: "var(--text)",
    }}>
      <div style={{
        width: 52,
        height: 52,
        border: "3px solid rgba(0,212,170,0.2)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ fontSize: 16, color: "var(--muted)" }}>{status}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
