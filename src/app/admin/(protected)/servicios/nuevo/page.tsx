import { createClient } from "@/lib/supabase/server";
import { ServicioForm } from "../ServicioForm";
import { crearServicio } from "../actions";
import * as s from "../../../admin-styles";

export default async function NuevoServicioPage() {
  const supabase = await createClient();
  const { data: profesionales } = await supabase
    .from("profesionales")
    .select("id, nombre, especialidad, disponible")
    .order("created_at", { ascending: true });

  return (
    <div style={s.container}>
      <h1 style={s.h1}>Agregar servicio</h1>
      <ServicioForm profesionales={profesionales ?? []} action={crearServicio} />
    </div>
  );
}
