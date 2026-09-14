"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Producto } from "@/lib/types";
import * as s from "../../admin-styles";

interface ProductoFormProps {
  producto?: Producto;
  action: (formData: FormData) => Promise<void>;
}

export function ProductoForm({ producto, action }: ProductoFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      <select name="marca" defaultValue={producto?.marca ?? "botanique"} className="admin-input admin-select" style={s.input}>
        <option value="botanique">Botaniqué</option>
        <option value="revlon">Revlon</option>
        <option value="mq_professional">M|Q Professional</option>
        <option value="truss">TRUSS</option>
        <option value="olaplex">Olaplex</option>
      </select>

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
