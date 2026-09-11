"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Servicio } from "@/lib/types";
import * as s from "../../admin-styles";

interface ServicioFormProps {
  servicio?: Servicio;
  action: (formData: FormData) => Promise<void>;
}

export function ServicioForm({ servicio, action }: ServicioFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await action(new FormData(e.currentTarget));
      router.push("/admin/servicios");
      router.refresh();
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar.");
    }
  };

  return (
    <form onSubmit={onSubmit} style={s.card}>
      {error && <div style={s.errorBox}>{error}</div>}

      <input type="hidden" name="imagen_url_actual" defaultValue={servicio?.imagen_url ?? ""} />

      <label style={s.label}>Nombre</label>
      <input name="nombre" required defaultValue={servicio?.nombre} className="admin-input" style={s.input} />

      <label style={s.label}>Descripción</label>
      <input name="descripcion" defaultValue={servicio?.descripcion} className="admin-input" style={s.input} />

      <label style={s.label}>Precio desde (USD)</label>
      <input name="precio_desde" type="number" step="0.01" min="0" required defaultValue={servicio?.precio_desde} className="admin-input" style={s.input} />

      <label style={s.label}>Categoría</label>
      <select name="categoria" defaultValue={servicio?.categoria ?? "capilar"} className="admin-input admin-select" style={s.input}>
        <option value="capilar">Belleza y Salud Capilar</option>
        <option value="facial">Cuidado Facial</option>
        <option value="corporal">Tratamientos Corporales</option>
        <option value="masajes">Masajes</option>
      </select>

      <label style={s.label}>Especialista (opcional)</label>
      <input name="especialista" defaultValue={servicio?.especialista ?? ""} className="admin-input" style={s.input} />

      <label style={s.label}>Foto</label>
      {servicio?.imagen_url && (
        <img
          src={servicio.imagen_url}
          alt={servicio.nombre}
          style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(201,168,118,0.22)", marginBottom: "10px", display: "block" }}
        />
      )}
      <input name="imagen" type="file" accept="image/*" className="admin-input" style={{ ...s.input, padding: "10px 14px" }} />
      <div style={s.helpText}>{servicio ? "Deja vacío para mantener la foto actual." : "Opcional. Si no subes foto, se muestra un cuadro con el nombre."}</div>

      <div style={s.formActions}>
        <button type="submit" disabled={submitting} className="admin-btn-primary" style={{ ...s.primaryButton, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Guardando..." : "Guardar servicio"}
        </button>
        <button type="button" onClick={() => router.push("/admin/servicios")} className="admin-btn-secondary" style={s.secondaryButton}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
