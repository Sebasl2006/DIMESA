"use client";

import { useTransition } from "react";
import { actualizarEstadoEnvio } from "./actions";
import * as s from "../../admin-styles";

const OPCIONES = [
  { valor: "enviado", label: "Marcar como enviado" },
  { valor: "finalizado", label: "Marcar como finalizado" },
] as const;

export function EstadoEnvioButtons({ id, estadoActual }: { id: string; estadoActual: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {OPCIONES.map((op) => {
        const activo = estadoActual === op.valor;
        return (
          <button
            key={op.valor}
            type="button"
            disabled={activo || isPending}
            onClick={() => startTransition(() => { actualizarEstadoEnvio(id, op.valor); })}
            className="admin-btn-secondary"
            style={{ ...s.smallButton, opacity: activo || isPending ? 0.5 : 1, cursor: activo || isPending ? "default" : "pointer" }}
          >
            {activo ? "✓ " : ""}{op.label}
          </button>
        );
      })}
    </div>
  );
}
