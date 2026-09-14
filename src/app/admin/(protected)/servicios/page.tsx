import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Servicio } from "@/lib/types";
import { DeleteButton } from "../../DeleteButton";
import { eliminarServicio } from "./actions";
import * as s from "../../admin-styles";

const CATEGORIA_LABEL: Record<string, string> = {
  capilar: "Belleza y Salud Capilar",
  facial: "Cuidado Facial",
  corporal: "Tratamientos Corporales",
  masajes: "Masajes",
};

export default async function ServiciosAdminPage() {
  const supabase = await createClient();
  const { data: servicios, error } = await supabase
    .from("servicios")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={s.container}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ ...s.h1, margin: 0 }}>Servicios</h1>
        <Link href="/admin/servicios/nuevo" className="admin-btn-primary" style={s.primaryButton}>+ Agregar servicio</Link>
      </div>

      <div style={s.card}>
        {error && <div style={s.errorBox}>No se pudieron cargar los servicios: {error.message}</div>}

        {!error && (!servicios || servicios.length === 0) && (
          <p style={{ color: "#8a8580", fontSize: "14px" }}>Todavía no hay servicios. Agrega el primero.</p>
        )}

        {!error && servicios && servicios.length > 0 && (
          <table style={s.table} className="admin-table">
            <thead>
              <tr>
                <th style={s.th}>Foto</th>
                <th style={s.th}>Nombre</th>
                <th style={s.th}>Desde</th>
                <th style={s.th}>Categoría</th>
                <th style={s.th}>Especialista</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {(servicios as Servicio[]).map((sv) => (
                <tr key={sv.id}>
                  <td style={s.td}>
                    {sv.imagen_url ? (
                      <Image src={sv.imagen_url} alt={sv.nombre} width={48} height={48} style={s.thumb} />
                    ) : (
                      <div style={s.thumbPlaceholder}>Sin foto</div>
                    )}
                  </td>
                  <td style={s.td}>{sv.nombre}</td>
                  <td style={s.td}>${sv.precio_desde.toFixed(2)}</td>
                  <td style={s.td}>{CATEGORIA_LABEL[sv.categoria] ?? sv.categoria}</td>
                  <td style={s.td}>{sv.especialista || "—"}</td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link href={`/admin/servicios/${sv.id}/editar`} className="admin-btn-secondary" style={s.smallButton}>Editar</Link>
                      <DeleteButton
                        action={eliminarServicio.bind(null, sv.id)}
                        confirmText={`¿Eliminar "${sv.nombre}"? Esta acción no se puede deshacer.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
