"use client";

import { useState, type FormEvent } from "react";
import { actualizarFondo, restaurarFondoOriginal } from "./actions";
import * as s from "../../admin-styles";

interface FondoFormProps {
  fondoActual: string | null;
}

const FONDO_POR_DEFECTO = "/images/fondo-claro.png";

export function FondoForm({ fondoActual }: FondoFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSubmitting(true);
    try {
      await actualizarFondo(new FormData(e.currentTarget));
      setSaved(true);
      setPreview(null);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  const onRestaurar = async () => {
    if (!confirm("¿Volver al fondo de mármol original? Se quita la imagen personalizada.")) return;
    setError("");
    setSaved(false);
    setRestaurando(true);
    try {
      await restaurarFondoOriginal();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al restaurar.");
    } finally {
      setRestaurando(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const mostrarUrl = preview ?? fondoActual ?? FONDO_POR_DEFECTO;

  return (
    <form onSubmit={onSubmit} style={s.card}>
      {error && <div style={s.errorBox}>{error}</div>}
      {saved && !error && (
        <div style={{ ...s.errorBox, background: "rgba(139,183,139,0.1)", borderColor: "rgba(139,183,139,0.35)", color: "#9fcf9f" }}>
          Guardado. Ya se ve como fondo en toda la página.
        </div>
      )}

      <label style={s.label}>Fondo actual</label>
      <img
        src={mostrarUrl}
        alt="Fondo del sitio"
        style={{ width: "100%", maxWidth: "420px", height: "220px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(201,168,118,0.22)", marginBottom: "10px", display: "block" }}
      />
      {!fondoActual && !preview && (
        <div style={s.helpText}>Este es el fondo de mármol original — todavía no has subido uno propio.</div>
      )}

      <label style={{ ...s.label, marginTop: "22px" }}>Subir imagen nueva</label>
      <input name="fondo" type="file" accept="image/*" onChange={onFileChange} className="admin-input" style={{ ...s.input, padding: "10px 14px" }} />
      <div style={s.helpText}>
        Se pone de fondo en toda la página (Información, Profesionales, Reservas, Productos y Checkout — el video del
        inicio no cambia). Usa una imagen clara y de buena calidad, idealmente horizontal.
      </div>

      <div style={{ ...s.formActions, alignItems: "center" }}>
        <button type="submit" disabled={submitting} className="admin-btn-primary" style={{ ...s.primaryButton, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Guardando..." : "Guardar fondo nuevo"}
        </button>
        {fondoActual && (
          <button
            type="button"
            onClick={onRestaurar}
            disabled={restaurando}
            className="admin-btn-secondary"
            style={{ ...s.secondaryButton, opacity: restaurando ? 0.7 : 1 }}
          >
            {restaurando ? "Restaurando..." : "Volver al fondo original"}
          </button>
        )}
      </div>
    </form>
  );
}
