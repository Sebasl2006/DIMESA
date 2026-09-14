"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { MarcaInfo, Producto } from "@/lib/types";
import * as s from "../../admin-styles";

interface ProductoFormProps {
  producto?: Producto;
  marcas: MarcaInfo[];
  action: (formData: FormData) => Promise<void>;
}

export function ProductoForm({ producto, marcas, action }: ProductoFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [marcaNueva, setMarcaNueva] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await action(new FormData(e.currentTarget));
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Ocurrió un error al guardar.");
    }
  };

  return (
    <form onSubmit={onSubmit} style={s.card}>
      {error && <div style={s.errorBox}>{error}</div>}

      <input type="hidden" name="imagen_url_actual" defaultValue={producto?.imagen_url ?? ""} />

      <label style={s.label}>Nombre</label>
      <input name="nombre" required defaultValue={producto?.nombre} className="admin-input" style={s.input} />

      <label style={s.label}>Descripción</label>
      <input name="descripcion" defaultValue={producto?.descripcion} className="admin-input" style={s.input} />

      <label style={s.label}>Precio (USD)</label>
      <input name="precio" type="number" step="0.01" min="0" required defaultValue={producto?.precio} className="admin-input" style={s.input} />

      <label style={s.label}>Marca</label>
      <select
        name="marca"
        defaultValue={producto?.marca ?? marcas[0]?.slug}
        onChange={(e) => setMarcaNueva(e.target.value === "__nueva__")}
        className="admin-input admin-select"
        style={s.input}
      >
        {marcas.map((m) => (
          <option key={m.slug} value={m.slug}>{m.nombre}</option>
        ))}
        <option value="__nueva__">+ Agregar marca nueva…</option>
      </select>

      {marcaNueva && (
        <div style={{ marginTop: "4px", marginBottom: "18px", padding: "16px", border: "1px dashed rgba(201,168,118,0.35)", borderRadius: "8px" }}>
          <label style={s.label}>Nombre de la marca nueva</label>
          <input name="marca_nueva_nombre" required={marcaNueva} className="admin-input" style={s.input} placeholder="Ej: Kerastase" />

          <label style={s.label}>Foto de fondo para la marca (opcional)</label>
          <input name="marca_nueva_imagen" type="file" accept="image/*" className="admin-input" style={{ ...s.input, padding: "10px 14px", marginBottom: 0 }} />
          <div style={s.helpText}>
            Se usa como fondo del cuadro de esta marca en la sección Productos de la página. Si no subes una, ese
            cuadro muestra el nombre de la marca sobre un fondo oscuro hasta que subas una foto.
          </div>
        </div>
      )}

      <label style={s.label}>Foto</label>
      {producto?.imagen_url && (
        <Image
          src={producto.imagen_url}
          alt={producto.nombre}
          width={84}
          height={84}
          style={{ width: "84px", height: "84px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(201,168,118,0.22)", marginBottom: "10px", display: "block" }}
        />
      )}
      <input name="imagen" type="file" accept="image/*" className="admin-input" style={{ ...s.input, padding: "10px 14px" }} />
      <div style={s.helpText}>{producto ? "Deja vacío para mantener la foto actual." : "Opcional. Si no subes foto, se muestra un cuadro con el nombre."}</div>

      <label style={{ display: "flex", alignItems: "center", gap: "10px", margin: "26px 0 0", fontSize: "13px", color: "#e8e2d5", cursor: "pointer" }}>
        <input type="checkbox" name="disponible" defaultChecked={producto?.disponible ?? true} style={{ width: "16px", height: "16px", accentColor: "#c9a876" }} />
        Disponible en la tienda
      </label>

      <div style={s.formActions}>
        <button type="submit" disabled={submitting} className="admin-btn-primary" style={{ ...s.primaryButton, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Guardando..." : "Guardar producto"}
        </button>
        <button type="button" onClick={() => router.push("/admin/productos")} className="admin-btn-secondary" style={s.secondaryButton}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
