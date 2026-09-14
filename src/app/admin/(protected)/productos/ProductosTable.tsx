"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MarcaInfo, Producto } from "@/lib/types";
import { DeleteButton } from "../../DeleteButton";
import { eliminarProducto } from "./actions";
import * as s from "../../admin-styles";

export function ProductosTable({ productos, marcas }: { productos: Producto[]; marcas: MarcaInfo[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [marca, setMarca] = useState("");
  const marcaLabel = useMemo(() => Object.fromEntries(marcas.map((m) => [m.slug, m.nombre])), [marcas]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      if (marca && p.marca !== marca) return false;
      if (q && !p.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [productos, busqueda, marca]);

  return (
    <>
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar producto por nombre..."
          className="admin-input"
          style={{ ...s.input, flex: 1, minWidth: "220px", margin: 0 }}
        />
        <select
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          className="admin-input admin-select"
          style={{ ...s.input, width: "220px", margin: 0 }}
        >
          <option value="">Todas las marcas</option>
          {marcas.map((m) => (
            <option key={m.slug} value={m.slug}>{m.nombre}</option>
          ))}
        </select>
      </div>

      {filtrados.length === 0 && (
        <p style={{ color: "#8a8580", fontSize: "14px" }}>
          {busqueda || marca ? "Ningún producto coincide con ese filtro." : "Todavía no hay productos. Agrega el primero."}
        </p>
      )}

      {filtrados.length > 0 && (
        <table style={s.table} className="admin-table">
          <thead>
            <tr>
              <th style={s.th}>Foto</th>
              <th style={s.th}>Nombre</th>
              <th style={s.th}>Precio</th>
              <th style={s.th}>Marca</th>
              <th style={s.th}>Disponible</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id}>
                <td style={s.td}>
                  {p.imagen_url ? (
                    // width/height=48 (no "fill") le piden a Next.js una miniatura
                    // real de ese tamaño en vez de bajar la foto original completa
                    // (varios MB) y encogerla solo con CSS — esto es lo que hacía
                    // lenta la carga de esta tabla con muchos productos.
                    <Image src={p.imagen_url} alt={p.nombre} width={48} height={48} style={s.thumb} />
                  ) : (
                    <div style={s.thumbPlaceholder}>Sin foto</div>
                  )}
                </td>
                <td style={s.td}>{p.nombre}</td>
                <td style={s.td}>${p.precio.toFixed(2)}</td>
                <td style={s.td}>{marcaLabel[p.marca] ?? p.marca}</td>
                <td style={s.td}>
                  <span style={s.badge(p.disponible)}>{p.disponible ? "Sí" : "No"}</span>
                </td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Link href={`/admin/productos/${p.id}/editar`} className="admin-btn-secondary" style={s.smallButton}>Editar</Link>
                    <DeleteButton
                      action={eliminarProducto.bind(null, p.id)}
                      confirmText={`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
