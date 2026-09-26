"use client";

import { useState, useTransition } from "react";
import { actualizarEstadoEnvio } from "./actions";
import * as s from "../../admin-styles";

const OPCIONES = [
  { valor: "enviado", label: "Marcar como enviado" },
  { valor: "finalizado", label: "Marcar como finalizado" },
] as const;

export function EstadoEnvioButtons({ id, estadoActual }: { id: string; estadoActual: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const cambiar = (valor: string) => {
    setError("");
    startTransition(async () => {
      try {
        const resultado = await actualizarEstadoEnvio(id, valor);
        if (!resultado.ok) setError(resultado.error);
      } catch {
        setError("No se pudo cambiar el estado: falló la conexión con el servidor. Intenta de nuevo.");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "10px" }}>
        {OPCIONES.map((op) => {
          const activo = estadoActual === op.valor;
          return (
            <button
              key={op.valor}
              type="button"
              disabled={activo || isPending}
              onClick={() => cambiar(op.valor)}
              className="admin-btn-secondary"
              style={{ ...s.smallButton, opacity: activo || isPending ? 0.5 : 1, cursor: activo || isPending ? "default" : "pointer" }}
            >
              {activo ? "✓ " : ""}{op.label}
            </button>
          );
        })}
      </div>
      {error && <span style={{ color: "#e0857a", fontSize: "12px" }}>{error}</span>}
    </div>
  );
}
