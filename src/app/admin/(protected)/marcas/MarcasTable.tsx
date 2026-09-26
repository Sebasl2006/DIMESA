"use client";

import { Fragment, useState, useTransition } from "react";
import Image from "next/image";
import type { MarcaInfo } from "@/lib/types";
import { eliminarMarca } from "../productos/actions";
import * as s from "../../admin-styles";

export function MarcasTable({ marcas, conteoPorMarca }: { marcas: MarcaInfo[]; conteoPorMarca: Record<string, number> }) {
  const [abierta, setAbierta] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const [borrando, startTransition] = useTransition();

  if (marcas.length === 0) {
    return <p style={{ color: "#8a8580", fontSize: "14px" }}>Todavía no hay marcas.</p>;
  }

  const cerrar = () => {
    setAbierta(null);
    setTexto("");
    setError("");
  };

  const abrir = (slug: string) => {
    setAbierta(slug);
    setTexto("");
    setError("");
  };

  const confirmar = (marca: MarcaInfo) => {
    setError("");
    startTransition(async () => {
      try {
        const resultado = await eliminarMarca(marca.slug, texto);
        if (!resultado.ok) {
          setError(resultado.error);
          return;
        }
        cerrar();
      } catch {
        setError("No se pudo borrar la marca: falló la conexión con el servidor. Intenta de nuevo.");
      }
    });
  };

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
          const coincide = texto.trim().toLowerCase() === m.nombre.trim().toLowerCase();
          return (
            <Fragment key={m.slug}>
              <tr>
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
                  {abierta !== m.slug && (
                    <button type="button" onClick={() => abrir(m.slug)} className="admin-btn-danger" style={s.dangerButton}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
              {abierta === m.slug && (
                <tr>
                  <td style={s.td} colSpan={4}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "6px 0" }}>
                      <div style={{ color: "#e8e2d5", fontSize: "14px", lineHeight: 1.6 }}>
                        Se va a borrar la marca <strong>{m.nombre}</strong>
                        {cantidad > 0
                          ? `, sus ${cantidad} producto${cantidad === 1 ? "" : "s"}`
                          : " (no tiene productos)"}{" "}
                        y todas sus fotos. <strong>No se puede deshacer.</strong> Para confirmar, escribe el nombre de la
                        marca: <strong>{m.nombre}</strong>
                      </div>
                      <input
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder={m.nombre}
                        disabled={borrando}
                        className="admin-input"
                        style={{ ...s.input, margin: 0, maxWidth: "360px" }}
                      />
                      {error && <div style={s.errorBox}>{error}</div>}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={() => confirmar(m)}
                          disabled={!coincide || borrando}
                          className="admin-btn-danger"
                          style={{ ...s.dangerButton, opacity: !coincide || borrando ? 0.5 : 1 }}
                        >
                          {borrando ? "Borrando..." : "Borrar definitivamente"}
                        </button>
                        <button
                          type="button"
                          onClick={cerrar}
                          disabled={borrando}
                          className="admin-btn-secondary"
                          style={s.smallButton}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
