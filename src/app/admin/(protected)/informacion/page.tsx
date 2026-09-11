import { createClient } from "@/lib/supabase/server";
import type { Informacion } from "@/lib/types";
import { InformacionForm } from "./InformacionForm";
import { actualizarInformacion } from "./actions";
import * as s from "../../admin-styles";

export default async function InformacionAdminPage() {
  const supabase = await createClient();
  const { data: informacion, error } = await supabase
    .from("informacion")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Información del local</h1>

      {error && (
        <div style={s.card}>
          <div style={s.errorBox}>
            No se pudo cargar la información: {error.message}. Confirma que ejecutaste supabase/informacion.sql en Supabase.
          </div>
        </div>
      )}

      {!error && informacion && (
        <InformacionForm informacion={informacion as Informacion} action={actualizarInformacion} />
      )}
    </div>
  );
}
