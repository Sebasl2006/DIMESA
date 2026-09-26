"use client";

import { useState, useTransition } from "react";
import type { ResultadoAccion } from "@/lib/resultado";
import * as s from "./admin-styles";

interface DeleteButtonProps {
  action: () => Promise<ResultadoAccion>;
  confirmText: string;
}

export function DeleteButton({ action, confirmText }: DeleteButtonProps) {
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState("");

  const onClick = () => {
    if (!confirm(confirmText)) return;
    setError("");
    startTransition(async () => {
      try {
        const resultado = await action();
        if (!resultado.ok) setError(resultado.error);
      } catch {
        setError("No se pudo eliminar: falló la conexión con el servidor. Intenta de nuevo.");
      }
    });
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={pendiente}
        className="admin-btn-danger"
        style={{ ...s.dangerButton, opacity: pendiente ? 0.6 : 1, cursor: pendiente ? "default" : "pointer" }}
      >
        {pendiente ? "Eliminando..." : "Eliminar"}
      </button>
      {error && <span style={{ color: "#e0857a", fontSize: "12px", maxWidth: "260px" }}>{error}</span>}
    </div>
  );
}
