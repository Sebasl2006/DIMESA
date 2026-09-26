"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Profesional, Servicio } from "@/lib/types";
import type { ResultadoAccion } from "@/lib/resultado";
import { prepararImagenesDelFormulario } from "@/lib/comprimir-imagen-cliente";
import * as s from "../../admin-styles";

interface ServicioFormProps {
  servicio?: Servicio;
  profesionales: Pick<Profesional, "id" | "nombre" | "especialidad" | "disponible">[];
  action: (formData: FormData) => Promise<ResultadoAccion>;
}

export function ServicioForm({ servicio, profesionales, action }: ServicioFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Identificador de esta creación — evita que un reenvío duplique el servicio.
  const [idNuevo, setIdNuevo] = useState("");
  useEffect(() => {
    if (!servicio) setIdNuevo(crypto.randomUUID());
  }, [servicio]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await prepararImagenesDelFormulario(formData);
      // Si se guardó, el servidor mismo lleva a la lista (redirect) y este
      // formulario desaparece; solo hay algo que hacer aquí si falló.
      const resultado = await action(formData);
      if (resultado && !resultado.ok) {
        setSubmitting(false);
        setError(resultado.error);
      }
    } catch {
      setSubmitting(false);
      setError("No se pudo guardar: falló la conexión con el servidor. Revisa tu internet e intenta de nuevo.");
    }
  };

  return (
    <form onSubmit={onSubmit} style={s.card}>
      {error && <div style={s.errorBox}>{error}</div>}

      <input type="hidden" name="imagen_url_actual" defaultValue={servicio?.imagen_url ?? ""} />
      {!servicio && idNuevo && <input type="hidden" name="id" value={idNuevo} readOnly />}

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

      <label style={s.label}>Profesionales que hacen este servicio</label>
      {profesionales.length === 0 ? (
        <div style={s.helpText}>Todavía no hay profesionales. Agrégalas primero en la sección Profesionales.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "6px 0 4px" }}>
          {profesionales.map((p) => (
            <label key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#e8e2d5", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="profesionales_ids"
                value={p.id}
                defaultChecked={servicio?.profesionales_ids?.includes(p.id) ?? false}
                style={{ width: "16px", height: "16px", accentColor: "#c9a876" }}
              />
              {p.nombre}
              <span style={{ color: "#8a8580", fontSize: "12px" }}>
                {p.especialidad}
                {p.disponible ? "" : " · oculta en la página"}
              </span>
            </label>
          ))}
        </div>
      )}
      <div style={s.helpText}>
        Cuando un cliente elige &quot;Reservar con [profesional]&quot;, solo ve los servicios donde ella está marcada. Si no
        marcas a nadie, el servicio solo aparece cuando el cliente entra a Reservas directo, sin elegir profesional.
      </div>

      <label style={s.label}>Foto</label>
      {servicio?.imagen_url && (
        <Image
          src={servicio.imagen_url}
          alt={servicio.nombre}
          width={84}
          height={84}
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
