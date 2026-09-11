import { createClient } from "@/lib/supabase/server";
import type { Informacion } from "@/lib/types";
import { FondoForm } from "./FondoForm";
import * as s from "../../admin-styles";

export default async function FondoAdminPage() {
  const supabase = await createClient();
  const { data: informacion, error } = await supabase
    .from("informacion")
    .select("fondo_url")
    .eq("id", 1)
    .single();

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Fondo del sitio</h1>

      {error && (
        <div style={s.card}>
          <div style={s.errorBox}>
            No se pudo cargar el fondo actual: {error.message}. Confirma que ejecutaste
            supabase/informacion-fondo.sql en Supabase.
          </div>
        </div>
      )}

      {!error && informacion && (
        <FondoForm fondoActual={(informacion as Pick<Informacion, "fondo_url">).fondo_url} />
      )}
    </div>
  );
}
