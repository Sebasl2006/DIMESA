"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const onClick = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={onClick}
      className="admin-btn-secondary admin-logout-btn"
      title="Cerrar sesión"
      style={{
        background: "transparent",
        border: "1px solid rgba(201,168,118,0.22)",
        color: "#e6d3ac",
        borderRadius: "6px",
        padding: "8px 16px",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "12px",
        letterSpacing: "0.06em",
        cursor: "pointer",
      }}
    >
      Cerrar sesión
    </button>
  );
}
