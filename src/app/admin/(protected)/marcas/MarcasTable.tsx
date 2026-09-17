"use client";

import Image from "next/image";
import type { MarcaInfo } from "@/lib/types";
import { DeleteButton } from "../../DeleteButton";
import { eliminarMarca } from "../productos/actions";
import * as s from "../../admin-styles";

export function MarcasTable({ marcas, conteoPorMarca }: { marcas: MarcaInfo[]; conteoPorMarca: Record<string, number> }) {
  if (marcas.length === 0) {
    return <p style={{ color: "#8a8580", fontSize: "14px" }}>Todavía no hay marcas.</p>;
  }

  return (
    <table style={s.table} className="admin-table">
      <thead>
        <tr>
          <th style={s.th}>Foto</th>
          <th style={s.th}>Nombre</th>
          <th style={s.th}>Productos</th>
          <th style={s.th}></th>
        </tr>
      </thead>
      <tbody>
        {marcas.map((m) => {
          const cantidad = conteoPorMarca[m.slug] ?? 0;
          return (
            <tr key={m.slug}>
              <td style={s.td}>
                {m.imagen_url ? (
                  <Image src={m.imagen_url} alt={m.nombre} width={48} height={48} style={s.thumb} />
                ) : (
                  <div style={s.thumbPlaceholder}>Sin foto</div>
                )}
              </td>
              <td style={s.td}>{m.nombre}</td>
              <td style={s.td}>{cantidad}</td>
              <td style={s.td}>
                {cantidad === 0 ? (
                  <DeleteButton
                    action={eliminarMarca.bind(null, m.slug)}
                    confirmText={`¿Eliminar la marca "${m.nombre}"? Esta acción no se puede deshacer.`}
                  />
                ) : (
                  <span style={{ color: "#8a8580", fontSize: "12px" }}>
                    Bórrale los productos primero
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
