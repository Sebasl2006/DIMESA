"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import * as s from "../admin-styles";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        ...s.pageBackground,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-montserrat), sans-serif",
        padding: "24px",
      }}
    >
      <div className="admin-bg" />
      <form
        onSubmit={onSubmit}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "380px",
          background: "#141210",
          border: "1px solid rgba(201,168,118,0.22)",
          borderRadius: "10px",
          padding: "40px 36px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ ...s.brand, fontSize: "24px", textAlign: "center", marginBottom: "4px" }}>DIMESA</div>
        <div style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a7a5c", textAlign: "center", marginBottom: "32px" }}>
          Panel de administrador
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <label style={s.label}>Correo</label>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-input"
          style={s.input}
        />

        <label style={s.label}>Contraseña</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-input"
          style={s.input}
        />

        <button
          type="submit"
          disabled={loading}
          className="admin-btn-primary"
          style={{ ...s.primaryButton, width: "100%", marginTop: "28px", padding: "14px", opacity: loading ? 0.7 : 1, cursor: loading ? "default" : "pointer" }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
