"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Profesional } from "@/lib/types";
import { partirBio } from "@/lib/bio";
import * as s from "../../admin-styles";

interface ProfesionalFormProps {
  profesional?: Profesional;
  action: (formData: FormData) => Promise<void>;
}

export function ProfesionalForm({ profesional, action }: ProfesionalFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { texto: bioTexto, frase: bioFrase } = partirBio(profesional?.bio ?? "");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await action(new FormData(e.currentTarget));
      router.push("/admin/profesionales");
      router.refresh();
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar.");
    }
  };

  return (
    <form onSubmit={onSubmit} style={s.card}>
      {error && <div style={s.errorBox}>{error}</div>}

      <input type="hidden" name="foto_url_actual" defaultValue={profesional?.foto_url ?? ""} />

      <label style={s.label}>Nombre</label>
      <input name="nombre" required defaultValue={profesional?.nombre} className="admin-input" style={s.input} />

      <label style={s.label}>Especialidad</label>
      <input
        name="especialidad"
        required
        list="especialidades-sugeridas"
        placeholder="Ej: Belleza y Salud Capilar"
        defaultValue={profesional?.especialidad}
        className="admin-input"
        style={s.input}
      />
      <datalist id="especialidades-sugeridas">
        <option value="Belleza y Salud Capilar" />
        <option value="Dermocosmiatría y Cosmetología" />
        <option value="Asesoría en Ventas y Atención" />
      </datalist>
      <div style={s.helpText}>Elige una sugerencia o escribe una especialidad distinta.</div>

      <label style={s.label}>Descripción / credenciales</label>
      <textarea
        name="descripcion"
        rows={5}
        defaultValue={profesional?.descripcion}
        className="admin-input"
        style={{ ...s.input, resize: "vertical", fontFamily: "inherit" }}
      />
      <div style={s.helpText}>Un salto de línea por certificación — uso interno, no sale en la página pública.</div>

      <label style={s.label}>Bio (página &quot;Ver información&quot;)</label>
      <textarea
        name="bio_texto"
        rows={4}
        placeholder='Ej: "Hola, soy [nombre]. Soy [título] con [X] horas de capacitación en [especialidad]..."'
        defaultValue={bioTexto}
        className="admin-input"
        style={{ ...s.input, resize: "vertical", fontFamily: "inherit" }}
      />
      <div style={s.helpText}>
        Un párrafo en primera persona, tono cercano — sale en la página de detalle cuando alguien hace clic en
        &quot;Ver información&quot; desde la lista de profesionales. Si lo dejas vacío, se arma uno automático a
        partir de las credenciales de arriba.
      </div>

      <label style={s.label}>Frase para la viñeta destacada (opcional)</label>
      <textarea
        name="bio_frase"
        rows={3}
        placeholder='Ej: "Voy a dejar tu piel y tu cabello tan suaves y cuidados que vas a querer volver a sentir esa sensación una y otra vez."'
        defaultValue={bioFrase}
        className="admin-input"
        style={{ ...s.input, resize: "vertical", fontFamily: "inherit" }}
      />
      <div style={s.helpText}>
        Esta frase aparece resaltada en un globito de texto junto a la foto, arriba del nombre. Si la dejas vacía,
        no aparece ningún globito — solo la bio de arriba.
      </div>

      <label style={s.label}>Foto</label>
      {profesional?.foto_url && (
        <Image
          src={profesional.foto_url}
          alt={profesional.nombre}
          width={84}
          height={84}
          style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(201,168,118,0.22)", marginBottom: "10px", display: "block" }}
        />
      )}
      <input name="foto" type="file" accept="image/*" className="admin-input" style={{ ...s.input, padding: "10px 14px" }} />
      <div style={s.helpText}>{profesional ? "Deja vacío para mantener la foto actual." : "Opcional. Si no subes foto, se muestra un cuadro con el nombre."}</div>

      <label style={{ display: "flex", alignItems: "center", gap: "10px", margin: "26px 0 0", fontSize: "13px", color: "#e8e2d5", cursor: "pointer" }}>
        <input type="checkbox" name="disponible" defaultChecked={profesional?.disponible ?? true} style={{ width: "16px", height: "16px", accentColor: "#c9a876" }} />
        Visible en la página pública
      </label>

      <div style={s.formActions}>
        <button type="submit" disabled={submitting} className="admin-btn-primary" style={{ ...s.primaryButton, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Guardando..." : "Guardar profesional"}
        </button>
        <button type="button" onClick={() => router.push("/admin/profesionales")} className="admin-btn-secondary" style={s.secondaryButton}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
