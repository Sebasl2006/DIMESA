"use client";

import * as s from "./admin-styles";

interface DeleteButtonProps {
  action: () => Promise<void>;
  confirmText: string;
}

export function DeleteButton({ action, confirmText }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      style={{ display: "inline" }}
    >
      <button type="submit" className="admin-btn-danger" style={s.dangerButton}>Eliminar</button>
    </form>
  );
}
