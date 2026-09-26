import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Profesional } from "@/lib/types";
import { DeleteButton } from "../../DeleteButton";
import { eliminarProfesional } from "./actions";
import * as s from "../../admin-styles";

export default async function ProfesionalesAdminPage() {
  const supabase = await createClient();
  const { data: profesionales, error } = await supabase
    .from("profesionales")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div style={s.container}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1 style={{ ...s.h1, margin: 0 }}>Profesionales</h1>
        <Link href="/admin/profesionales/nuevo" prefetch={false} className="admin-btn-primary" style={s.primaryButton}>+ Agregar profesional</Link>
      </div>

      <div style={s.card}>
        {error && <div style={s.errorBox}>No se pudieron cargar los profesionales: {error.message}</div>}

        {!error && (!profesionales || profesionales.length === 0) && (
          <p style={{ color: "#8a8580", fontSize: "14px" }}>Todavía no hay profesionales. Agrega el primero.</p>
        )}

        {!error && profesionales && profesionales.length > 0 && (
          <table style={s.table} className="admin-table">
            <thead>
              <tr>
                <th style={s.th}>Foto</th>
                <th style={s.th}>Nombre</th>
                <th style={s.th}>Especialidad</th>
                <th style={s.th}>Descripción</th>
                <th style={s.th}>Disponible</th>
                <th style={s.th}></th>
              </tr>
            </thead>
            <tbody>
              {(profesionales as Profesional[]).map((p) => (
                <tr key={p.id}>
                  <td style={s.td}>
                    {p.foto_url ? (
                      <Image src={p.foto_url} alt={p.nombre} width={48} height={48} style={s.thumb} />
                    ) : (
                      <div style={s.thumbPlaceholder}>Sin foto</div>
                    )}
                  </td>
                  <td style={s.td}>{p.nombre}</td>
                  <td style={s.td}>{p.especialidad}</td>
                  <td style={{ ...s.td, maxWidth: "260px" }}>{p.descripcion || "—"}</td>
                  <td style={s.td}>
                    <span style={s.badge(p.disponible)}>{p.disponible ? "Sí" : "No"}</span>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link href={`/admin/profesionales/${p.id}/editar`} prefetch={false} className="admin-btn-secondary" style={s.smallButton}>Editar</Link>
                      <DeleteButton
                        action={eliminarProfesional.bind(null, p.id)}
                        confirmText={`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`}
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
